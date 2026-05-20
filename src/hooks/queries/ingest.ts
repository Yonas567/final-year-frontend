"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postIngest, postIngestBatch, postIngestExcel } from "@/lib/api/endpoints";
import { queryKeys } from "./keys";
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

export function useIngestExcelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      deviceId,
    }: {
      file: File;
      deviceId?: string;
    }) => postIngestExcel(file, deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["samples"] });
    },
  });
}
