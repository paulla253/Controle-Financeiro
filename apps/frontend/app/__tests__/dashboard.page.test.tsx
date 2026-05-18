import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { ToastContainer } from '../components/Toast';

jest.mock('react-chartjs-2', () => ({
  Doughnut: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="pie-chart">{data.labels.join(', ')}</div>
  ),
  Bar: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="bar-chart">{data.labels.join(', ')}</div>
  ),
}));

jest.mock('../lib/chartjs-setup', () => {});

import DashboardPage from '../page';

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
      <ToastContainer />
    </QueryClientProvider>,
  );
}

describe('DashboardPage', () => {
  it('renders pie chart with current month category data', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() =>
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument(),
    );

    expect(screen.getAllByText(/alimentação/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/transporte/i).length).toBeGreaterThan(0);
  });

  it('renders bar chart with annual summary data', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument(),
    );
  });

  it('renders latest expenses list', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() =>
      expect(screen.getByText('15/01/2024')).toBeInTheDocument(),
    );

    expect(screen.getByText('10/01/2024')).toBeInTheDocument();
    expect(screen.getAllByText(/alimentação/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/transporte/i).length).toBeGreaterThan(0);
  });

  it('shows fallback message when current month summary is empty', async () => {
    server.use(
      http.get(`${BASE}/expenses/current-month-summary`, () =>
        HttpResponse.json([]),
      ),
    );

    renderWithProviders(<DashboardPage />);

    await waitFor(() =>
      expect(
        screen.getByText('Não possui dados para ser mostrado'),
      ).toBeInTheDocument(),
    );

    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });

  it('updates the bar chart when the year selector changes', async () => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const capturedYears: string[] = [];

    server.use(
      http.get(`${BASE}/expenses/annual-summary`, ({ request }) => {
        const url = new URL(request.url);
        const year = url.searchParams.get('year');
        if (year) capturedYears.push(year);
        return HttpResponse.json([]);
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /selecionar ano/i })).toBeInTheDocument(),
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: /selecionar ano/i }),
      String(previousYear),
    );

    await waitFor(() =>
      expect(capturedYears).toContain(String(previousYear)),
    );
  });
});
