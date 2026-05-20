"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getWebSocketUrl } from "@/lib/api/config";
import type { WsAlertMessage, WsSensorMessage } from "@/lib/api/types";
import { useRecentEventsQuery } from "@/hooks/queries/events";
import {
  usePredictionHistoryQuery,
  useRunPredictionMutation,
} from "@/hooks/queries/predict";
import { queryKeys } from "@/hooks/queries/keys";
import type {
  AlertLevel,
  DataSample,
  PredictionRecord,
  SeismicEvent,
  SensorReading,
  WsStatus,
} from "@/types/seismo";

const RECENT_EVENTS_N = 20;

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

function alertToEvent(data: WsAlertMessage["data"]): SeismicEvent {
  return {
    id: data.id,
    time: data.time,
    magnitude: data.magnitude,
    level: data.level,
    location: data.location,
    depth: data.depth,
    lat: data.lat,
    lon: data.lon,
  };
}

export function useSensorData() {
  const queryClient = useQueryClient();
  const { data: apiEvents = [], isLoading: eventsLoading } =
    useRecentEventsQuery(RECENT_EVENTS_N);

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
  const [liveEvents, setLiveEvents] = useState<SeismicEvent[]>([]);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [lastAlert, setLastAlert] = useState<SeismicEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const clearAlert = useCallback(() => setLastAlert(null), []);

  const events = useMemo(() => {
    const seen = new Set<string | number>();
    const merged: SeismicEvent[] = [];
    for (const e of [...liveEvents, ...apiEvents]) {
      const key = String(e.id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(e);
    }
    return merged.slice(0, 50);
  }, [liveEvents, apiEvents]);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const wsUrl = getWebSocketUrl();

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setWsStatus("connecting");

      ws.onopen = () => setWsStatus("open");
      ws.onclose = () => {
        setWsStatus("closed");
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data as string) as
            | WsSensorMessage
            | WsAlertMessage;

          if (msg.type === "sensor") {
            const { data } = msg;
            const pga = data.pga ?? data.magnitude ?? 0;
            setReadings({
              x: data.x,
              y: data.y,
              z: data.z,
              magnitude: data.magnitude,
              pga,
              timestamp: Date.now(),
            });
            setWaveHistory((prev) => {
              const n = [...prev, pga - 0.98];
              n.shift();
              return n;
            });
            setAlertLevel(data.level || "none");
          }

          if (msg.type === "alert") {
            const event = alertToEvent(msg.data);
            setLiveEvents((prev) => [event, ...prev].slice(0, 50));
            setLastAlert(event);
            queryClient.setQueryData(
              queryKeys.events.recent(RECENT_EVENTS_N),
              (old: SeismicEvent[] | undefined) => {
                const prev = old ?? [];
                if (prev.some((x) => String(x.id) === String(event.id)))
                  return prev;
                return [event, ...prev].slice(0, RECENT_EVENTS_N);
              },
            );
            void queryClient.invalidateQueries({
              queryKey: queryKeys.events.recent(RECENT_EVENTS_N),
            });
          }
        } catch {
          /* ignore malformed frames */
        }
      };
    };

    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [queryClient]);

  return {
    readings,
    waveHistory,
    alertLevel,
    events,
    wsStatus,
    eventsLoading,
    lastAlert,
    clearAlert,
  };
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
  const historyQuery = usePredictionHistoryQuery();
  const predictMutation = useRunPredictionMutation();

  const history = historyQuery.data ?? [];

  const prediction =
    predictMutation.data ??
    history[0] ??
    EMPTY_PREDICTION;

  const runPrediction = useCallback(
    async (opts?: { deviceId?: string; windowSeconds?: number }) => {
      await predictMutation.mutateAsync(opts ?? {});
    },
    [predictMutation],
  );

  return {
    prediction,
    loading: predictMutation.isPending || historyQuery.isLoading,
    runPrediction,
    history,
    historyLoading: historyQuery.isLoading,
  };
}

/** Local-only samples for charts before ingest; not mock API data. */
export const HISTORICAL_DATA: DataSample[] = [];
