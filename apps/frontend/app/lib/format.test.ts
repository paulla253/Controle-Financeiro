import { formatCurrencyBRL, formatDateBR, parseDateBR } from './format';

describe('formatCurrencyBRL', () => {
  it('formats 1234.56 as R$ 1.234,56', () => {
    expect(formatCurrencyBRL(1234.56)).toBe('R$ 1.234,56');
  });

  it('formats 0 as R$ 0,00', () => {
    expect(formatCurrencyBRL(0)).toBe('R$ 0,00');
  });

  it('formats negative values', () => {
    expect(formatCurrencyBRL(-50)).toBe('-R$ 50,00');
  });
});

describe('formatDateBR', () => {
  it('converts 2024-01-31 to 31/01/2024', () => {
    expect(formatDateBR('2024-01-31')).toBe('31/01/2024');
  });

  it('converts 2024-12-01 to 01/12/2024', () => {
    expect(formatDateBR('2024-12-01')).toBe('01/12/2024');
  });
});

describe('parseDateBR', () => {
  it('converts 31/12/2024 to 2024-12-31', () => {
    expect(parseDateBR('31/12/2024')).toBe('2024-12-31');
  });

  it('converts 01/01/2024 to 2024-01-01', () => {
    expect(parseDateBR('01/01/2024')).toBe('2024-01-01');
  });
});
