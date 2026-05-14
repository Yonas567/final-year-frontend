"use client";

import PredictionPage from "@/views/Prediction";
import { useSeismo } from "@/context/SeismoContext";

export default function Page() {
  const { prediction, loading, runPrediction, history } = useSeismo();
  return (
    <PredictionPage
      prediction={prediction}
      loading={loading}
      runPrediction={runPrediction}
      history={history}
    />
  );
}
