import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

describe('Header', () => {
  beforeEach(() => {
    render(<Header />);
  });

  it('renders navigation landmark', () => {
    expect(screen.getByRole('navigation', { name: /navegação principal/i })).toBeInTheDocument();
  });

  it('has Dashboard link', () => {
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('has Despesas link', () => {
    const link = screen.getByRole('link', { name: /despesas/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/expenses');
  });

  it('has Categorias link', () => {
    const link = screen.getByRole('link', { name: /categorias/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/categories');
  });

  it('marks current page link with aria-current="page"', () => {
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });
});
