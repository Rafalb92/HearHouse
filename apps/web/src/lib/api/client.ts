import { ApiError, type NestErrorBody } from '@/lib/errors/api-error';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const SKIP_REFRESH = new Set([
  '/auth/refresh',
  '/auth/session',
  '/auth/logout',
  '/auth/csrf-token',
]);

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export async function getCsrfToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/csrf-token`, {
    credentials: 'include',
  });
  const data = (await res.json()) as { csrfToken: string };
  return data.csrfToken;
}

async function refreshTokens(): Promise<void> {
  const csrfToken = await getCsrfToken();
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
  });

  if (!res.ok) throw new Error('Refresh failed');
}

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  _retry?: boolean; // flaga wewnętrzna — nie przekazuj z zewnątrz
};

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const { body, headers, _retry = false, ...rest } = options;

  const csrfHeaders: Record<string, string> = {};
  if (!CSRF_SAFE_METHODS.has(method)) {
    const token = await getCsrfToken();
    csrfHeaders['X-CSRF-Token'] = token;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401 → próbuj refresh, potem retry ──────────────────────────────────
  if (res.status === 401 && !_retry && !SKIP_REFRESH.has(path)) {
    try {
      if (!refreshPromise) {
        // ← sprawdzaj promise, nie flagę
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = null;
          isRefreshing = false;
        });
        isRefreshing = true;
      }

      await refreshPromise; // ← wszystkie czekają na TEN SAM promise
      return apiClient<T>(path, { ...options, _retry: true });
    } catch {
      throw new ApiError(401, {
        statusCode: 401,
        message: 'Session expired. Please sign in again.',
      });
    }
  }
  // ───────────────────────────────────────────────────────────────────────

  if (!res.ok) {
    let errorBody: NestErrorBody;
    try {
      errorBody = (await res.json()) as NestErrorBody;
    } catch {
      errorBody = {
        statusCode: res.status,
        message: res.statusText || 'Unknown error',
      };
    }
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
