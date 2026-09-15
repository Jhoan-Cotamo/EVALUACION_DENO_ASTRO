import type { APIRoute } from 'astro';
import { API_URL } from '../../lib/api';

export const POST: APIRoute = async ({ request, cookies }) => {
  const cookie = request.headers.get('cookie');
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie ?? '' },
  });
  // Borra la cookie en el lado Astro también (por si acaso)
  cookies.delete('token', { path: '/' });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};