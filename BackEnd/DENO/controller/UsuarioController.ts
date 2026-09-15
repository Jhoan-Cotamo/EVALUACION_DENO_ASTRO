import { Context, RouterContext } from "../dependencies/dependencias.ts";
import { UsuarioModel } from "../models/UsuarioModel.ts";
import { hashPassword } from "../helpers/hashHelper.ts";

const usuarioModel = new UsuarioModel();

export async function obtenerUsuarios(ctx: Context) {
  try {
    const usuarios = await usuarioModel.buscarTodos();
    // No exponer contraseñas
    const seguros = usuarios.map(({ contraseña: _c, ...u }) => u);
    ctx.response.status = 200;
    ctx.response.body = seguros;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener usuarios" };
  }
}

export async function obtenerUsuarioPorId(ctx: RouterContext<"/usuarios/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const usuario = await usuarioModel.buscarPorId(id);
    if (!usuario) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }
    const { contraseña: _c, ...seguro } = usuario;
    ctx.response.status = 200;
    ctx.response.body = seguro;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener usuario" };
  }
}

export async function crearUsuario(ctx: Context) {
  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const { nombre, correo, contraseña, rol, estado } = datos;

    if (!nombre || !correo || !contraseña || !rol) {
      ctx.response.status = 400;
      ctx.response.body = { error: "nombre, correo, contraseña y rol son obligatorios" };
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Formato de correo inválido" };
      return;
    }

    if (!["Administrador", "Técnico"].includes(rol)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Rol inválido. Debe ser Administrador o Técnico" };
      return;
    }

    const hash = await hashPassword(contraseña);
    const id = await usuarioModel.crear({ nombre, correo, contraseña: hash, rol, estado });

    ctx.response.status = 201;
    ctx.response.body = { mensaje: "Usuario creado exitosamente", id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El correo ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al crear usuario" };
    }
  }
}

export async function actualizarUsuario(ctx: RouterContext<"/usuarios/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const existe = await usuarioModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }

    if (datos.rol && !["Administrador", "Técnico"].includes(datos.rol)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Rol inválido" };
      return;
    }

    if (datos.contraseña) {
      datos.contraseña = await hashPassword(datos.contraseña);
    }

    await usuarioModel.actualizar(id, { ...existe, ...datos });
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Usuario actualizado exitosamente" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El correo ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al actualizar usuario" };
    }
  }
}

export async function eliminarUsuario(ctx: RouterContext<"/usuarios/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const existe = await usuarioModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }

    await usuarioModel.eliminar(id);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Usuario eliminado exitosamente" };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al eliminar usuario" };
  }
}
