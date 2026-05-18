import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { AddCategoryModal } from '../components/AddCategoryModal';
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

describe('AddCategoryModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders with name input and action buttons', () => {
    renderWithProviders(<AddCategoryModal onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /salvar categoria/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('submits form with valid name, shows success toast and closes modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddCategoryModal onClose={onClose} />);

    await user.type(screen.getByLabelText(/nome/i), 'Saúde');
    await user.click(screen.getByRole('button', { name: /salvar categoria/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Categoria criada com sucesso!',
    );
  });

  it('does not submit when name is empty (HTML validation)', async () => {
    const user = userEvent.setup();
    let postCalled = false;
    server.use(
      http.post(`${BASE}/categories`, () => {
        postCalled = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    renderWithProviders(<AddCategoryModal onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /salvar categoria/i }));

    expect(postCalled).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows error toast from API and keeps modal open on error', async () => {
    server.use(
      http.post(`${BASE}/categories`, () =>
        HttpResponse.json(
          {
            statusCode: 409,
            message: 'Categoria já existe',
            error: 'Conflict',
          },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<AddCategoryModal onClose={onClose} />);

    await user.type(screen.getByLabelText(/nome/i), 'Alimentação');
    await user.click(screen.getByRole('button', { name: /salvar categoria/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Categoria já existe'),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal when Cancelar is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddCategoryModal onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
