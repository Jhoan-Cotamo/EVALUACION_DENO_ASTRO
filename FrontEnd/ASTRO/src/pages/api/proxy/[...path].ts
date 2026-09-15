import type { APIRoute } from 'astro';
import { API_URL } from '../../../lib/api';

/**
 * Proxy genérico: reenvía cualquier petición del frontend al backend Deno
 * adjuntando automáticamente la cookie de sesión del usuario.
 *
 * Ejemplos que resuelve este archivo:
 *   GET  /api/proxy/clientes          → GET  http://localhost:8000/api/clientes
 *   POST /api/proxy/ordenes           → POST http://localhost:8000/api/ordenes
 *   PATCH /api/proxy/ordenes/3/estado → PATCH http://localhost:8000/api/ordenes/3/estado
 */
export const ALL: APIRoute = async ({ request, params }) => {
  const path    = params.path ?? '';
  const backUrl = `${API_URL}/api/${path}`;
  const cookie  = request.headers.get('cookie') ?? '';

  // Determinar si hay cuerpo que reenviar
  const bodyMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const hasBody     = bodyMethods.includes(request.method);

  let bodyText: string | undefined;
  if (hasBody) {
    try { bodyText = await request.text(); } catch { bodyText = undefined; }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Cookie: cookie,
  };

  const res = await fetch(backUrl, {
    method:  request.method,
    headers,
    body:    hasBody && bodyText ? bodyText : undefined,
  });

  const data = await res.text();

  return new Response(data, {
    status:  res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};