'use client';

import '../lib/chartjs-setup';
import { Bar } from 'react-chartjs-2';
import { useState } from 'react';
import { useAnnualSummary, useExpenseYears } from '../lib/queries/useSummaries';
import { formatCurrencyBRL } from '../lib/format';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function AnnualBarChart() {
  const currentYear = new Date().getFullYear();
  const { data: yearOptions = [] } = useExpenseYears();
  const defaultYear = yearOptions.length > 0 ? yearOptions[0] : currentYear;
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? defaultYear;
  const { data = [], isLoading } = useAnnualSummary(selectedYear);

  const totals = Array.from({ length: 12 }, (_, i) => {
    const found = data.find((d) => d.month === i + 1);
    return found?.total ?? 0;
  });

  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        data: totals,
        backgroundColor: '#005da7',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-on-surface">
          Comparativo Anual de Despesas
        </h2>
        <select
          aria-label="Selecionar ano"
          value={selectedYear}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-sm text-on-surface"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-on-surface-variant">
          Carregando...
        </div>
      ) : (
        <div className="h-64">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (v) => formatCurrencyBRL(v as number),
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
