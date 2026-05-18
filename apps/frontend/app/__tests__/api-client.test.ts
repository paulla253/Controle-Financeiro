import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { apiClient, ApiError } from '../lib/api-client';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

describe('apiClient', () => {
  describe('GET success', () => {
    it('returns parsed JSON on 200', async () => {
      server.use(
        http.get(`${BASE}/categories`, () =>
          HttpResponse.json([{ id: 1, name: 'Alimentação' }]),
        ),
      );

      const data = await apiClient.get<{ id: number; name: string }[]>('/categories');
      expect(data).toEqual([{ id: 1, name: 'Alimentação' }]);
    });
  });

  describe('GET error', () => {
    it('throws ApiError with message and details on 4xx', async () => {
      server.use(
        http.get(`${BASE}/categories`, () =>
          HttpResponse.json(
            { statusCode: 404, message: 'Não encontrado', details: 'recurso inexistente' },
            { status: 404 },
          ),
        ),
      );

      await expect(apiClient.get('/categories')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Não encontrado',
        details: 'recurso inexistente',
      });
    });

    it('thrown error is instance of ApiError', async () => {
      server.use(
        http.get(`${BASE}/categories`, () =>
          HttpResponse.json({ message: 'Erro interno' }, { status: 500 }),
        ),
      );

      try {
        await apiClient.get('/categories');
        fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
      }
    });
  });
});
