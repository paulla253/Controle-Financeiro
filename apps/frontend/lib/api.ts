export interface Category {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  category: Category;
}

export interface ExpenseFilter {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  categoryId?: string;
}

export interface AnnualReportEntry {
  month: string;
  total: number;
}

export interface MonthlyReportEntry {
  category: string;
  total: number;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  categoryId: string;
}

export interface CsvExpense {
  description: string;
  amount: string; // as string from CSV
  date: string; // as string from CSV
  categoryName: string; // as string from CSV
}

export interface ImportExpenseResult {
  message: string;
  importedCount: number;
  errors: { row: number; message: string }[];
}


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'; // Assuming backend runs on 3000

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('Falha ao buscar categorias');
  }
  return response.json();
}

export async function createCategory(name: string): Promise<Category> {
  const response = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Falha ao criar categoria');
  }
  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Falha ao deletar categoria');
  }
}

export async function getExpenses(filters?: ExpenseFilter): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (filters?.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.append('endDate', filters.endDate);
  }
  if (filters?.categoryId) {
    params.append('categoryId', filters.categoryId);
  }

  const queryString = params.toString();
  const response = await fetch(`${BASE_URL}/expenses${queryString ? `?${queryString}` : ''}`);

  if (!response.ok) {
    throw new Error('Falha ao buscar despesas');
  }
  return response.json();
}

export async function createExpense(data: CreateExpenseData): Promise<Expense> {
  const response = await fetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Falha ao criar despesa');
  }
  return response.json();
}

export async function getAnnualReport(year: number): Promise<AnnualReportEntry[]> {
  const response = await fetch(`${BASE_URL}/dashboard/annual?year=${year}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar relatório anual');
  }
  return response.json();
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReportEntry[]> {
  const response = await fetch(`${BASE_URL}/dashboard/monthly?year=${year}&month=${month}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar relatório mensal');
  }
  return response.json();
}

export async function exportExpenses(): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/expenses/export`);
  if (!response.ok) {
    throw new Error('Falha ao exportar despesas');
  }
  return response.blob();
}

export async function importExpenses(csvFile: File): Promise<ImportExpenseResult> {
  const formData = new FormData();
  formData.append('file', csvFile);

  const response = await fetch(`${BASE_URL}/expenses/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    // Attempt to parse error message from response body
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido durante a importação.' }));
    throw new Error(errorData.message || 'Falha ao importar despesas');
  }
  return response.json();
}
