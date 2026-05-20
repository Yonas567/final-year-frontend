"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Table2,
} from "lucide-react";
import { Panel, StatCard, Badge, Btn } from "@/components/UI";
import { useSamplesQuery } from "@/hooks/queries/samples";
import type { SensorSample } from "@/lib/api/types";

function labelBadge(label: SensorSample["label"]) {
  if (label === null) return <Badge label="unlabeled" level="none" />;
  if (label === 1) return <Badge label="quake" level="high" />;
  return <Badge label="noise" level="low" />;
}

export default function SamplesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useSamplesQuery(page);

  const samples = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const perPage = data?.perPage ?? 20;
  const currentPage = data?.page ?? page;

  const labeled = samples.filter((s) => s.label !== null).length;
  const quake = samples.filter((s) => s.label === 1).length;

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages || 1));
  };

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
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Table2 size={18} color="var(--teal)" />
            <h1
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Sensor Samples
            </h1>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text3)",
              margin: 0,
              fontFamily: "var(--font-mono)",
            }}
          >
            GET /api/samples — newest first, 20 per page
          </p>
        </div>
        <Btn
          variant="ghost"
          disabled={isFetching}
          onClick={() => void refetch()}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <RefreshCw
            size={12}
            style={{
              animation: isFetching ? "spin 1s linear infinite" : "none",
            }}
          />
          Refresh
        </Btn>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <StatCard
          label="Total samples"
          value={isLoading ? "—" : total}
          sub="In sensor_samples"
          color="var(--teal)"
        />
        <StatCard
          label="This page"
          value={isLoading ? "—" : samples.length}
          sub={`${perPage} rows max`}
          color="var(--blue)"
        />
        <StatCard
          label="Labeled (page)"
          value={isLoading ? "—" : labeled}
          sub="label ≠ null"
          color="var(--amber)"
        />
        <StatCard
          label="Quake (page)"
          value={isLoading ? "—" : quake}
          sub="label = 1"
          color="var(--red)"
        />
      </div>

      <Panel
        title={`Sample log — page ${currentPage} of ${totalPages || 1}`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => goTo(currentPage - 1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text2)",
                fontSize: 11,
                fontWeight: 700,
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                opacity: currentPage <= 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text3)",
              }}
            >
              {currentPage} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || isFetching}
              onClick={() => goTo(currentPage + 1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text2)",
                fontSize: 11,
                fontWeight: 700,
                cursor:
                  currentPage >= totalPages ? "not-allowed" : "pointer",
                opacity: currentPage >= totalPages ? 0.5 : 1,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        }
      >
        {isError ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--red)",
              fontSize: 13,
            }}
          >
            {error instanceof Error ? error.message : "Failed to load samples"}
          </div>
        ) : isLoading && !data ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            Loading samples…
          </div>
        ) : samples.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            No samples on this page.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Device",
                    "Timestamp",
                    "X (g)",
                    "Y (g)",
                    "Z (g)",
                    "Magnitude",
                    "PGA",
                    "Label",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px",
                        textAlign: "left",
                        color: "var(--text3)",
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {samples.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      opacity: i === 0 ? 1 : 0.92,
                      background:
                        i === 0 ? "rgba(0,229,195,0.04)" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "7px 10px",
                        color: "var(--teal)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.deviceId}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        color: "var(--text2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(s.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: "7px 10px", color: "var(--teal)" }}>
                      {s.x.toFixed(4)}
                    </td>
                    <td style={{ padding: "7px 10px", color: "#1e90ff" }}>
                      {s.y.toFixed(4)}
                    </td>
                    <td style={{ padding: "7px 10px", color: "var(--amber)" }}>
                      {s.z.toFixed(4)}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        color:
                          s.magnitude > 0.15 ? "var(--red)" : "var(--text)",
                      }}
                    >
                      {s.magnitude.toFixed(4)}
                    </td>
                    <td style={{ padding: "7px 10px", color: "var(--text2)" }}>
                      {s.pga.toFixed(4)}
                    </td>
                    <td style={{ padding: "7px 10px" }}>{labelBadge(s.label)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 2,
              )
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    style={{
                      padding: "6px 8px",
                      color: "var(--text3)",
                      fontSize: 11,
                    }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goTo(p)}
                    disabled={isFetching}
                    style={{
                      minWidth: 32,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: `1px solid ${p === currentPage ? "var(--teal)" : "var(--border)"}`,
                      background:
                        p === currentPage ? "var(--teal)" : "var(--surface2)",
                      color: p === currentPage ? "#000" : "var(--text3)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>
        )}
      </Panel>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
