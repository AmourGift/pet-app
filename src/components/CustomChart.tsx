/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

interface ChartPoint {
  label: string;
  value: number;
}

interface CustomChartProps {
  data: ChartPoint[];
  title?: string;
  unit?: string;
  colorTheme?: 'emerald' | 'amber' | 'rose' | 'indigo';
}

export default function CustomChart({
  data,
  title = "Weight Trend",
  unit = "kg",
  colorTheme = "emerald"
}: CustomChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div id="chart-empty" className="h-48 flex flex-col items-center justify-center border border-dashed border-amber-200 rounded-2xl bg-amber-50/20 text-stone-400 text-sm">
        <span className="text-2xl mb-1">📊</span>
        No weight data available for this pet.
      </div>
    );
  }

  // Theme configuration
  const themes = {
    emerald: {
      stroke: '#059669', // Emerald 600
      fillStart: 'rgba(5, 150, 105, 0.25)',
      fillEnd: 'rgba(5, 150, 105, 0.01)',
      dotFill: '#10b981',
      gridColor: 'rgba(5, 150, 105, 0.08)',
    },
    amber: {
      stroke: '#d97706', // Amber 600
      fillStart: 'rgba(217, 119, 6, 0.25)',
      fillEnd: 'rgba(217, 119, 6, 0.01)',
      dotFill: '#f59e0b',
      gridColor: 'rgba(217, 119, 6, 0.08)',
    },
    rose: {
      stroke: '#e11d48', // Rose 600
      fillStart: 'rgba(225, 29, 72, 0.25)',
      fillEnd: 'rgba(225, 29, 72, 0.01)',
      dotFill: '#f43f5e',
      gridColor: 'rgba(225, 29, 72, 0.08)',
    },
    indigo: {
      stroke: '#4f46e5', // Indigo 600
      fillStart: 'rgba(79, 70, 229, 0.25)',
      fillEnd: 'rgba(79, 70, 229, 0.01)',
      dotFill: '#6366f1',
      gridColor: 'rgba(79, 70, 229, 0.08)',
    }
  };

  const activeTheme = themes[colorTheme] || themes.emerald;

  // Chart Dimensions
  const paddingX = 45;
  const paddingY = 30;
  const h = 220; // total height
  const w = 500; // base aspect ratio width (viewBox)

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 5); // ensure at least size 5
  const minVal = Math.max(0, Math.min(...values, 0) - 1); // standard y scale spacing

  const rangeY = maxVal - minVal || 1;
  const stepsY = 4;

  const points = data.map((d, index) => {
    const x = paddingX + (index * (w - paddingX * 2)) / (data.length > 1 ? data.length - 1 : 1);
    const y = h - paddingY - ((d.value - minVal) * (h - paddingY * 2)) / rangeY;
    return { x, y, label: d.label, value: d.value };
  });

  // Create smooth line path instructions (polyline or curve)
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    points.forEach((p, idx) => {
      if (idx > 0) {
        // Can be simple L line
        linePath += ` L ${p.x} ${p.y}`;
      }
    });

    // Create the filled area path below the line
    areaPath = `${linePath} L ${points[points.length - 1].x} ${h - paddingY} L ${points[0].x} ${h - paddingY} Z`;
  }

  // Draw Y-axis gridlines
  const gridLinesY = Array.from({ length: stepsY + 1 }, (_, i) => {
    const val = minVal + (rangeY * i) / stepsY;
    const y = h - paddingY - (i * (h - paddingY * 2)) / stepsY;
    return { y, val };
  });

  return (
    <div id="chart-container" className="relative w-full rounded-2xl bg-white p-5 border border-stone-100 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-stone-700 font-sans tracking-tight flex items-center gap-2">
          <span className="text-base text-amber-500">📈</span>
          {title}
        </h4>
        <span className="text-xs bg-stone-100 text-stone-500 font-medium px-2 py-0.5 rounded-full font-sans">
          {data.length} records · max: {maxVal.toFixed(1)} {unit}
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* SVG Wrapper */}
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id={`gradient-${colorTheme}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeTheme.stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={activeTheme.stroke} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLinesY.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={line.y}
                x2={w - paddingX}
                y2={line.y}
                stroke={activeTheme.gridColor}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={line.y + 4}
                textAnchor="end"
                className="text-[10px] font-mono text-stone-400 font-medium"
              >
                {line.val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Area Path */}
          {areaPath && (
            <path
              d={areaPath}
              fill={`url(#gradient-${colorTheme})`}
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={activeTheme.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Vertical indicator line on hover */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <line
              x1={points[hoveredIndex].x}
              y1={paddingY}
              x2={points[hoveredIndex].x}
              y2={h - paddingY}
              stroke={activeTheme.stroke}
              strokeOpacity="0.3"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* X axis labels (Dates) */}
          {points.map((p, idx) => {
            // Only draw some dates if there are too many labels to avoid clutter
            const spacing = Math.ceil(points.length / 5);
            const showLabel = idx % spacing === 0 || idx === points.length - 1;

            return (
              <g key={idx}>
                {showLabel && (
                  <text
                    x={p.x}
                    y={h - paddingY + 16}
                    textAnchor="middle"
                    className="text-[9px] font-mono text-stone-400 fill-stone-400"
                  >
                    {p.label}
                  </text>
                )}

                {/* Invisible larger hover element */}
                <rect
                  x={p.x - 12}
                  y={paddingY}
                  width="24"
                  height={h - paddingY * 2}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Data point dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === idx ? 6 : 3.5}
                  fill={hoveredIndex === idx ? '#ffffff' : activeTheme.dotFill}
                  stroke={activeTheme.stroke}
                  strokeWidth={hoveredIndex === idx ? 3.5 : 1.5}
                  className="transition-all duration-150 pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip HTML overlays */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            id="chart-tooltip"
            className="absolute bg-stone-900 text-white rounded-lg px-2.5 py-1.5 text-xs font-mono shadow-xl border border-stone-800 pointer-events-none transition-all duration-150 flex flex-col gap-0.5"
            style={{
              left: `${(points[hoveredIndex].x / w) * 100}%`,
              top: `${(points[hoveredIndex].y / h) * 100 - 25}%`,
              transform: 'translate(-50%, -100%)',
              zIndex: 10
            }}
          >
            <span className="text-[10px] text-stone-300 font-sans">{points[hoveredIndex].label}</span>
            <span className="font-bold text-emerald-400">
              {points[hoveredIndex].value.toFixed(1)} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
