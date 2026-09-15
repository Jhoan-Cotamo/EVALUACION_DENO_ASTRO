import { Context, RouterContext } from "../dependencies/dependencias.ts";
import { TecnicoModel } from "../models/TecnicoModel.ts";

const tecnicoModel = new TecnicoModel();

export async function obtenerTecnicos(ctx: Context) {
  try {
    const tecnicos = await tecnicoModel.buscarTodos();
    ctx.response.status = 200;
    ctx.response.body = tecnicos;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener técnicos" };
  }
}

export async function obtenerTecnicoPorId(ctx: RouterContext<"/api/tecnicos/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const tecnico = await tecnicoModel.buscarPorId(id);
    if (!tecnico) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Técnico no encontrado" };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = tecnico;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener técnico" };
  }
}

export async function crearTecnico(ctx: Context) {
  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const { nombre, documento, especialidad, telefono, estado } = datos;

    if (!nombre || !documento) {
      ctx.response.status = 400;
      ctx.response.body = { error: "nombre y documento son obligatorios" };
      return;
    }

    if (estado && !["Activo", "Inactivo"].includes(estado)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Estado inválido. Debe ser Activo o Inactivo" };
      return;
    }

    const id = await tecnicoModel.crear({ nombre, documento, especialidad, telefono, estado });
    ctx.response.status = 201;
    ctx.response.body = { mensaje: "Técnico registrado exitosamente", id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El documento ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al crear técnico" };
    }
  }
}

export async function actualizarTecnico(ctx: RouterContext<"/api/tecnicos/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const existe = await tecnicoModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Técnico no encontrado" };
      return;
    }

    if (datos.estado && !["Activo", "Inactivo"].includes(datos.estado)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Estado inválido. Debe ser Activo o Inactivo" };
      return;
    }

    await tecnicoModel.actualizar(id, datos);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Técnico actualizado exitosamente" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El documento ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al actualizar técnico" };
    }
  }
}

export async function eliminarTecnico(ctx: RouterContext<"/api/tecnicos/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const existe = await tecnicoModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Técnico no encontrado" };
      return;
    }

    await tecnicoModel.eliminar(id);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Técnico eliminado exitosamente" };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al eliminar técnico" };
  }
}