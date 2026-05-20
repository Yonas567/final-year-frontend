import { apiFetch, apiFetchFormData } from "./client";
import type {
  IngestBatchRequest,
  IngestBatchResponse,
  IngestExcelResponse,
  IngestRequest,
  IngestResponse,
  PredictHistoryResponse,
  PredictRequest,
  PredictResponse,
  RecentEventsResponse,
  SamplesResponse,
} from "./types";
import type { PredictionRecord } from "@/types/seismo";

export function fetchRecentEvents(n = 20) {
  return apiFetch<RecentEventsResponse>(`/events/recent?n=${n}`);
}

export function postPredict(body: PredictRequest = {}) {
  return apiFetch<PredictResponse>("/predict", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchPredictHistory(limit = 10) {
  return apiFetch<PredictHistoryResponse>(
    `/predict/history?limit=${limit}`,
  );
}

export function postIngest(body: IngestRequest) {
  return apiFetch<IngestResponse>("/ingest", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchSamples(page = 1) {
  const p = Math.max(1, Math.floor(page));
  return apiFetch<SamplesResponse>(`/samples?page=${p}`);
}

export function postIngestExcel(file: File, deviceId?: string) {
  const form = new FormData();
  form.append("file", file);
  if (deviceId) form.append("deviceId", deviceId);
  return apiFetchFormData<IngestExcelResponse>("/ingest/excel", form);
}

export function postIngestBatch(body: IngestBatchRequest) {
  return apiFetch<IngestBatchResponse>("/ingest/batch", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function mapPredictHistoryItem(
  item: PredictHistoryResponse["data"][number],
): PredictionRecord {
  return {
    id: item.id,
    timestamp: item.timestamp,
    magnitude: item.magnitude,
    probability: item.probability,
    confidence: item.confidence,
    region: item.region,
    risk: item.risk,
  };
}

export function mapPredictData(
  data: PredictResponse["data"],
): PredictionRecord {
  return {
    id: data.id,
    timestamp: data.timestamp,
    probability: data.probability,
    magnitude: data.magnitude,
    confidence: data.confidence,
    region: data.region,
    coords: data.coords,
    risk: data.risk,
    features: data.features,
  };
}
