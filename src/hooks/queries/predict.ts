"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPredictHistory,
  mapPredictData,
  mapPredictHistoryItem,
  postPredict,
} from "@/lib/api/endpoints";
import { DEFAULT_DEVICE_ID } from "@/lib/api/config";
import type { PredictRequest } from "@/lib/api/types";
import type { PredictionRecord } from "@/types/seismo";
import { queryKeys } from "./keys";

const HISTORY_LIMIT = 10;

export function usePredictionHistoryQuery(limit = HISTORY_LIMIT) {
  return useQuery({
    queryKey: queryKeys.predict.history(limit),
    queryFn: async () => {
      const res = await fetchPredictHistory(limit);
      return res.data.map(mapPredictHistoryItem);
    },
    staleTime: 30_000,
  });
}

export function useRunPredictionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: PredictRequest = {}) => {
      const res = await postPredict({
        deviceId: body.deviceId ?? DEFAULT_DEVICE_ID,
        windowSeconds: body.windowSeconds ?? 60,
      });
      return mapPredictData(res.data);
    },
    onSuccess: (prediction) => {
      queryClient.setQueryData<PredictionRecord[]>(
        queryKeys.predict.history(HISTORY_LIMIT),
        (old) => {
          const prev = old ?? [];
          const without = prev.filter((p) => p.id !== prediction.id);
          return [prediction, ...without].slice(0, HISTORY_LIMIT);
        },
      );
    },
  });
}
