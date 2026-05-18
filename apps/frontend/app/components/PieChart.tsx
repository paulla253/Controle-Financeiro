'use client';

import '../lib/chartjs-setup';
import { Doughnut } from 'react-chartjs-2';
import type { CategorySummary } from '../lib/queries/useSummaries';
import { formatCurrencyBRL } from '../lib/format';

const COLORS = [
  '#005da7', '#006e1c', '#7f5300', '#ba1a1a', '#6200ea',
  '#00695c', '#ad1457', '#1565c0', '#827717', '#4e342e',
];

interface Props {
  data: CategorySummary[];
}

export function PieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-on-surface-variant">
        Não possui dados para ser mostrado
      </p>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex h-64 items-center justify-center">
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-on-surface">100%</span>
          <span className="text-xs text-on-surface-variant">{formatCurrencyBRL(total)}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {data.map((d, i) => (
          <li
            key={d.category}
            className="flex items-center justify-between rounded px-2 py-1 hover:bg-surface-container-low"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-sm text-on-surface">{d.category}</span>
            </div>
            <span className="text-sm font-medium text-on-surface">{d.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
