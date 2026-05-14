"use client";

import DataPage from "@/views/DataCollection";
import { useSeismo } from "@/context/SeismoContext";

export default function Page() {
  const { readings, waveHistory } = useSeismo();
  return <DataPage readings={readings} waveHistory={waveHistory} />;
}
