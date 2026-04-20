"use client";

import React, { useState, useMemo } from 'react';
import { useAnnualReport } from '@/lib/hooks/useAnnualReport';
import { useMonthlyReport } from '@/lib/hooks/useMonthlyReport';
import BarChart from '@/components/charts/bar-chart';
import PieChart from '@/components/charts/pie-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);

  const { data: annualReport, isLoading: isLoadingAnnual, isError: isErrorAnnual } = useAnnualReport(year);
  const { data: monthlyReport, isLoading: isLoadingMonthly, isError: isErrorMonthly } = useMonthlyReport(year, month);

  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      yearsArray.push(i);
    }
    return yearsArray;
  }, [currentYear]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR }),
    }));
  }, []);

  // Prepare data for Bar Chart (Annual Report)
  const barChartData = useMemo(() => {
    const labels = annualReport?.map(entry => entry.month) || [];
    const data = annualReport?.map(entry => entry.total) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Total de Despesas',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  }, [annualReport]);

  // Prepare data for Pie Chart (Monthly Report)
  const pieChartData = useMemo(() => {
    const labels = monthlyReport?.map(entry => entry.category) || [];
    const data = monthlyReport?.map(entry => entry.total) || [];
    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
    ];
    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ];
    return {
      labels,
      datasets: [
        {
          label: 'Despesas por Categoria',
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  }, [monthlyReport]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Painel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral de Despesas Anuais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="year-select" className="sr-only">Selecionar Ano</label>
              <Select onValueChange={(value) => setYear(Number(value))} value={year.toString()}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoadingAnnual && <div>Carregando relatório anual...</div>}
            {isErrorAnnual && <div>Erro ao carregar relatório anual.</div>}
            {!isLoadingAnnual && !isErrorAnnual && annualReport && annualReport.length > 0 ? (
              <BarChart data={barChartData} title={`Despesas Anuais de ${year}`} />
            ) : (
              !isLoadingAnnual && !isErrorAnnual && <div>Nenhum dado anual disponível para {year}.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas Mensais por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <label htmlFor="month-select" className="sr-only">Selecionar Mês</label>
              <Select onValueChange={(value) => setMonth(Number(value))} value={month.toString()}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label htmlFor="year-select-monthly" className="sr-only">Selecionar Ano</label>
              <Select onValueChange={(value) => setYear(Number(value))} value={year.toString()}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoadingMonthly && <div>Carregando relatório mensal...</div>}
            {isErrorMonthly && <div>Erro ao carregar relatório mensal.</div>}
            {!isLoadingMonthly && !isErrorMonthly && monthlyReport && monthlyReport.length > 0 ? (
              <PieChart data={pieChartData} title={`Despesas Mensais de ${months[month - 1]?.label} ${year}`} />
            ) : (
              !isLoadingMonthly && !isErrorMonthly && <div>Nenhum dado mensal disponível para {months[month - 1]?.label} {year}.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
