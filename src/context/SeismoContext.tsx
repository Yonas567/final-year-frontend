"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePrediction, useSensorData } from "@/hooks/useSeismo";
import type {
  AlertLevel,
  PredictionRecord,
  SeismicEvent,
  SensorReading,
  WsStatus,
} from "@/types/seismo";

export interface SeismoContextValue {
  readings: SensorReading;
  waveHistory: number[];
  alertLevel: AlertLevel;
  events: SeismicEvent[];
  wsStatus: WsStatus;
  lastAlert: SeismicEvent | null;
  clearAlert: () => void;
  prediction: PredictionRecord;
  loading: boolean;
  runPrediction: () => Promise<void>;
  history: PredictionRecord[];
}

const SeismoContext = createContext<SeismoContextValue | null>(null);

export function SeismoProvider({ children }: { children: ReactNode }) {
  const sensor = useSensorData();
  const pred = usePrediction();
  const value: SeismoContextValue = { ...sensor, ...pred };
  return (
    <SeismoContext.Provider value={value}>{children}</SeismoContext.Provider>
  );
}

export function useSeismo(): SeismoContextValue {
  const ctx = useContext(SeismoContext);
  if (!ctx) throw new Error("useSeismo must be used within SeismoProvider");
  return ctx;
}
