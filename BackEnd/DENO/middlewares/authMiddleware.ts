import { Context } from "../dependencies/dependencias.ts";
import { verificarToken, type TokenPayload } from "../helpers/jwtHelper.ts";

export interface EstadoAutenticado {
  usuario: TokenPayload;
}

export async function verificarAutenticacion(
  ctx: Context<EstadoAutenticado>,
  next: () => Promise<unknown>
) {
  const token = await ctx.cookies.get("token");

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "No autorizado: token no proporcionado" };
    return;
  }

  try {
    const payload = await verificarToken(token);
    ctx.state.usuario = payload;
    await next();
  } catch {
    ctx.response.status = 401;
    ctx.response.body = { error: "No autorizado: token inválido o expirado" };
  }
}

export function verificarRol(...rolesPermitidos: Array<"Administrador" | "Técnico">) {
  return async (ctx: Context<EstadoAutenticado>, next: () => Promise<unknown>) => {
    const usuario = ctx.state.usuario;

    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      ctx.response.status = 401;
      ctx.response.body = { error: "No tienes permisos para realizar esta acción" };
      return;
    }

    await next();
  };
}