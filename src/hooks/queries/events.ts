"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecentEvents } from "@/lib/api/endpoints";
import { queryKeys } from "./keys";

export function useRecentEventsQuery(n = 20) {
  return useQuery({
    queryKey: queryKeys.events.recent(n),
    queryFn: async () => {
      const res = await fetchRecentEvents(n);
      return res.data;
    },
    staleTime: 30_000,
  });
}
