import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import CategoriesPage from '../categories/page';
import { ToastContainer } from '../components/Toast';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
      <ToastContainer />
    </QueryClientProvider>,
  );
}

describe('CategoriesPage', () => {
  it('renders categories returned by the API', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
    });

    expect(screen.getByText(/2 categorias encontradas/i)).toBeInTheDocument();
  });

  it('renders empty state when there are no categories', async () => {
    server.use(
      http.get(`${BASE}/categories`, () => HttpResponse.json([])),
    );

    renderWithProviders(<CategoriesPage />);

    await waitFor(() =>
      expect(
        screen.getByText(/nenhuma categoria cadastrada/i),
      ).toBeInTheDocument(),
    );
  });

  it('opens AddCategoryModal when "Nova Categoria" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => screen.getByText('Alimentação'));

    await user.click(screen.getByRole('button', { name: /nova categoria/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /nova categoria/i }),
    ).toBeInTheDocument();
  });

  it('creates a category, shows success toast and closes modal', async () => {
    server.use(
      http.get(`${BASE}/categories`, () =>
        HttpResponse.json([
          { id: 1, name: 'Alimentação', createdAt: '2024-01-01T00:00:00.000Z' },
          { id: 2, name: 'Transporte', createdAt: '2024-01-01T00:00:00.000Z' },
          { id: 3, name: 'Saúde', createdAt: '2024-01-01T00:00:00.000Z' },
        ]),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => screen.getByText('Alimentação'));

    await user.click(screen.getByRole('button', { name: /nova categoria/i }));
    await user.type(screen.getByLabelText(/nome/i), 'Saúde');
    await user.click(screen.getByRole('button', { name: /salvar categoria/i }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Categoria criada com sucesso!',
      ),
    );
    await waitFor(() => expect(screen.getByText('Saúde')).toBeInTheDocument());
  });

  it('deletes a category and shows success toast', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => screen.getByText('Transporte'));

    const transportRow = screen.getByText('Transporte').closest('tr')!;
    await user.click(
      within(transportRow).getByRole('button', { name: /excluir/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Categoria excluída com sucesso!',
      ),
    );
  });

  it('shows backend error message on 409 delete and keeps category in list', async () => {
    server.use(
      http.delete(`${BASE}/categories/:id`, () =>
        HttpResponse.json(
          {
            statusCode: 409,
            message:
              'Esta categoria não pode ser excluída pois possui despesas vinculadas.',
            error: 'Conflict',
          },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => screen.getByText('Alimentação'));

    const alimentacaoRow = screen.getByText('Alimentação').closest('tr')!;
    await user.click(
      within(alimentacaoRow).getByRole('button', { name: /excluir/i }),
    );

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Esta categoria não pode ser excluída pois possui despesas vinculadas.',
      ),
    );

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
  });
});
