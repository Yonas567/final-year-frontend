"use client";

import PredictionsPage from "@/views/Predictions";
import { useSeismo } from "@/context/SeismoContext";

export default function Page() {
  const { prediction, loading, runPrediction, history } = useSeismo();
  return (
    <PredictionsPage
      prediction={prediction}
      loading={loading}
      runPrediction={runPrediction}
      history={history}
    />
  );
}
