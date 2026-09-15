import { conexion } from "./conexion.ts";

export interface HistorialEstado {
  id?: number;
  id_orden: number;
  estado: "RECIBIDO" | "EN DIAGNOSTICO" | "COTIZADO" | "EN REPARACION" | "TERMINADO" | "ENTREGADO" | "CANCELADO";
  fecha_cambio?: Date;
}

export class HistorialEstadoModel {
  async crear(datos: Omit<HistorialEstado, "id" | "fecha_cambio">): Promise<number> {
    const resultado = await conexion.execute(
      "INSERT INTO historial_estados (id_orden, estado) VALUES (?, ?)",
      [datos.id_orden, datos.estado]
    );
    return resultado.lastInsertId as number;
  }

  async buscarTodos(): Promise<HistorialEstado[]> {
    const resultado = await conexion.query("SELECT * FROM historial_estados");
    return resultado as HistorialEstado[];
  }

  async buscarPorOrden(id_orden: number): Promise<HistorialEstado[]> {
    const resultado = await conexion.query("SELECT * FROM historial_estados WHERE id_orden = ?", [id_orden]);
    return resultado as HistorialEstado[];
  }

  async buscarPorId(id: number): Promise<HistorialEstado | null> {
    const resultado = await conexion.query("SELECT * FROM historial_estados WHERE id_historial = ?", [id]);
    return resultado.length ? (resultado[0] as HistorialEstado) : null;
  }

  async actualizar(id: number, datos: Partial<HistorialEstado>): Promise<boolean> {
    const resultado = await conexion.execute(
      "UPDATE historial_estados SET id_orden=?, estado=?, fecha_cambio=? WHERE id_historial=?",
      [datos.id_orden, datos.estado, datos.fecha_cambio, id]
    );
    return (resultado.affectedRows ?? 0) > 0;
  }

  async eliminar(id: number): Promise<boolean> {
    const resultado = await conexion.execute("DELETE FROM historial_estados WHERE id_historial=?", [id]);
    return (resultado.affectedRows ?? 0) > 0;
  }
}