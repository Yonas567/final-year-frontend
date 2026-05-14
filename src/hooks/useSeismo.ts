import { useState, useEffect, useRef, useCallback } from "react";
import type {
  AlertLevel,
  DataSample,
  PredictionRecord,
  SeismicEvent,
  SensorReading,
  WsStatus,
} from "@/types/seismo";

/** Single env: backend base URL (e.g. http://localhost:5000). WebSocket uses same host at /ws. */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function webSocketUrl(apiBase: string): string {
  try {
    const url = new URL(apiBase);
    const wsProto = url.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${url.host}/ws`;
  } catch {
    return "ws://localhost:5000/ws";
  }
}

const WS_URL = webSocketUrl(API_BASE);

/** Quiet baseline trace so the waveform panel is never a flat empty line before live data arrives. */
function idleWaveSamples(length = 200): number[] {
  return Array.from({ length }, (_, i) => {
    const t = i * 0.08;
    return (
      Math.sin(t * 1.4) * 0.06 +
      Math.sin(t * 3.1) * 0.025 +
      Math.sin(i * 0.21) * 0.012
    );
  });
}

/** Shown in Recent Events until the API returns real rows (then replaced). */
const FALLBACK_EVENTS: SeismicEvent[] = [
  {
    id: 1,
    time: "2025-01-15T04:12:33Z",
    magnitude: 2.1,
    level: "mild",
    location: "Awash Valley",
    depth: "8.2",
    lat: "8.921",
    lon: "40.102",
  },
  {
    id: 2,
    time: "2025-01-15T01:55:08Z",
    magnitude: 3.6,
    level: "moderate",
    location: "Lake Turkana Rift",
    depth: "12.5",
    lat: "9.115",
    lon: "40.533",
  },
  {
    id: 3,
    time: "2025-01-14T22:41:00Z",
    magnitude: 1.8,
    level: "mild",
    location: "Addis Ababa Basin",
    depth: "5.1",
    lat: "9.022",
    lon: "38.747",
  },
  {
    id: 4,
    time: "2025-01-14T18:22:15Z",
    magnitude: 2.9,
    level: "mild",
    location: "Blue Nile Gorge",
    depth: "9.8",
    lat: "10.21",
    lon: "38.742",
  },
  {
    id: 5,
    time: "2025-01-14T14:07:44Z",
    magnitude: 4.1,
    level: "moderate",
    location: "Central Rift Valley",
    depth: "15.3",
    lat: "8.450",
    lon: "39.510",
  },
];

export function useSensorData() {
  const [readings, setReadings] = useState<SensorReading>({
    x: 0.02,
    y: 0.01,
    z: 0.98,
    magnitude: 0.02,
    pga: 0.02,
    timestamp: Date.now(),
  });
  const [waveHistory, setWaveHistory] = useState<number[]>(() =>
    idleWaveSamples(200),
  );
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("none");
  const [events, setEvents] = useState<SeismicEvent[]>(FALLBACK_EVENTS);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => setWsStatus("open");
      ws.onclose = () => {
        setWsStatus("closed");
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const { type, data } = JSON.parse(e.data as string) as {
            type: string;
            data: Record<string, unknown>;
          };
          if (type === "sensor") {
            const pga =
              (data.pga as number | undefined) ??
              (data.magnitude as number | undefined) ??
              0;
            setReadings({
              x: data.x as number,
              y: data.y as number,
              z: data.z as number,
              magnitude: data.magnitude as number,
              pga,
              timestamp: Date.now(),
            });
            setWaveHistory((prev) => {
              const n = [...prev, pga - 0.98];
              n.shift();
              return n;
            });
            setAlertLevel((data.level as AlertLevel) || "none");
          }
          if (type === "alert") {
            setEvents((prev) =>
              [
                {
                  ...(data as unknown as SeismicEvent),
                  id: (data as { _id?: string })._id || Date.now(),
                },
                ...prev,
              ].slice(0, 50),
            );
          }
        } catch {
          /* ignore */
        }
      };
    };
    connect();
    fetch(`${API_BASE}/api/events/recent?n=20`)
      .then((r) => r.json())
      .then((body: { data?: SeismicEvent[] }) => {
        if (body.data?.length)
          setEvents(
            body.data.map((e) => ({
              ...e,
              id: (e as { _id?: string })._id || e.id,
            })),
          );
      })
      .catch(() => {});
    return () => {
      wsRef.current?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return { readings, waveHistory, alertLevel, events, wsStatus };
}

export function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const EMPTY_PREDICTION: PredictionRecord = {
  probability: 0,
  magnitude: 0,
  confidence: 0,
  region: "—",
  risk: "low",
  timestamp: new Date().toISOString(),
  features: { stalta: 0, pWave: 0, energy: 0, freqPeak: 0 },
};

export function usePrediction() {
  const [prediction, setPrediction] =
    useState<PredictionRecord>(EMPTY_PREDICTION);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PredictionRecord[]>([]);

  const runPrediction = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/predict`, { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        data?: PredictionRecord & { _id?: string };
      };
      if (json.ok && json.data) {
        const newPred: PredictionRecord = {
          ...json.data,
          id: json.data._id || Date.now(),
        };
        setPrediction(newPred);
        setHistory((prev) => [newPred, ...prev].slice(0, 20));
      }
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/predict/history?limit=10`)
      .then((r) => r.json())
      .then((body: { data?: PredictionRecord[] }) => {
        if (body.data?.length) setHistory(body.data);
      })
      .catch(() => {});
  }, []);

  return { prediction, loading, runPrediction, history };
}

export function useDataCollection() {
  const [collected, setCollected] = useState(HISTORICAL_DATA);
  const [recording, setRecording] = useState(false);
  const startRecording = useCallback(() => setRecording(true), []);
  const stopRecording = useCallback(() => setRecording(false), []);
  const addSample = useCallback((sample: DataSample) => {
    setCollected((prev) => [...prev, sample].slice(-500));
  }, []);
  return { collected, recording, startRecording, stopRecording, addSample };
}

export async function sendTelegramTest() {
  const res = await fetch(`${API_BASE}/api/alerts/test`, { method: "POST" });
  return res.json();
}

export async function updateAlertConfig(config: unknown) {
  const res = await fetch(`${API_BASE}/api/alerts/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return res.json();
}

export const HISTORICAL_DATA: DataSample[] = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date(Date.now() - (120 - i) * 30000).toISOString(),
  x: parseFloat((Math.random() * 0.15).toFixed(4)),
  y: parseFloat((Math.random() * 0.12).toFixed(4)),
  z: parseFloat((0.95 + Math.random() * 0.1).toFixed(4)),
  magnitude: parseFloat((Math.random() * 0.1).toFixed(4)),
  label: Math.random() < 0.08 ? 1 : 0,
}));
