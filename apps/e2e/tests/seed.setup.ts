import { test as setup, expect } from '@playwright/test';

const API = 'http://localhost:3000/api/v1';

// Seeds the e2e database via HTTP after the backend has created the schema.
// Matches the data expected by filtros-tabela.spec.ts and other specs:
//   Jan-10  Alimentação  R$ 200,00
//   Feb-15  Transporte   R$ 150,00
//   Mar-20  Alimentação  R$ 300,00
//   Apr-05  Lazer        R$ 80,00
//   <currentMonth>-05  Lazer  R$ 250,00
setup('seed e2e database', async ({ request }) => {
  const alimRes = await request.post(`${API}/categories`, { data: { name: 'Alimentação' } });
  await expect(alimRes).toBeOK();
  const alim = await alimRes.json();

  const transRes = await request.post(`${API}/categories`, { data: { name: 'Transporte' } });
  await expect(transRes).toBeOK();
  const trans = await transRes.json();

  const lazerRes = await request.post(`${API}/categories`, { data: { name: 'Lazer' } });
  await expect(lazerRes).toBeOK();
  const lazer = await lazerRes.json();

  const year = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  const expenses = [
    { date: `10/01/${year}`, amount: 200.0, categoryId: alim.id },
    { date: `15/02/${year}`, amount: 150.0, categoryId: trans.id },
    { date: `20/03/${year}`, amount: 300.0, categoryId: alim.id },
    { date: `05/04/${year}`, amount: 80.0, categoryId: lazer.id },
    { date: `05/${currentMonth}/${year}`, amount: 250.0, categoryId: lazer.id },
  ];

  for (const expense of expenses) {
    const res = await request.post(`${API}/expenses`, { data: expense });
    await expect(res).toBeOK();
  }
});
