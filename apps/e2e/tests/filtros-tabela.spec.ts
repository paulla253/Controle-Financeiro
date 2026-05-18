import { test, expect } from '@playwright/test';

// The reset-db seeds these expenses (using current year):
//   Jan-10  Alimentação  R$ 200,00
//   Feb-15  Transporte   R$ 150,00
//   Mar-20  Alimentação  R$ 300,00
//   Apr-05  Lazer        R$ 80,00
//   <currentMonth>-05  Alimentação  R$ 250,00

test.describe('Filtros da tabela de despesas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/expenses');
    await page.getByRole('heading', { name: 'Despesas' }).waitFor();
    await expect(page.getByText('Carregando despesas')).not.toBeVisible({ timeout: 10_000 });
  });

  test('filtro por mês=Janeiro e categoria=Alimentação retorna exatamente 1 despesa', async ({
    page,
  }) => {
    const year = new Date().getFullYear();

    await page.fill('[aria-label="Filtrar por ano"]', String(year));

    const responseAfterMonth = page.waitForResponse(
      (r) => r.url().includes('/expenses') && r.status() === 200,
    );
    await page.selectOption('[aria-label="Filtrar por mês"]', '1');
    await responseAfterMonth;

    const responseAfterCat = page.waitForResponse(
      (r) => r.url().includes('/expenses') && r.status() === 200,
    );
    await page.selectOption('[aria-label="Filtrar por categoria"]', { label: 'Alimentação' });
    await responseAfterCat;

    // Exactly 1 row: seed Jan/Alimentação
    await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 8_000 });
    // Use first() to avoid strict mode with delete button aria-label
    await expect(page.getByRole('cell', { name: 'Alimentação', exact: true }).first()).toBeVisible();
  });

  test('filtro por mês=Fevereiro e categoria=Transporte retorna exatamente 1 despesa', async ({
    page,
  }) => {
    const year = new Date().getFullYear();

    await page.fill('[aria-label="Filtrar por ano"]', String(year));

    const responseAfterMonth = page.waitForResponse(
      (r) => r.url().includes('/expenses') && r.status() === 200,
    );
    await page.selectOption('[aria-label="Filtrar por mês"]', '2');
    await responseAfterMonth;

    const responseAfterCat = page.waitForResponse(
      (r) => r.url().includes('/expenses') && r.status() === 200,
    );
    await page.selectOption('[aria-label="Filtrar por categoria"]', { label: 'Transporte' });
    await responseAfterCat;

    await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 8_000 });
    await expect(page.getByRole('cell', { name: 'Transporte', exact: true }).first()).toBeVisible();
  });

  test('filtro por mês=Fevereiro e categoria=Alimentação retorna lista vazia', async ({
    page,
  }) => {
    const year = new Date().getFullYear();

    await page.fill('[aria-label="Filtrar por ano"]', String(year));

    const responseAfterMonth = page.waitForResponse(
      (r) => r.url().includes('/expenses') && r.status() === 200,
    );
    await page.selectOption('[aria-label="Filtrar por mês"]', '2');
    await responseAfterMonth;

    const responseAfterCat = page.waitForResponse(
      (r) => r.url().includes('/expenses') && r.status() === 200,
    );
    await page.selectOption('[aria-label="Filtrar por categoria"]', { label: 'Alimentação' });
    await responseAfterCat;

    // No rows in February/Alimentação combination
    await expect(page.locator('tbody tr')).toHaveCount(0, { timeout: 8_000 });
    await expect(page.getByText('Nenhuma despesa encontrada.')).toBeVisible();
  });
});
