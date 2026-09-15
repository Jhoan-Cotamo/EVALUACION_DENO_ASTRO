import { conexion } from "./conexion.ts";

export interface Tecnico {
  id?: number;
  nombre: string;
  documento: string;
  especialidad?: string;
  telefono?: string;
  estado?: "Activo" | "Inactivo";
}

export class TecnicoModel {
  async crear(datos: Omit<Tecnico, "id">): Promise<number> {
    const resultado = await conexion.execute(
      "INSERT INTO tecnicos (nombre, documento, especialidad, telefono, estado) VALUES (?, ?, ?, ?, ?)",
      [datos.nombre, datos.documento, datos.especialidad, datos.telefono, datos.estado ?? "Activo"]
    );
    return resultado.lastInsertId as number;
  }

  async buscarTodos(): Promise<Tecnico[]> {
    const resultado = await conexion.query("SELECT * FROM tecnicos");
    return resultado as Tecnico[];
  }

  async buscarPorId(id: number): Promise<Tecnico | null> {
    const resultado = await conexion.query("SELECT * FROM tecnicos WHERE id_tecnico = ?", [id]);
    return resultado.length ? (resultado[0] as Tecnico) : null;
  }

  async actualizar(id: number, datos: Partial<Tecnico>): Promise<boolean> {
    const resultado = await conexion.execute(
      "UPDATE tecnicos SET nombre=?, documento=?, especialidad=?, telefono=?, estado=? WHERE id_tecnico=?",
      [datos.nombre, datos.documento, datos.especialidad, datos.telefono, datos.estado, id]
    );
    return resultado.affectedRows > 0;
  }

  async eliminar(id: number): Promise<boolean> {
    const resultado = await conexion.execute("DELETE FROM tecnicos WHERE id_tecnico=?", [id]);
    return resultado.affectedRows > 0;
  }
}