import { http, HttpResponse } from 'msw';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const defaultCategories = [
  { id: 1, name: 'Alimentação', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2, name: 'Transporte', createdAt: '2024-01-01T00:00:00.000Z' },
];

export const defaultCurrentMonthSummary = [
  { category: 'Alimentação', total: 400, percentage: 80 },
  { category: 'Transporte', total: 100, percentage: 20 },
];

export const defaultAnnualSummary = [
  { month: 1, total: 500 },
  { month: 2, total: 750 },
  { month: 3, total: 620 },
  { month: 4, total: 480 },
  { month: 5, total: 900 },
  { month: 6, total: 670 },
];

export const defaultExpenses = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 150.0,
    categoryId: 1,
    category: { id: 1, name: 'Alimentação' },
    createdAt: '2024-01-15T12:00:00.000Z',
  },
  {
    id: 2,
    date: '2024-01-10',
    amount: 50.0,
    categoryId: 2,
    category: { id: 2, name: 'Transporte' },
    createdAt: '2024-01-10T10:00:00.000Z',
  },
];

export const handlers = [
  http.get(`${BASE}/categories`, () => {
    return HttpResponse.json(defaultCategories);
  }),

  http.post(`${BASE}/categories`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(
      { id: 3, name: body.name, createdAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  http.delete(`${BASE}/categories/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/expenses`, () => {
    return HttpResponse.json(defaultExpenses);
  }),

  http.post(`${BASE}/expenses`, async ({ request }) => {
    const body = (await request.json()) as {
      date: string;
      categoryId: number;
      amount: number;
    };
    const category =
      defaultCategories.find((c) => c.id === body.categoryId) ??
      defaultCategories[0];
    return HttpResponse.json(
      {
        id: 99,
        date: body.date,
        amount: body.amount,
        categoryId: body.categoryId,
        category,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  http.delete(`${BASE}/expenses/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${BASE}/csv/import`, () => {
    return HttpResponse.json({ imported: 2 });
  }),

  http.get(`${BASE}/csv/export`, () => {
    return new HttpResponse(
      'Data,Categoria,Valor\n15/01/2024,Alimentação,150.00\n10/01/2024,Transporte,50.00',
      { headers: { 'Content-Type': 'text/csv; charset=utf-8' } },
    );
  }),

  http.get(`${BASE}/expenses/annual-summary`, () => {
    return HttpResponse.json(defaultAnnualSummary);
  }),

  http.get(`${BASE}/expenses/current-month-summary`, () => {
    return HttpResponse.json(defaultCurrentMonthSummary);
  }),
];
