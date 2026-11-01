import React from 'react';
import { SoilReading } from '@farmguard/shared';

interface SoilTrendChartProps {
  readings: SoilReading[];
}

export const SoilTrendChart: React.FC<SoilTrendChartProps> = ({ readings }) => {
  if (readings.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
        Insufficient readings to generate trend timeline
      </div>
    );
  }

  // Sort chronological for chart
  const sorted = [...readings].sort(
    (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
  ).slice(-10); // last 10 readings

  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 35;

  const maxMoisture = 100;
  const maxPh = 14;

  const xStep = sorted.length > 1 ? (chartWidth - padding * 2) / (sorted.length - 1) : 0;

  // Moisture Points (y-axis 0 to 100%)
  const moisturePoints = sorted.map((r, i) => {
    const val = r.moisturePct ?? 50;
    const x = padding + i * xStep;
    const y = chartHeight - padding - (val / maxMoisture) * (chartHeight - padding * 2);
    return { x, y, val };
  });

  // pH Points (y-axis 0 to 14)
  const phPoints = sorted.map((r, i) => {
    const val = r.ph ?? 7.0;
    const x = padding + i * xStep;
    const y = chartHeight - padding - (val / maxPh) * (chartHeight - padding * 2);
    return { x, y, val };
  });

  const moisturePath = moisturePoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const phPath = phPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  return (
    <div className="w-full overflow-x-auto bg-white p-4 rounded-xl border border-slate-200/80">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-slate-700">Chronological Field Timeline</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-farm-500 inline-block"></span>
            <span className="text-slate-600">Moisture (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-600">pH Level</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
        {/* Background Grid Lines */}
        <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
        <line
          x1={padding}
          y1={chartHeight / 2}
          x2={chartWidth - padding}
          y2={chartHeight / 2}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#e2e8f0"
          strokeWidth="1"
        />

        {/* Moisture Line & Area */}
        {sorted.length > 1 && (
          <path d={moisturePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Moisture Nodes */}
        {moisturePoints.map((pt, i) => (
          <g key={`m-${i}`}>
            <circle cx={pt.x} cy={pt.y} r="4" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
            <text x={pt.x} y={pt.y - 8} fontSize="9" textAnchor="middle" fill="#15803d" fontWeight="600">
              {pt.val}%
            </text>
          </g>
        ))}

        {/* pH Line */}
        {sorted.length > 1 && (
          <path
            d={phPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />
        )}

        {/* pH Nodes */}
        {phPoints.map((pt, i) => (
          <g key={`ph-${i}`}>
            <circle cx={pt.x} cy={pt.y} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <text x={pt.x} y={pt.y + 14} fontSize="9" textAnchor="middle" fill="#b45309" fontWeight="600">
              pH {pt.val}
            </text>
          </g>
        ))}

        {/* X-axis date labels */}
        {sorted.map((r, i) => {
          const x = padding + (sorted.length > 1 ? i * xStep : 0);
          const dateStr = new Date(r.observedAt).toLocaleDateString(undefined, {
            month: 'numeric',
            day: 'numeric',
          });
          return (
            <text
              key={`date-${i}`}
              x={x}
              y={chartHeight - 8}
              fontSize="8"
              textAnchor="middle"
              fill="#94a3b8"
            >
              {dateStr}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

