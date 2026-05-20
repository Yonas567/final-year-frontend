"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSamples } from "@/lib/api/endpoints";
import { queryKeys } from "./keys";

export function useSamplesQuery(page = 1) {
  const safePage = Math.max(1, Math.floor(page));

  return useQuery({
    queryKey: queryKeys.samples.list(safePage),
    queryFn: () => fetchSamples(safePage),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}
