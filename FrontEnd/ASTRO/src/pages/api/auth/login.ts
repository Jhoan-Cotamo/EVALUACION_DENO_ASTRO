import type { APIRoute } from 'astro';
import { API_URL } from '../../../lib/api';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  // Reenvía la cookie que puso el backend Deno al navegador
  const setCookie = res.headers.get('set-cookie');
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (setCookie) headers.set('set-cookie', setCookie);

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers,
  });
};