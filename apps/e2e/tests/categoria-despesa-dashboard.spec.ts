import { test, expect } from '@playwright/test';

const CATEGORY_NAME = 'Categoria E2E';
const EXPENSE_AMOUNT = '99.90';

test('cria categoria, cria despesa e verifica no dashboard', async ({ page }) => {
  // ── 1. Criar categoria ───────────────────────────────────────────────────────
  await page.goto('/categories');
  await page.getByRole('heading', { name: 'Categorias Existentes' }).waitFor();

  await page.getByRole('button', { name: 'Nova Categoria' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.fill('#category_name', CATEGORY_NAME);
  await page.getByRole('button', { name: 'Salvar Categoria' }).click();

  await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText('Categoria criada com sucesso');
  await expect(page.getByRole('cell', { name: CATEGORY_NAME, exact: true })).toBeVisible();

  // ── 2. Criar despesa com a nova categoria ───────────────────────────────────
  await page.goto('/expenses');
  await page.getByRole('heading', { name: 'Despesas' }).waitFor();

  await page.getByRole('button', { name: 'Nova Despesa' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for input[type=date]
  await page.fill('#expense_date', today);
  await page.selectOption('#expense_category', { label: CATEGORY_NAME });
  await page.fill('#expense_amount', EXPENSE_AMOUNT);

  await page.getByRole('button', { name: 'Salvar Despesa' }).click();

  await expect(page.locator('[role="alert"]:not(#__next-route-announcer__)')).toContainText('Despesa criada com sucesso');
  await expect(page.getByRole('dialog')).not.toBeVisible();

  // ── 3. Verificar despesa no Dashboard ───────────────────────────────────────
  await page.goto('/');
  await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
  await expect(page.getByText('Últimas Despesas Adicionadas')).toBeVisible();

  // Wait for all loading indicators to disappear
  await expect(page.getByText('Carregando...')).toHaveCount(0, { timeout: 10_000 });

  // CATEGORY_NAME is unique; the newest expense should appear in the dashboard table
  await expect(page.getByText(CATEGORY_NAME).first()).toBeVisible({ timeout: 10_000 });
});
