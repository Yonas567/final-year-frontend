"use client";

import { useMutation } from "@tanstack/react-query";
import { postIngest, postIngestBatch } from "@/lib/api/endpoints";
import type { IngestBatchRequest, IngestRequest } from "@/lib/api/types";

export function useIngestMutation() {
  return useMutation({
    mutationFn: (body: IngestRequest) => postIngest(body),
  });
}

export function useIngestBatchMutation() {
  return useMutation({
    mutationFn: (body: IngestBatchRequest) => postIngestBatch(body),
  });
}
