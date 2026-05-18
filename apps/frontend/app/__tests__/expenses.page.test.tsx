import { render, screen, waitFor, within } from '@testing-library/react';
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

// Polyfill URL.createObjectURL / revokeObjectURL for jsdom
beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    configurable: true,
    value: jest.fn().mockReturnValue('blob:mock-url'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    configurable: true,
    value: jest.fn(),
  });
});

afterEach(() => {
  (URL.createObjectURL as jest.Mock).mockClear?.();
  (URL.revokeObjectURL as jest.Mock).mockClear?.();
});

describe('ExpensesPage', () => {
  it('renders expenses returned by the API', async () => {
    renderWithProviders(<ExpensesPage />);

    // Wait for the table to show data rows (header + 2 expense rows = 3 total)
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3);
    });

    // Category names appear in table cells
    const deleteBtnAlimentacao = screen.getByRole('button', {
      name: /excluir despesa de alimentação/i,
    });
    const deleteBtnTransporte = screen.getByRole('button', {
      name: /excluir despesa de transporte/i,
    });
    expect(deleteBtnAlimentacao).toBeInTheDocument();
    expect(deleteBtnTransporte).toBeInTheDocument();
    expect(screen.getByText(/2 despesas encontradas/i)).toBeInTheDocument();
  });

  it('renders empty state when there are no expenses', async () => {
    server.use(http.get(`${BASE}/expenses`, () => HttpResponse.json([])));

    renderWithProviders(<ExpensesPage />);

    await waitFor(() =>
      expect(
        screen.getByText(/nenhuma despesa encontrada/i),
      ).toBeInTheDocument(),
    );
  });

  it('applies month filter to the API query', async () => {
    const user = userEvent.setup();
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/expenses`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    renderWithProviders(<ExpensesPage />);
    await waitFor(() =>
      screen.getByRole('combobox', { name: /filtrar por mês/i }),
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: /filtrar por mês/i }),
      '1',
    );

    await waitFor(() => expect(capturedUrl).toContain('month=1'));
  });

  it('applies year filter to the API query', async () => {
    const user = userEvent.setup();
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/expenses`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    renderWithProviders(<ExpensesPage />);
    await waitFor(() =>
      screen.getByRole('spinbutton', { name: /filtrar por ano/i }),
    );

    await user.type(
      screen.getByRole('spinbutton', { name: /filtrar por ano/i }),
      '2024',
    );

    await waitFor(() => expect(capturedUrl).toContain('year=2024'));
  });

  it('applies category filter to the API query', async () => {
    const user = userEvent.setup();
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/expenses`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    renderWithProviders(<ExpensesPage />);

    // Wait for categories to populate the filter select
    await waitFor(() => {
      const options = within(
        screen.getByRole('combobox', { name: /filtrar por categoria/i }),
      ).getAllByRole('option');
      expect(options.length).toBeGreaterThan(1);
    });

    await user.selectOptions(
      screen.getByRole('combobox', { name: /filtrar por categoria/i }),
      '1',
    );

    await waitFor(() => expect(capturedUrl).toContain('categoryId=1'));
  });

  it('opens AddExpenseModal when "Nova Despesa" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExpensesPage />);

    await user.click(screen.getByRole('button', { name: /nova despesa/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /nova despesa/i }),
    ).toBeInTheDocument();
  });

  it('deletes expense optimistically (row gone before API confirms) and shows success toast', async () => {
    // Delay DELETE so optimistic state is observable before API confirms
    server.use(
      http.delete(`${BASE}/expenses/:id`, async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 200));
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<ExpensesPage />);

    await waitFor(() =>
      screen.getByRole('button', {
        name: /excluir despesa de alimentação/i,
      }),
    );

    await user.click(
      screen.getByRole('button', { name: /excluir despesa de alimentação/i }),
    );

    // Optimistic: button is gone before API confirms (within the 200ms delay window)
    await waitFor(() =>
      expect(
        screen.queryByRole('button', {
          name: /excluir despesa de alimentação/i,
        }),
      ).not.toBeInTheDocument(),
    );

    // Toast shows after API confirms (after the 200ms delay)
    await waitFor(
      () =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Despesa excluída com sucesso!',
        ),
      { timeout: 5000 },
    );
  });

  it('rolls back optimistic delete on API error and shows error toast', async () => {
    server.use(
      http.delete(`${BASE}/expenses/:id`, () =>
        HttpResponse.json(
          { message: 'Erro ao excluir', statusCode: 500 },
          { status: 500 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<ExpensesPage />);

    await waitFor(() =>
      screen.getByRole('button', {
        name: /excluir despesa de alimentação/i,
      }),
    );

    await user.click(
      screen.getByRole('button', { name: /excluir despesa de alimentação/i }),
    );

    // Error toast shows
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Erro ao excluir'),
    );

    // Rollback: expense row is restored
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: /excluir despesa de alimentação/i,
        }),
      ).toBeInTheDocument(),
    );
  });

  it('triggers CSV download on Exportar click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExpensesPage />);

    await user.click(screen.getByRole('button', { name: /exportar/i }));

    await waitFor(() =>
      expect(URL.createObjectURL as jest.Mock).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Exportação concluída!',
      ),
    );
  });
});
