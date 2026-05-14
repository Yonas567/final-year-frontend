"use client";

import AlertsPage from "@/views/Alerts";
import { useSeismo } from "@/context/SeismoContext";

export default function Page() {
  const { events } = useSeismo();
  return <AlertsPage events={events} />;
}
