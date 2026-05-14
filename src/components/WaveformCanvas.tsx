"use client";

import { useRef, useEffect } from "react";
import type { AlertLevel } from "@/types/seismo";

export default function WaveformCanvas({
  data,
  alertLevel,
  height = 140,
}: {
  data: number[];
  alertLevel: AlertLevel;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0f1729";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(30,45,69,0.7)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (h / 4) * i);
      ctx.lineTo(w, (h / 4) * i);
      ctx.stroke();
    }
    for (let i = 1; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo((w / 10) * i, 0);
      ctx.lineTo((w / 10) * i, h);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(90,110,138,0.5)";
    ctx.font = "9px Space Mono, monospace";
    ctx.fillText("+1g", 4, 12);
    ctx.fillText(" 0g", 4, h / 2 + 4);
    ctx.fillText("-1g", 4, h - 4);

    if (!data || data.length < 2) return;

    const maxAbs = Math.max(1e-9, ...data.map((v) => Math.abs(v)));
    /** Boost tiny quiet traces so the live panel is readable before strong motion. */
    const ampBoost = maxAbs < 0.1 ? Math.min(6, 0.1 / maxAbs) : 1;

    const isAlert = alertLevel === "moderate" || alertLevel === "strong";
    const waveColor =
      alertLevel === "strong"
        ? "#ff0033"
        : alertLevel === "moderate"
          ? "#ff4757"
          : alertLevel === "mild"
            ? "#ffa502"
            : "#00e5c3";

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h / 2 - v * ampBoost * (h * 0.38);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h / 2);
    ctx.lineTo(0, h / 2);
    ctx.closePath();
    ctx.fillStyle = `${waveColor}14`;
    ctx.fill();

    ctx.beginPath();
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, `${waveColor}00`);
    grad.addColorStop(0.15, `${waveColor}cc`);
    grad.addColorStop(1, waveColor);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h / 2 - v * ampBoost * (h * 0.38);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const lastV = data[data.length - 1];
    const headY = h / 2 - lastV * ampBoost * (h * 0.38);
    ctx.beginPath();
    ctx.arc(w - 2, headY, 3, 0, Math.PI * 2);
    ctx.fillStyle = waveColor;
    ctx.fill();

    if (isAlert) {
      const flashAlpha = (Math.sin(Date.now() / 200) + 1) * 0.03;
      ctx.fillStyle = `rgba(255,71,87,${flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  }, [data, alertLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height,
        borderRadius: 6,
        background: "#0f1729",
      }}
    />
  );
}
