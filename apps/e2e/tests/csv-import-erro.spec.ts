import { test, expect } from '@playwright/test';

const INVALID_CSV_CONTENT = Buffer.from(
  'Data,Categoria,Valor\nNAO_E_DATA,Alimentação,150.00\n',
  'utf-8',
);

test('CSV inválido aborta importação sem alterar contagem de despesas', async ({ page }) => {
  await page.goto('/expenses');
  await page.getByRole('heading', { name: 'Despesas' }).waitFor();

  // Wait for initial load to settle
  await expect(page.getByText('Carregando despesas')).not.toBeVisible({ timeout: 10_000 });

  // Capture initial expense count from the subtitle text (e.g. "5 despesas encontradas")
  const subtitleLocator = page.locator('span', { hasText: /despesa/ }).first();
  const initialCountText = await subtitleLocator.textContent({ timeout: 5_000 });
  const initialCount = parseInt(initialCountText ?? '0');

  // Upload invalid CSV via the hidden file input
  const fileInput = page.locator('[data-testid="import-file-input"]');
  await fileInput.setInputFiles({
    name: 'invalido.csv',
    mimeType: 'text/csv',
    buffer: INVALID_CSV_CONTENT,
  });

  // An error alert should appear (toast component uses role="alert")
  const alert = page.locator('[role="alert"]:not(#__next-route-announcer__)');
  await expect(alert).toBeVisible({ timeout: 10_000 });
  await expect(alert).toContainText(/Line|Erro|erro|inválid/i);

  // Expense count must remain unchanged after the failed import
  await expect(subtitleLocator).toHaveText(
    new RegExp(`^${initialCount}\\s+despesa`),
    { timeout: 5_000 },
  );
});
