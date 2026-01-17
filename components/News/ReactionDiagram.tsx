'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Recharts
const ResponsiveContainer = dynamic(async () => (await import('recharts')).ResponsiveContainer, { ssr: false });
const LineChart = dynamic(async () => (await import('recharts')).LineChart, { ssr: false });
const Line = dynamic(async () => (await import('recharts')).Line, { ssr: false });
const XAxis = dynamic(async () => (await import('recharts')).XAxis, { ssr: false });
const YAxis = dynamic(async () => (await import('recharts')).YAxis, { ssr: false });
const Tooltip = dynamic(async () => (await import('recharts')).Tooltip, { ssr: false });
const ReferenceLine = dynamic(async () => {
  const mod = await import('recharts');
  return { default: mod.ReferenceLine } as any;
}, { ssr: false });

const ReferenceLineAny = ReferenceLine as any;

type DataPoint = {
  day: number;
  value: number;
  label: string;
};

type ReactionDiagramProps = {
  title: string;
  data: DataPoint[];
  color?: string;
  unit?: string;
};

export default function ReactionDiagram({ title, data, color = '#10b981', unit = '%' }: ReactionDiagramProps) {
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-sm p-4">
      <div className="text-sm font-semibold mb-3 text-white/90">{title}</div>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <XAxis
              dataKey="day"
              tickFormatter={(value) => `Dzień ${value}`}
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}${unit}`}
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '11px' }}
            />
            <ReferenceLineAny y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="2 2" />
            <Tooltip
              formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}${unit}`, 'Zmiana']}
              labelFormatter={(label: string) => label}
              contentStyle={{
                background: '#0b1220',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
