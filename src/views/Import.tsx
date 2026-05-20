"use client";

import React, { useRef, useState } from "react";
import { FileSpreadsheet, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { Panel, Btn, StatCard } from "@/components/UI";
import { DEFAULT_DEVICE_ID } from "@/lib/api/config";
import { useIngestExcelMutation } from "@/hooks/queries/ingest";

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const importExcel = useIngestExcelMutation();

  const result = importExcel.data;

  const onPick = (f: File | null) => {
    setFile(f);
    importExcel.reset();
  };

  const upload = () => {
    if (!file) return;
    importExcel.mutate({ file, deviceId: deviceId.trim() || undefined });
  };

  return (
    <div
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 720,
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
          <FileSpreadsheet size={18} color="var(--teal)" />
          <h1
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Import historical samples
          </h1>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "var(--text3)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          POST /api/ingest/excel — Excel (.xlsx / .xls) with headers:{" "}
          <code
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--teal)",
            }}
          >
            deviceId
          </code>
          ,{" "}
          <code style={{ fontFamily: "var(--font-mono)", color: "var(--teal)" }}>
            timestamp
          </code>
          , x, y, z, label (optional). Or set device ID below for all rows.
        </p>
      </div>

      <Panel title="Upload file">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style={{ display: "none" }}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed var(--border2)",
            borderRadius: 10,
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: "var(--surface2)",
          }}
        >
          <Upload
            size={28}
            color="var(--teal)"
            style={{ margin: "0 auto 12px" }}
          />
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            {file ? file.name : "Choose .xlsx or .xls file"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
            Click to browse
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--text3)",
              marginBottom: 6,
            }}
          >
            Device ID (optional if column exists in sheet)
          </div>
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="esp32-01"
            style={{
              width: "100%",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 12px",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          />
        </div>

        <Btn
          variant="primary"
          disabled={!file || importExcel.isPending}
          onClick={upload}
          style={{
            marginTop: 14,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {importExcel.isPending ? "Importing…" : "Import to database"}
        </Btn>

        {importExcel.isError && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "rgba(255,71,87,0.1)",
              border: "1px solid rgba(255,71,87,0.35)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--red)",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            {importExcel.error instanceof Error
              ? importExcel.error.message
              : "Import failed"}
          </div>
        )}
      </Panel>

      {result && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <StatCard
              label="Accepted"
              value={result.accepted}
              sub="Rows stored"
              color="var(--teal)"
            />
            <StatCard
              label="Skipped"
              value={result.skipped}
              sub="Not imported"
              color="var(--amber)"
            />
            <StatCard
              label="Status"
              value="OK"
              sub="Import complete"
              color="var(--green)"
            />
          </div>

          <Panel title="Import result">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                color: "var(--green)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <CheckCircle size={16} />
              Import finished — refresh Sensor Data to view samples
            </div>
            {result.errors && result.errors.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {result.errors.map((err, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--amber)",
                      padding: "6px 10px",
                      background: "var(--surface2)",
                      borderRadius: 6,
                    }}
                  >
                    {err}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
