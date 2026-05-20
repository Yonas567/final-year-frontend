export const queryKeys = {
  events: {
    recent: (n: number) => ["events", "recent", n] as const,
  },
  predict: {
    history: (limit: number) => ["predict", "history", limit] as const,
  },
  samples: {
    list: (page: number) => ["samples", "list", page] as const,
  },
};
