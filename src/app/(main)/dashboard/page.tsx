"use client";

import DashboardPage from "@/views/Dashboard";
import { useSeismo } from "@/context/SeismoContext";

export default function Page() {
  const { readings, waveHistory, alertLevel, events, prediction } = useSeismo();
  return (
    <DashboardPage
      readings={readings}
      waveHistory={waveHistory}
      alertLevel={alertLevel}
      events={events}
      prediction={prediction}
    />
  );
}
