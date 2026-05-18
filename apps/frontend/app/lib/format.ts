const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrencyBRL(value: number): string {
  return BRL.format(value);
}

export function formatDateBR(isoDate: string): string {
  // isoDate: YYYY-MM-DD → DD/MM/YYYY  (no timezone shift)
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function parseDateBR(brDate: string): string {
  // brDate: DD/MM/YYYY → YYYY-MM-DD
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}
