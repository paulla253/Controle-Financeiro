import { test, expect } from '@playwright/test';

test.describe('Gráfico de barras anual no Dashboard', () => {
  test('seletor de ano está presente e exibe o ano corrente por padrão', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();

    const yearSelect = page.getByRole('combobox', { name: 'Selecionar ano' });
    await expect(yearSelect).toBeVisible();

    const currentYear = String(new Date().getFullYear());
    await expect(yearSelect).toHaveValue(currentYear);

    await expect(page.getByText('Comparativo Anual de Despesas')).toBeVisible();
  });

  test('trocar o ano dispara nova requisição e mantém o gráfico visível', async ({ page }) => {
    // Register listener BEFORE navigation — the fetch fires on component mount
    const initialResponsePromise = page.waitForResponse(
      (r) => r.url().includes('/expenses/annual-summary') && r.status() === 200,
      { timeout: 15_000 },
    );

    await page.goto('/');
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
    await initialResponsePromise;

    const currentYear = new Date().getFullYear();
    const previousYear = String(currentYear - 1);

    // Register listener BEFORE selecting — avoids race between select and response
    const summaryRequestPromise = page.waitForResponse(
      (r) =>
        r.url().includes('/expenses/annual-summary') &&
        r.url().includes(`year=${previousYear}`) &&
        r.status() === 200,
      { timeout: 10_000 },
    );

    const yearSelect = page.getByRole('combobox', { name: 'Selecionar ano' });
    await yearSelect.selectOption(previousYear);

    const response = await summaryRequestPromise;
    expect(response.url()).toContain(`year=${previousYear}`);

    await expect(page.getByText('Comparativo Anual de Despesas')).toBeVisible();
    await expect(yearSelect).toHaveValue(previousYear);
  });

  test('pode voltar ao ano corrente após trocar sem erros', async ({ page }) => {
    // Register listener BEFORE navigation — the fetch fires on component mount
    const initialResponsePromise = page.waitForResponse(
      (r) => r.url().includes('/expenses/annual-summary') && r.status() === 200,
      { timeout: 15_000 },
    );

    await page.goto('/');
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
    await initialResponsePromise;

    const currentYear = new Date().getFullYear();
    const previousYear = String(currentYear - 1);
    const currentYearStr = String(currentYear);

    const yearSelect = page.getByRole('combobox', { name: 'Selecionar ano' });

    // Register listener BEFORE selecting to avoid race condition
    const prevYearResponsePromise = page.waitForResponse(
      (r) =>
        r.url().includes('/expenses/annual-summary') &&
        r.url().includes(`year=${previousYear}`),
      { timeout: 10_000 },
    );
    await yearSelect.selectOption(previousYear);
    await prevYearResponsePromise;

    // Switch back to current year (TanStack Query may serve from cache)
    await yearSelect.selectOption(currentYearStr);

    // Do not wait for a network call — cached data may be served directly.
    await expect(yearSelect).toHaveValue(currentYearStr);
    await expect(page.getByText('Comparativo Anual de Despesas')).toBeVisible();
  });
});
