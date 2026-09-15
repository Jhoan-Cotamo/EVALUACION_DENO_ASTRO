import { apiFetch } from './api';

/**
 * Verifica si la sesión es válida consultando el backend.
 * Retorna el usuario autenticado o null.
 */
export async function getUsuario(cookie: string | null) {
  if (!cookie) return null;
  try {
    const res = await apiFetch('/api/auth/perfil', cookie);
    if (!res.ok) return null;
    const data = await res.json();
    return data.usuario as {
      id: number;
      nombre: string;
      correo: string;
      rol: 'Administrador' | 'Técnico';
    };
  } catch {
    return null;
  }
}