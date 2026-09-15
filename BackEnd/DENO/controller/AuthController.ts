import { Context } from "../dependencies/dependencias.ts";
import { UsuarioModel } from "../models/UsuarioModel.ts";
import { compararPassword } from "../helpers/hashHelper.ts";
import { generarToken } from "../helpers/jwtHelper.ts";
import type { EstadoAutenticado } from "../middlewares/authMiddleware.ts";

const usuarioModel = new UsuarioModel();

export async function login(ctx: Context) {
  const body = ctx.request.body({ type: "json" });
  const { correo, password } = await body.value;

  if (!correo || !password) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Correo y contraseña son obligatorios" };
    return;
  }

  const usuario = await usuarioModel.buscarPorCorreo(correo);

  if (!usuario) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Credenciales inválidas" };
    return;
  }

  if (usuario.estado === "Inactivo") {
    ctx.response.status = 401;
    ctx.response.body = { error: "Usuario inactivo, contacte al administrador" };
    return;
  }

  const passwordValida = await compararPassword(password, usuario.contraseña);

  if (!passwordValida) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Credenciales inválidas" };
    return;
  }

  const token = await generarToken({
    id_usuario: usuario.id!,
    correo: usuario.correo,
    rol: usuario.rol,
  });

  await ctx.cookies.set("token", token, {
    httpOnly: true,
    secure: false, // cambiar a true en producción con HTTPS
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 horas, igual que la duración del JWT
    path: "/",
  });

  ctx.response.status = 200;
  ctx.response.body = {
    mensaje: "Inicio de sesión exitoso",
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
}

export async function logout(ctx: Context) {
  await ctx.cookies.delete("token", { path: "/" });
  ctx.response.status = 200;
  ctx.response.body = { mensaje: "Sesión cerrada" };
}

// Requiere el middleware verificarAutenticacion antes en la ruta.
export function perfil(ctx: Context<EstadoAutenticado>) {
  ctx.response.status = 200;
  ctx.response.body = { usuario: ctx.state.usuario };
}