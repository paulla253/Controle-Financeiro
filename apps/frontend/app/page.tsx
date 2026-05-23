'use client';

import Link from 'next/link';
import { useCurrentMonthSummary, useAnnualSummary } from './lib/queries/useSummaries';
import { useExpenses } from './lib/queries/useExpenses';
import { PieChart } from './components/PieChart';
import { AnnualBarChart } from './components/AnnualBarChart';
import { formatDateBR, formatCurrencyBRL } from './lib/format';

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const RECENT_LIMIT = 5;

export default function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1; // 1-12
  const prevMonthNum = now.getMonth(); // 0 em janeiro, 1-11 nos demais
  const currentMonthLabel = `${MONTHS_PT[now.getMonth()]} ${currentYear}`;
  const prevMonthLabel = prevMonthNum > 0
    ? MONTHS_PT[prevMonthNum - 1]
    : MONTHS_PT[11];

  const { data: monthlySummary = [], isLoading: loadingPie } =
    useCurrentMonthSummary();
  const { data: annualData = [] } = useAnnualSummary(currentYear);
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();

  const recentExpenses = expenses.slice(0, RECENT_LIMIT);

  const currentMonthTotal = monthlySummary.reduce((sum, d) => sum + d.total, 0);
  const prevMonthTotal = prevMonthNum > 0
    ? (annualData.find((d) => d.month === prevMonthNum)?.total ?? 0)
    : 0;
  const percentageChange = prevMonthTotal > 0
    ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <span className="flex items-center gap-1 rounded-full bg-primary-container/20 px-3 py-1 text-xs font-medium text-primary">
          {currentMonthLabel}
        </span>
      </div>

      {/* Cards de sumário mensal */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <p className="text-xs font-medium text-on-surface-variant">
            Total Gasto no Mês
          </p>
          <p className="mt-1 text-2xl font-bold text-on-surface">
            {formatCurrencyBRL(currentMonthTotal)}
          </p>
          {percentageChange !== null && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-[14px] leading-none">
                trending_up
              </span>
              {Math.abs(percentageChange).toFixed(1)}% em relação ao mês anterior
            </div>
          )}
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <p className="text-xs font-medium text-on-surface-variant">
            Gasto do Mês Anterior
          </p>
          <p className="mt-1 text-2xl font-bold text-on-surface">
            {formatCurrencyBRL(prevMonthTotal)}
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            Fechado em {prevMonthLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">
              Distribuição de Gastos
            </h2>
            <span className="text-xs text-on-surface-variant">Mês Atual</span>
          </div>
          {loadingPie ? (
            <div className="flex h-64 items-center justify-center text-sm text-on-surface-variant">
              Carregando...
            </div>
          ) : (
            <PieChart data={monthlySummary} />
          )}
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 lg:col-span-2">
          <AnnualBarChart />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-base font-semibold text-on-surface">
            Últimas Despesas Adicionadas
          </h2>
          <Link
            href="/expenses"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver Todas
          </Link>
        </div>
        {loadingExpenses ? (
          <div className="flex h-32 items-center justify-center text-sm text-on-surface-variant">
            Carregando...
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-on-surface-variant">
            Nenhuma despesa encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Data
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-surface-container-low">
                    <td className="px-6 py-4 text-sm text-on-surface">
                      {formatDateBR(expense.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">
                      {expense.category.name}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-on-surface">
                      {formatCurrencyBRL(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
