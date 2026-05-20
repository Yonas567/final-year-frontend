import type { EventLevel, PredictionRecord, SeismicEvent } from "@/types/seismo";

export interface ApiErrorBody {
  ok: false;
  error: string;
  code?: string;
}

export interface RecentEventsResponse {
  data: SeismicEvent[];
}

export interface PredictRequest {
  deviceId?: string;
  windowSeconds?: number;
}

export interface PredictResponse {
  ok: true;
  data: PredictionRecord & { id: string; timestamp: string };
}

export interface PredictHistoryItem {
  id: string;
  timestamp: string;
  magnitude: number;
  probability: number;
  region: string;
  risk: "low" | "moderate" | "high";
  confidence: number;
}

export interface PredictHistoryResponse {
  data: PredictHistoryItem[];
}

export interface IngestRequest {
  deviceId: string;
  x: number;
  y: number;
  z: number;
  timestamp?: string | number;
}

export interface IngestResponse {
  ok: true;
  id: string;
}

export interface IngestBatchSample {
  t: number;
  x: number;
  y: number;
  z: number;
}

export interface IngestBatchRequest {
  deviceId: string;
  samples: IngestBatchSample[];
}

export interface IngestBatchResponse {
  ok: true;
  accepted: number;
}

export interface IngestExcelResponse {
  ok: true;
  accepted: number;
  skipped: number;
  errors?: string[];
}

export interface WsSensorMessage {
  type: "sensor";
  data: {
    deviceId: string;
    x: number;
    y: number;
    z: number;
    magnitude: number;
    pga: number;
    level: "none" | EventLevel;
  };
}

export interface WsAlertMessage {
  type: "alert";
  data: {
    id: string;
    time: string;
    magnitude: number;
    level: EventLevel;
    location: string;
    depth: string;
    lat: string;
    lon: string;
  };
}

export type WsMessage = WsSensorMessage | WsAlertMessage;

export interface SensorSample {
  id: string;
  deviceId: string;
  timestamp: string;
  x: number;
  y: number;
  z: number;
  magnitude: number;
  pga: number;
  label: number | null;
}

export interface SamplesResponse {
  data: SensorSample[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
