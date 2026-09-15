// URL base del backend Deno/Oak
export const API_URL = import.meta.env.API_URL ?? 'http://localhost:8000';

/**
 * Hace fetch al backend pasando la cookie de sesión.
 * Úsalo solo en páginas .astro (server-side).
 */
export async function apiFetch(
  path: string,
  cookie: string | null,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers ?? {}),
    },
  });
}