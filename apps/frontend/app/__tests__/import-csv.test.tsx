import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import ExpensesPage from '../expenses/page';
import { ToastContainer } from '../components/Toast';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

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

describe('ImportCsv', () => {
  it('shows success toast with imported count when CSV is valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExpensesPage />);

    const file = new File(
      ['Data,Categoria,Valor\n15/01/2024,Alimentação,100.50\n10/01/2024,Transporte,50.00'],
      'despesas.csv',
      { type: 'text/csv' },
    );

    const input = screen.getByTestId('import-file-input');
    await user.upload(input, file);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        '2 despesa(s) importada(s) com sucesso!',
      ),
    );
  });

  it('shows error toast with line and reason when CSV has invalid data', async () => {
    server.use(
      http.post(`${BASE}/csv/import`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'Erro na importação',
            error: 'Bad Request',
            details: { line: 2, reason: 'Valor inválido: abc' },
          },
          { status: 400 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<ExpensesPage />);

    const file = new File(
      ['Data,Categoria,Valor\n15/01/2024,Alimentação,abc'],
      'invalido.csv',
      { type: 'text/csv' },
    );

    const input = screen.getByTestId('import-file-input');
    await user.upload(input, file);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Erro na linha 2: Valor inválido: abc',
      ),
    );
  });

  it('shows generic error toast when error has no line/reason details', async () => {
    server.use(
      http.post(`${BASE}/csv/import`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'Formato de arquivo inválido',
            error: 'Bad Request',
          },
          { status: 400 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<ExpensesPage />);

    const file = new File(['not a csv'], 'invalid.csv', { type: 'text/csv' });

    const input = screen.getByTestId('import-file-input');
    await user.upload(input, file);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Formato de arquivo inválido',
      ),
    );
  });
});
