import { formatBRDate, parseBRDate } from './date';

describe('parseBRDate', () => {
  it('converts 01/01/2024 to 2024-01-01', () => {
    expect(parseBRDate('01/01/2024')).toBe('2024-01-01');
  });

  it('converts 31/12/2024 to 2024-12-31', () => {
    expect(parseBRDate('31/12/2024')).toBe('2024-12-31');
  });

  it('converts a mid-year date', () => {
    expect(parseBRDate('15/06/2023')).toBe('2023-06-15');
  });

  it('preserves leading zeros in day and month', () => {
    expect(parseBRDate('05/03/2024')).toBe('2024-03-05');
  });
});

describe('formatBRDate', () => {
  it('converts 2024-01-01 to 01/01/2024', () => {
    expect(formatBRDate('2024-01-01')).toBe('01/01/2024');
  });

  it('converts 2024-12-31 to 31/12/2024', () => {
    expect(formatBRDate('2024-12-31')).toBe('31/12/2024');
  });

  it('converts a mid-year date', () => {
    expect(formatBRDate('2023-06-15')).toBe('15/06/2023');
  });

  it('preserves leading zeros', () => {
    expect(formatBRDate('2024-03-05')).toBe('05/03/2024');
  });
});

describe('round-trip', () => {
  it('parseBRDate(formatBRDate(iso)) returns original ISO', () => {
    const iso = '2024-07-20';
    expect(parseBRDate(formatBRDate(iso))).toBe(iso);
  });

  it('formatBRDate(parseBRDate(br)) returns original BR date', () => {
    const br = '20/07/2024';
    expect(formatBRDate(parseBRDate(br))).toBe(br);
  });
});
