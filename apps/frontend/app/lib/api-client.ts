const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Erro de rede: não foi possível conectar ao servidor.');
  }

  if (!response.ok) {
    let body: { message?: string; details?: unknown } = {};
    try {
      body = await response.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      response.status,
      body.message ?? response.statusText,
      body.details,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function requestBlob(path: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw new ApiError(0, 'Erro de rede: não foi possível conectar ao servidor.');
  }

  if (!response.ok) {
    let body: { message?: string; details?: unknown } = {};
    try {
      body = await response.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, body.message ?? response.statusText, body.details);
  }

  return response.blob();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: 'POST',
      body: formData,
      headers: {},
    }),
  getBlob: (path: string) => requestBlob(path),
};
