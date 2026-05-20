"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import AlertToast from "@/components/AlertToast";
import { SeismoProvider, useSeismo } from "@/context/SeismoContext";

function MainInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { alertLevel, wsStatus, lastAlert, clearAlert } = useSeismo();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar alertLevel={alertLevel} wsStatus={wsStatus} />
      {lastAlert && (
        <AlertToast event={lastAlert} onDismiss={clearAlert} />
      )}
      <main
        style={{ flex: 1, overflowY: "auto" }}
        className="fade-in"
        key={pathname}
      >
        {children}
      </main>
      <div
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          padding: "8px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--text3)",
            fontFamily: "var(--font-mono)",
          }}
        >
          SeismoAI v1.0 · ESP32+ADXL335 · Ethiopia Earthquake Early Warning
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--text3)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Final Year Project · ECE · 2025
        </span>
      </div>
    </div>
  );
}

export default function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <SeismoProvider>
      <MainInner>{children}</MainInner>
    </SeismoProvider>
  );
}
