import { Context, RouterContext } from "../dependencies/dependencias.ts";
import { EquipoModel } from "../models/EquipoModel.ts";
import { ClienteModel } from "../models/ClienteModel.ts";

const equipoModel = new EquipoModel();
const clienteModel = new ClienteModel();

export async function obtenerEquipos(ctx: Context) {
  try {
    const equipos = await equipoModel.buscarTodos();
    ctx.response.status = 200;
    ctx.response.body = equipos;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener equipos" };
  }
}

export async function obtenerEquipoPorId(ctx: RouterContext<"/api/equipos/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const equipo = await equipoModel.buscarPorId(id);
    if (!equipo) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Equipo no encontrado" };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = equipo;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener equipo" };
  }
}

export async function obtenerEquiposPorCliente(ctx: RouterContext<"/api/clientes/:id/equipos">) {
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
    const equipos = await equipoModel.buscarPorCliente(id);
    ctx.response.status = 200;
    ctx.response.body = equipos;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener equipos del cliente" };
  }
}

export async function crearEquipo(ctx: Context) {
  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const { id_cliente, tipo_equipo, marca, modelo, numero_serie, descripcion_problema } = datos;

    if (!id_cliente || !tipo_equipo) {
      ctx.response.status = 400;
      ctx.response.body = { error: "id_cliente y tipo_equipo son obligatorios" };
      return;
    }

    const cliente = await clienteModel.buscarPorId(Number(id_cliente));
    if (!cliente) {
      ctx.response.status = 404;
      ctx.response.body = { error: "El cliente especificado no existe" };
      return;
    }

    const id = await equipoModel.crear({
      id_cliente: Number(id_cliente),
      tipo_equipo,
      marca,
      modelo,
      numero_serie,
      descripcion_problema,
    });

    ctx.response.status = 201;
    ctx.response.body = { mensaje: "Equipo registrado exitosamente", id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El número de serie ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al crear equipo" };
    }
  }
}

export async function actualizarEquipo(ctx: RouterContext<"/api/equipos/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const existe = await equipoModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Equipo no encontrado" };
      return;
    }

    if (datos.id_cliente) {
      const cliente = await clienteModel.buscarPorId(Number(datos.id_cliente));
      if (!cliente) {
        ctx.response.status = 404;
        ctx.response.body = { error: "El cliente especificado no existe" };
        return;
      }
    }

    await equipoModel.actualizar(id, datos);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Equipo actualizado exitosamente" };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Duplicate")) {
      ctx.response.status = 409;
      ctx.response.body = { error: "El número de serie ya está registrado" };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: "Error al actualizar equipo" };
    }
  }
}

export async function eliminarEquipo(ctx: RouterContext<"/api/equipos/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const existe = await equipoModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Equipo no encontrado" };
      return;
    }

    await equipoModel.eliminar(id);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Equipo eliminado exitosamente" };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al eliminar equipo" };
  }
}