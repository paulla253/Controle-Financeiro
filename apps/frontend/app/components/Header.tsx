'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../providers';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/expenses', label: 'Despesas' },
  { href: '/categories', label: 'Categorias' },
];

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
        <span className="text-lg font-bold text-on-surface">
          Controle Financeiro
        </span>
        <div className="flex items-center gap-2">
          <nav aria-label="Navegação principal">
            <ul className="flex gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={pathname === href ? 'page' : undefined}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === href
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px] leading-none">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
