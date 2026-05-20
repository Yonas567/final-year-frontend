"use client";

import React, { useState } from "react";
import { MapPin, Layers, RefreshCw } from "lucide-react";
import { Panel, StatCard, Badge, LEVEL_COLOR } from "@/components/UI";
import { useRecentEventsQuery } from "@/hooks/queries/events";
import type { EventLevel } from "@/types/seismo";

export default function EventsPage() {
  const [filterLevel, setFilterLevel] = useState<EventLevel | "all">("all");
  const { data: events = [], isLoading, isFetching, refetch } =
    useRecentEventsQuery(100);

  const filtered =
    filterLevel === "all"
      ? events
      : events.filter((e) => e.level === filterLevel);

  const mild = events.filter((e) => e.level === "mild").length;
  const moderate = events.filter((e) => e.level === "moderate").length;
  const strong = events.filter((e) => e.level === "strong").length;
  const maxMag =
    events.length > 0
      ? Math.max(...events.map((e) => e.magnitude))
      : 0;

  return (
    <div
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text)",
              margin: "0 0 4px",
            }}
          >
            Earthquake events
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "var(--text3)",
              margin: 0,
              fontFamily: "var(--font-mono)",
            }}
          >
            GET /api/events/recent — Awash Valley / Rift Valley monitoring
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            color: "var(--text2)",
          }}
        >
          <RefreshCw
            size={12}
            style={{
              animation: isFetching ? "spin 1s linear infinite" : "none",
            }}
          />
          Refresh
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <StatCard
          label="Total events"
          value={isLoading ? "—" : events.length}
          sub="Recent list"
          color="var(--teal)"
        />
        <StatCard label="Mild" value={mild} sub="M &lt; 3.0" color="var(--amber)" />
        <StatCard
          label="Moderate"
          value={moderate}
          sub="M 3.0 – 4.5"
          color="var(--red)"
        />
        <StatCard
          label="Max magnitude"
          value={maxMag ? `M${maxMag.toFixed(1)}` : "—"}
          sub="In loaded set"
          color="#ff0033"
        />
      </div>

      <Panel
        title="Event log"
        action={
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "mild", "moderate", "strong"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterLevel(f)}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontFamily: "var(--font-ui)",
                  background:
                    filterLevel === f ? "var(--teal)" : "var(--surface2)",
                  color: filterLevel === f ? "#000" : "var(--text3)",
                  border: `1px solid ${filterLevel === f ? "var(--teal)" : "var(--border)"}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        {isLoading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            Loading events…
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            No events detected yet
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 520,
              overflowY: "auto",
            }}
          >
            {filtered.map((e) => (
              <div
                key={String(e.id)}
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${LEVEL_COLOR[e.level] || "var(--text3)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                      fontWeight: 700,
                      color: LEVEL_COLOR[e.level],
                    }}
                  >
                    M {e.magnitude.toFixed(1)}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <Badge label={e.level} level={e.level} />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--text3)",
                      }}
                    >
                      {new Date(e.time).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    fontSize: 11,
                    color: "var(--text3)",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MapPin size={11} /> {e.location}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Layers size={11} /> {e.depth} km depth
                  </span>
                  {e.lat && e.lon && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                      {e.lat}°N, {e.lon}°E
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
