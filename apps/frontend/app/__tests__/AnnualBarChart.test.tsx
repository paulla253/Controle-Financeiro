import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';

jest.mock('react-chartjs-2', () => ({
  Bar: ({
    data,
  }: {
    data: { labels: string[]; datasets: { data: number[] }[] };
  }) => (
    <div data-testid="bar-chart" data-labels={data.labels.join(',')}>
      {data.datasets[0].data.join(',')}
    </div>
  ),
}));

jest.mock('../lib/chartjs-setup', () => {});

import { AnnualBarChart } from '../components/AnnualBarChart';

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('AnnualBarChart', () => {
  it('renders the bar chart with data for the current year', async () => {
    const currentYear = new Date().getFullYear();

    server.use(
      http.get(`${BASE}/expenses/annual-summary`, ({ request }) => {
        const url = new URL(request.url);
        const year = url.searchParams.get('year');
        if (String(year) === String(currentYear)) {
          return HttpResponse.json([
            { month: 1, total: 300 },
            { month: 6, total: 800 },
          ]);
        }
        return HttpResponse.json([]);
      }),
    );

    renderWithClient(<AnnualBarChart />);

    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument(),
    );

    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-labels', 'Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez');
  });

  it('changes the year and triggers a new query when the selector changes', async () => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const capturedYears: string[] = [];

    server.use(
      http.get(`${BASE}/expenses/annual-summary`, ({ request }) => {
        const url = new URL(request.url);
        const year = url.searchParams.get('year');
        if (year) capturedYears.push(year);
        if (String(year) === String(previousYear)) {
          return HttpResponse.json([{ month: 3, total: 1200 }]);
        }
        return HttpResponse.json([]);
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<AnnualBarChart />);

    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument(),
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: /selecionar ano/i }),
      String(previousYear),
    );

    await waitFor(() =>
      expect(capturedYears).toContain(String(previousYear)),
    );

    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument(),
    );
  });
});
