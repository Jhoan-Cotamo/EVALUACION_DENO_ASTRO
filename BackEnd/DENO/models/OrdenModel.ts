import { conexion } from "./conexion.ts";

export interface Orden {
  id?: number;
  numero_orden: string;
  fecha_recepcion?: Date;
  id_cliente: number;
  id_equipo: number;
  id_tecnico: number;
  descripcion_problema?: string;
  estado?: "RECIBIDO" | "EN DIAGNOSTICO" | "COTIZADO" | "EN REPARACION" | "TERMINADO" | "ENTREGADO" | "CANCELADO";
  observaciones?: string;
  valor_estimado?: number;
  valor_final?: number;
}

export class OrdenModel {
  async crear(datos: Omit<Orden, "id" | "fecha_recepcion">): Promise<number> {
    const resultado = await conexion.execute(
      "INSERT INTO ordenes (numero_orden, id_cliente, id_equipo, id_tecnico, descripcion_problema, estado, observaciones, valor_estimado, valor_final) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        datos.numero_orden,
        datos.id_cliente,
        datos.id_equipo,
        datos.id_tecnico,
        datos.descripcion_problema,
        datos.estado ?? "RECIBIDO",
        datos.observaciones,
        datos.valor_estimado ?? 0,
        datos.valor_final ?? 0
      ]
    );
    return resultado.lastInsertId as number;
  }

  async buscarTodos(): Promise<Orden[]> {
    const resultado = await conexion.query("SELECT * FROM ordenes");
    return resultado as Orden[];
  }

  async buscarPorId(id: number): Promise<Orden | null> {
    const resultado = await conexion.query("SELECT * FROM ordenes WHERE id_orden = ?", [id]);
    return resultado.length ? (resultado[0] as Orden) : null;
  }

  async actualizar(id: number, datos: Partial<Orden>): Promise<boolean> {
    const resultado = await conexion.execute(
      "UPDATE ordenes SET numero_orden=?, id_cliente=?, id_equipo=?, id_tecnico=?, descripcion_problema=?, estado=?,