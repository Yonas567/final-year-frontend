"use client";

import React from "react";
import { Brain, RefreshCw, Target, Shield } from "lucide-react";
import { Panel, StatCard, Btn } from "@/components/UI";
import type { PredictionRecord } from "@/types/seismo";

const RC = (r: string) =>
  r === "high" ? "#ff4757" : r === "moderate" ? "#ffa502" : "#2ed573";

export default function PredictionsPage({
  prediction,
  loading,
  runPrediction,
  history,
}: {
  prediction: PredictionRecord;
  loading: boolean;
  runPrediction: () => Promise<void>;
  history: PredictionRecord[];
}) {
  const riskColor = RC(prediction.risk || "low");

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Brain size={18} color="var(--teal)" />
            <h1
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Risk predictions
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
            POST /api/predict · GET /api/predict/history
          </p>
        </div>
        <Btn
          variant="primary"
          disabled={loading}
          onClick={() => void runPrediction()}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <RefreshCw
            size={12}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
          {loading ? "Running analysis…" : "Run analysis"}
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
          label="Probability"
          value={`${prediction.probability ?? 0}%`}
          sub={prediction.region || "—"}
          color={riskColor}
        />
        <StatCard
          label="Magnitude"
          value={`M${prediction.magnitude ?? 0}`}
          sub="Estimated"
          color="var(--teal)"
        />
        <StatCard
          label="Confidence"
          value={`${prediction.confidence ?? 0}%`}
          sub="Model score"
          color="var(--green)"
        />
        <StatCard
          label="Risk"
          value={(prediction.risk || "low").toUpperCase()}
          sub={prediction.coords || "Assessment"}
          color={riskColor}
        />
      </div>

      {prediction.features && (
        <Panel title="Model features">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            <div>
              <div style={{ color: "var(--text3)", fontSize: 10 }}>STA/LTA</div>
              <div style={{ color: "var(--teal)", fontWeight: 700 }}>
                {prediction.features.stalta}
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text3)", fontSize: 10 }}>P-Wave</div>
              <div style={{ color: "var(--teal)", fontWeight: 700 }}>
                {prediction.features.pWave}
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text3)", fontSize: 10 }}>Energy</div>
              <div style={{ color: "var(--teal)", fontWeight: 700 }}>
                {prediction.features.energy}
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text3)", fontSize: 10 }}>Freq peak</div>
              <div style={{ color: "var(--teal)", fontWeight: 700 }}>
                {prediction.features.freqPeak} Hz
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Panel title={`Prediction history (${history.length})`}>
        {history.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: "var(--text3)",
              fontSize: 13,
            }}
          >
            No history yet. Run analysis to generate a prediction.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((h) => (
              <div
                key={String(h.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr repeat(4, auto)",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 14px",
                  background: "var(--surface2)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {h.region}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: RC(h.risk),
                  }}
                >
                  {h.probability}%
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  M{h.magnitude}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--green)",
                  }}
                >
                  <Shield size={10} style={{ verticalAlign: "middle" }} />{" "}
                  {h.confidence}%
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: RC(h.risk),
                  }}
                >
                  <Target size={10} style={{ verticalAlign: "middle" }} />{" "}
                  {h.risk}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
