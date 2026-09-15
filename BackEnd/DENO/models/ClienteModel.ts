import { conexion } from "./conexion.ts";

export interface Cliente {
  id?: number;
  nombre_completo: string;
  documento: string;
  telefono?: string;
  correo: string;
}

export class ClienteModel {
  async crear(datos: Omit<Cliente, "id">): Promise<number> {
    const resultado = await conexion.execute(
      "INSERT INTO clientes (nombre_completo, documento, telefono, correo) VALUES (?, ?, ?, ?)",
      [datos.nombre_completo, datos.documento, datos.telefono, datos.correo]
    );
    return resultado.lastInsertId as number;
  }

  async buscarTodos(): Promise<Cliente[]> {
    const resultado = await conexion.query("SELECT * FROM clientes");
    return resultado as Cliente[];
  }

  async buscarPorId(id: number): Promise<Cliente | null> {
    const resultado = await conexion.query("SELECT * FROM clientes WHERE id_cliente = ?", [id]);
    return resultado.length ? (resultado[0] as Cliente) : null;
  }

  async actualizar(id: number, datos: Partial<Cliente>): Promise<boolean> {
    const resultado = await conexion.execute(
      "UPDATE clientes SET nombre_completo=?, documento=?, telefono=?, correo=? WHERE id_cliente=?",
      [datos.nombre_completo, datos.documento, datos.telefono, datos.correo, id]
    );
    return (resultado.affectedRows ?? 0) > 0;
  }

  async eliminar(id: number): Promise<boolean> {
    const resultado = await conexion.execute("DELETE FROM clientes WHERE id_cliente=?", [id]);
    return (resultado.affectedRows ?? 0) > 0;
  }
}