import { conexion } from "./conexion.ts";

export interface Equipo {
  id?: number;
  id_cliente: number;
  tipo_equipo: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  descripcion_problema?: string;
}

export class EquipoModel {
  async crear(datos: Omit<Equipo, "id">): Promise<number> {
    const resultado = await conexion.execute(
      "INSERT INTO equipos (id_cliente, tipo_equipo, marca, modelo, numero_serie, descripcion_problema) VALUES (?, ?, ?, ?, ?, ?)",
      [datos.id_cliente, datos.tipo_equipo, datos.marca, datos.modelo, datos.numero_serie, datos.descripcion_problema]
    );
    return resultado.lastInsertId as number;
  }

  async buscarTodos(): Promise<Equipo[]> {
    const resultado = await conexion.query("SELECT * FROM equipos");
    return resultado as Equipo[];
  }

  async buscarPorId(id: number): Promise<Equipo | null> {
    const resultado = await conexion.query("SELECT * FROM equipos WHERE id_equipo = ?", [id]);
    return resultado.length ? (resultado[0] as Equipo) : null;
  }

  async buscarPorCliente(id_cliente: number): Promise<Equipo[]> {
    const resultado = await conexion.query("SELECT * FROM equipos WHERE id_cliente = ?", [id_cliente]);
    return resultado as Equipo[];
  }

  async actualizar(id: number, datos: Partial<Equipo>): Promise<boolean> {
    const resultado = await conexion.execute(
      "UPDATE equipos SET id_cliente=?, tipo_equipo=?, marca=?, modelo=?, numero_serie=?, descripcion_problema=? WHERE id_equipo=?",
      [datos.id_cliente, datos.tipo_equipo, datos.marca, datos.modelo, datos.numero_serie, datos.descripcion_problema, id]
    );
    return (resultado.affectedRows ?? 0) > 0;
  }

  async eliminar(id: number): Promise<boolean> {
    const resultado = await conexion.execute("DELETE FROM equipos WHERE id_equipo=?", [id]);
    return (resultado.affectedRows ?? 0) > 0;
  }
}