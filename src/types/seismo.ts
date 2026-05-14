export type AlertLevel = "none" | "mild" | "moderate" | "strong";

export type EventLevel = "mild" | "moderate" | "strong";

export interface SeismicEvent {
  id: number | string;
  time: string;
  magnitude: number;
  level: EventLevel;
  location: string;
  depth: string;
  lat?: string;
  lon?: string;
}

export interface SensorReading {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  pga: number;
  timestamp: number;
}

export type WsStatus = "connecting" | "open" | "closed";

export interface PredictionRecord {
  probability: number;
  magnitude: number;
  confidence: number;
  region: string;
  coords?: string;
  risk: "low" | "moderate" | "high";
  timestamp: string;
  id?: number | string;
  features?: {
    stalta: number;
    pWave: number;
    energy: number;
    freqPeak: number;
  };
}

export interface DataSample {
  id: number;
  timestamp: string;
  x: number;
  y: number;
  z: number;
  magnitude: number;
  label: number;
}
