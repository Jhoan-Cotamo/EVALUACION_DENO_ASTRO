import { Context, RouterContext } from "../dependencies/dependencias.ts";
import { OrdenModel, type Orden } from "../models/OrdenModel.ts";
import { ClienteModel } from "../models/ClienteModel.ts";
import { EquipoModel } from "../models/EquipoModel.ts";
import { TecnicoModel } from "../models/TecnicoModel.ts";
import { HistorialEstadoModel } from "../models/HistorialEstadoModel.ts";

const ordenModel = new OrdenModel();
const clienteModel = new ClienteModel();
const equipoModel = new EquipoModel();
const tecnicoModel = new TecnicoModel();
const historialModel = new HistorialEstadoModel();

type EstadoOrden = NonNullable<Orden["estado"]>;

// Transiciones válidas de estado
const TRANSICIONES_VALIDAS: Record<EstadoOrden, EstadoOrden[]> = {
  RECIBIDO:       ["EN DIAGNOSTICO", "CANCELADO"],
  "EN DIAGNOSTICO": ["COTIZADO", "CANCELADO"],
  COTIZADO:       ["EN REPARACION", "CANCELADO"],
  "EN REPARACION":  ["TERMINADO"],
  TERMINADO:      ["ENTREGADO"],
  ENTREGADO:      [],      // estado final, no retrocede
  CANCELADO:      [],      // estado final
};

function generarNumeroOrden(): string {
  const ahora = Date.now();
  return `ORD-${ahora}`;
}

export async function obtenerOrdenes(ctx: Context) {
  try {
    const ordenes = await ordenModel.buscarTodos();
    ctx.response.status = 200;
    ctx.response.body = ordenes;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener órdenes" };
  }
}

export async function obtenerOrdenPorId(ctx: RouterContext<"/ordenes/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const orden = await ordenModel.buscarPorId(id);
    if (!orden) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Orden no encontrada" };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = orden;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener orden" };
  }
}

export async function crearOrden(ctx: Context) {
  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const { id_cliente, id_equipo, id_tecnico, descripcion_problema, observaciones, valor_estimado } = datos;

    if (!id_cliente || !id_equipo || !id_tecnico) {
      ctx.response.status = 400;
      ctx.response.body = { error: "id_cliente, id_equipo e id_tecnico son obligatorios" };
      return;
    }

    if (valor_estimado !== undefined && Number(valor_estimado) < 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "El valor estimado no puede ser negativo" };
      return;
    }

    // Validar existencia de entidades
    const cliente = await clienteModel.buscarPorId(Number(id_cliente));
    if (!cliente) {
      ctx.response.status = 404;
      ctx.response.body = { error: "El cliente especificado no existe" };
      return;
    }

    const equipo = await equipoModel.buscarPorId(Number(id_equipo));
    if (!equipo) {
      ctx.response.status = 404;
      ctx.response.body = { error: "El equipo especificado no existe" };
      return;
    }

    if (equipo.id_cliente !== Number(id_cliente)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "El equipo no pertenece al cliente indicado" };
      return;
    }

    const tecnico = await tecnicoModel.buscarPorId(Number(id_tecnico));
    if (!tecnico) {
      ctx.response.status = 404;
      ctx.response.body = { error: "El técnico especificado no existe" };
      return;
    }

    if (tecnico.estado === "Inactivo") {
      ctx.response.status = 400;
      ctx.response.body = { error: "No se puede asignar la orden a un técnico inactivo" };
      return;
    }

    const numero_orden = generarNumeroOrden();

    const id = await ordenModel.crear({
      numero_orden,
      id_cliente: Number(id_cliente),
      id_equipo: Number(id_equipo),
      id_tecnico: Number(id_tecnico),
      descripcion_problema,
      observaciones,
      valor_estimado: valor_estimado ? Number(valor_estimado) : 0,
      valor_final: 0,
      estado: "RECIBIDO",
    });

    // Registrar en historial
    await historialModel.crear({ id_orden: id, estado: "RECIBIDO" });

    ctx.response.status = 201;
    ctx.response.body = { mensaje: "Orden creada exitosamente", id, numero_orden };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al crear orden" };
  }
}

export async function actualizarOrden(ctx: RouterContext<"/ordenes/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const body = ctx.request.body({ type: "json" });
    const datos = await body.value;

    const orden = await ordenModel.buscarPorId(id);
    if (!orden) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Orden no encontrada" };
      return;
    }

    if (datos.valor_estimado !== undefined && Number(datos.valor_estimado) < 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "El valor estimado no puede ser negativo" };
      return;
    }

    if (datos.valor_final !== undefined && Number(datos.valor_final) < 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "El valor final no puede ser negativo" };
      return;
    }

    // No permitir cambio de estado por esta ruta (usar PATCH /ordenes/:id/estado)
    delete datos.estado;
    delete datos.numero_orden;

    if (datos.id_tecnico) {
      const tecnico = await tecnicoModel.buscarPorId(Number(datos.id_tecnico));
      if (!tecnico) {
        ctx.response.status = 404;
        ctx.response.body = { error: "El técnico especificado no existe" };
        return;
      }
      if (tecnico.estado === "Inactivo") {
        ctx.response.status = 400;
        ctx.response.body = { error: "No se puede asignar la orden a un técnico inactivo" };
        return;
      }
    }

    await ordenModel.actualizar(id, { ...orden, ...datos });
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Orden actualizada exitosamente" };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al actualizar orden" };
  }
}

export async function cambiarEstadoOrden(ctx: RouterContext<"/ordenes/:id/estado">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const body = ctx.request.body({ type: "json" });
    const { estado } = await body.value;

    const estadosValidos: EstadoOrden[] = [
      "RECIBIDO", "EN DIAGNOSTICO", "COTIZADO",
      "EN REPARACION", "TERMINADO", "ENTREGADO", "CANCELADO",
    ];

    if (!estado || !estadosValidos.includes(estado)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Estado inválido", estados_validos: estadosValidos };
      return;
    }

    const orden = await ordenModel.buscarPorId(id);
    if (!orden) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Orden no encontrada" };
      return;
    }

    const estadoActual = orden.estado as EstadoOrden;
    const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];

    if (!transicionesPermitidas.includes(estado)) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: `No se puede cambiar de ${estadoActual} a ${estado}`,
        transiciones_permitidas: transicionesPermitidas,
      };
      return;
    }

    await ordenModel.actualizarEstado(id, estado);
    await historialModel.crear({ id_orden: id, estado });

    ctx.response.status = 200;
    ctx.response.body = { mensaje: `Estado actualizado a ${estado}` };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al cambiar estado de la orden" };
  }
}

export async function obtenerHistorialOrden(ctx: RouterContext<"/ordenes/:id/historial">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const orden = await ordenModel.buscarPorId(id);
    if (!orden) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Orden no encontrada" };
      return;
    }

    const historial = await historialModel.buscarPorOrden(id);
    ctx.response.status = 200;
    ctx.response.body = historial;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener historial" };
  }
}

export async function eliminarOrden(ctx: RouterContext<"/ordenes/:id">) {
  const id = Number(ctx.params.id);
  if (isNaN(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "ID inválido" };
    return;
  }

  try {
    const existe = await ordenModel.buscarPorId(id);
    if (!existe) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Orden no encontrada" };
      return;
    }

    await ordenModel.eliminar(id);
    ctx.response.status = 200;
    ctx.response.body = { mensaje: "Orden eliminada exitosamente" };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al eliminar orden" };
  }
}
