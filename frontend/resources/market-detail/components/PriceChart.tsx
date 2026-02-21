import React from "react";
import type { PricePoint } from "../types";

interface PriceChartProps {
  data: PricePoint[];
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, height = 250 }) => {
  if (data.length < 2) return null;

  const width = 600;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 45;
  const paddingRight = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 0.01;

  // Add 10% padding to y-axis
  const yMin = Math.max(0, minPrice - priceRange * 0.1);
  const yMax = Math.min(1, maxPrice + priceRange * 0.1);
  const yRange = yMax - yMin;

  const scaleX = (i: number) => paddingLeft + (i / (data.length - 1)) * chartWidth;
  const scaleY = (price: number) => paddingTop + (1 - (price - yMin) / yRange) * chartHeight;

  // Build line path
  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(1)} ${scaleY(d.price).toFixed(1)}`)
    .join(" ");

  // Build area path (line + close to bottom)
  const areaPath = `${linePath} L ${scaleX(data.length - 1).toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${paddingLeft.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`;

  const isUp = data[data.length - 1].price >= data[0].price;
  const lineColor = isUp ? "#4ade80" : "#f87171";
  const gradientId = `chart-gradient-${isUp ? "up" : "down"}`;

  // Y-axis labels (4 ticks)
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const price = yMin + (i / 3) * yRange;
    return { price, y: scaleY(price) };
  });

  // X-axis labels (first, middle, last)
  const xLabels = [0, Math.floor(data.length / 2), data.length - 1].map((i) => ({
    label: new Date(data[i].timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    x: scaleX(i),
  }));

  // Current price
  const currentPrice = data[data.length - 1].price;

  return (
    <div className="price-chart-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={paddingLeft}
            y1={tick.y}
            x2={width - paddingRight}
            y2={tick.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Current price dot */}
        <circle
          cx={scaleX(data.length - 1)}
          cy={scaleY(currentPrice)}
          r="4"
          fill={lineColor}
        />

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={paddingLeft - 8}
            y={tick.y + 4}
            textAnchor="end"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            fontFamily="system-ui, sans-serif"
          >
            {(tick.price * 100).toFixed(0)}¢
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 8}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            fontFamily="system-ui, sans-serif"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
};
