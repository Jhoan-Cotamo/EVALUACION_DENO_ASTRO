import { Context, RouterContext } from "../dependencies/dependencias.ts";
import { ClienteModel } from "../models/ClienteModel.ts";

const clienteModel = new ClienteModel();

export async function obtenerClientes(ctx: Context) {
  try {
    const clientes = await clienteModel.buscarTodos();
    ctx.response.status = 200;
    ctx.response.body = clientes;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener clientes" };
  }
}

export async function obtenerClientePorId(ctx: RouterContext<"/api/clientes/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const cliente = await clienteModel.buscarPorId(id);
    if (!cliente) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Cliente no encontrado" };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = cliente;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener cliente" };
  }
}

export async function crearCliente(ctx: Context) {
  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const { nombre_completo, documento, correo, telefono } = datos;

    if (!nombre_completo || !documento || !correo) {
      ctx.response.status = 400;
      ctx.response.body = { error: "nombre_completo, documento y correo son obligatorios" };
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Formato de correo inválido" };
      return;
    }

    const id = await clienteModel.crear({ nombre_completo, documento, correo, telefono });
    ctx.response.status = 201;
    ctx.response.body = { mensaje: "Cliente creado exitosamente", id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El documento o correo ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al crear cliente" };
    }
  }
}

export async function actualizarCliente(ctx: RouterContext<"/api/clientes/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const existe = await clienteModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Cliente no encontrado" };
      return;
    }

    if (datos.correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datos.correo)) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Formato de correo inválido" };
        return;
      }
    }

    await clienteModel.actualizar(id, datos);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Cliente actualizado exitosamente" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El documento o correo ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al actualizar cliente" };
    }
  }
}

export async function eliminarCliente(ctx: RouterContext<"/api/clientes/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const existe = await clienteModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Cliente no encontrado" };
      return;
    }

    await clienteModel.eliminar(id);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Cliente eliminado exitosamente" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    // FK violation: cliente tiene equipos asociados
    if (msg.includes("foreign key") || msg.includes("FOREIGN KEY")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "No se puede eliminar: el cliente tiene equipos asociados" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al eliminar cliente" };
    }
  }
}