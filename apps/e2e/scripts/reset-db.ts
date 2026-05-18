const API = 'http://localhost:3000/api/v1';

async function run(): Promise<void> {
  // The backend is already running when globalSetup executes (Playwright starts
  // webServers before globalSetup). Deleting the SQLite file while the backend
  // holds it open causes "attempt to write a readonly database" on Linux.
  // Instead, wipe all data through the API so the backend retains its file handle.
  const expensesRes = await fetch(`${API}/expenses`);
  if (!expensesRes.ok) {
    throw new Error(`GET /expenses failed: ${expensesRes.status}`);
  }
  const expenses = await expensesRes.json();
  for (const expense of expenses) {
    await fetch(`${API}/expenses/${expense.id}`, { method: 'DELETE' });
  }

  const categoriesRes = await fetch(`${API}/categories`);
  if (!categoriesRes.ok) {
    throw new Error(`GET /categories failed: ${categoriesRes.status}`);
  }
  const categories = await categoriesRes.json();
  for (const category of categories) {
    await fetch(`${API}/categories/${category.id}`, { method: 'DELETE' });
  }

  console.log(`[reset-db] Wiped ${expenses.length} expenses and ${categories.length} categories via API`);
}

export default run;

if (require.main === module) {
  run().catch((err) => {
    console.error('[reset-db] Error:', err);
    process.exit(1);
  });
}
