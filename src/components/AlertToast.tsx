"use client";

import { X, AlertTriangle } from "lucide-react";
import { LEVEL_COLOR } from "@/components/UI";
import type { SeismicEvent } from "@/types/seismo";

export default function AlertToast({
  event,
  onDismiss,
}: {
  event: SeismicEvent;
  onDismiss: () => void;
}) {
  const color = LEVEL_COLOR[event.level] || "var(--red)";

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 64,
        right: 20,
        zIndex: 200,
        width: 360,
        maxWidth: "calc(100vw - 40px)",
        background: "var(--surface)",
        border: `1px solid ${color}66`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertTriangle size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 4,
            }}
          >
            Earthquake detected
          </div>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
            M{event.magnitude.toFixed(1)} · {event.location}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text3)",
              fontFamily: "var(--font-mono)",
              marginTop: 4,
            }}
          >
            {new Date(event.time).toLocaleString()} · {event.depth} km depth
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text3)",
            padding: 2,
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
