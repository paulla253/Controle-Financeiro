import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { AddExpenseModal } from '../components/AddExpenseModal';
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

describe('AddExpenseModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders form fields and action buttons', () => {
    renderWithProviders(<AddExpenseModal onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /salvar despesa/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('submits valid expense, shows success toast and closes modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddExpenseModal onClose={onClose} />);

    // Wait for categories to load in the select
    await waitFor(() =>
      expect(screen.getAllByRole('option').length).toBeGreaterThan(1),
    );

    fireEvent.change(screen.getByLabelText(/data/i), {
      target: { value: '2024-01-15' },
    });
    await user.selectOptions(screen.getByLabelText(/categoria/i), '1');
    await user.type(screen.getByLabelText(/valor/i), '100');
    await user.click(screen.getByRole('button', { name: /salvar despesa/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Despesa criada com sucesso!',
    );
  });

  it('shows validation error when amount is zero or negative', async () => {
    let postCalled = false;
    server.use(
      http.post(`${BASE}/expenses`, () => {
        postCalled = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<AddExpenseModal onClose={onClose} />);

    await waitFor(() =>
      expect(screen.getAllByRole('option').length).toBeGreaterThan(1),
    );

    fireEvent.change(screen.getByLabelText(/data/i), {
      target: { value: '2024-01-15' },
    });
    await user.selectOptions(screen.getByLabelText(/categoria/i), '1');
    await user.type(screen.getByLabelText(/valor/i), '0');
    await user.click(screen.getByRole('button', { name: /salvar despesa/i }));

    expect(postCalled).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByText(/valor deve ser maior que zero/i),
    ).toBeInTheDocument();
  });

  it('shows validation error when category is not selected', async () => {
    let postCalled = false;
    server.use(
      http.post(`${BASE}/expenses`, () => {
        postCalled = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<AddExpenseModal onClose={onClose} />);

    fireEvent.change(screen.getByLabelText(/data/i), {
      target: { value: '2024-01-15' },
    });
    await user.type(screen.getByLabelText(/valor/i), '100');
    // Category intentionally not selected
    await user.click(screen.getByRole('button', { name: /salvar despesa/i }));

    expect(postCalled).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
    // The error paragraph (not the option text)
    const errors = screen.getAllByText(/selecione uma categoria/i);
    expect(errors.some((el) => el.tagName === 'P')).toBe(true);
  });

  it('shows backend error toast on API error and keeps modal open', async () => {
    server.use(
      http.post(`${BASE}/expenses`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'Categoria não encontrada',
            error: 'Bad Request',
          },
          { status: 400 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<AddExpenseModal onClose={onClose} />);

    await waitFor(() =>
      expect(screen.getAllByRole('option').length).toBeGreaterThan(1),
    );

    fireEvent.change(screen.getByLabelText(/data/i), {
      target: { value: '2024-01-15' },
    });
    await user.selectOptions(screen.getByLabelText(/categoria/i), '1');
    await user.type(screen.getByLabelText(/valor/i), '100');
    await user.click(screen.getByRole('button', { name: /salvar despesa/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Categoria não encontrada',
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal when Cancelar is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddExpenseModal onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
