import { conexion } from "./conexion.ts";

export interface Evidencia {
  id?: number;
  id_orden: number;
  ruta_imagen: string;
}

export class EvidenciaModel {
  async crear(datos: Omit<Evidencia, "id">): Promise<number> {
    const resultado = await conexion.execute(
      "INSERT INTO evidencias (id_orden, ruta_imagen) VALUES (?, ?)",
      [datos.id_orden, datos.ruta_imagen]
    );
    return resultado.lastInsertId as number;
  }

  async buscarTodos(): Promise<Evidencia[]> {
    const resultado = await conexion.query("SELECT * FROM evidencias");
    return resultado as Evidencia[];
  }

  async buscarPorOrden(id_orden: number): Promise<Evidencia[]> {
    const resultado = await conexion.query("SELECT * FROM evidencias WHERE id_orden = ?", [id_orden]);
    return resultado as Evidencia[];
  }

  async buscarPorId(id: number): Promise<Evidencia | null> {
    const resultado = await conexion.query("SELECT * FROM evidencias WHERE id_evidencia = ?", [id]);
    return resultado.length ? (resultado[0] as Evidencia) : null;
  }

  async actualizar(id: number, datos: Partial<Evidencia>): Promise<boolean> {
    const resultado = await conexion.execute(
      "UPDATE evidencias SET id_orden=?, ruta_imagen=? WHERE id_evidencia=?",
      [datos.id_orden, datos.ruta_imagen, id]
    );
    return resultado.affectedRows > 0;
  }

  async eliminar(id: number): Promise<boolean> {
    const resultado = await conexion.execute("DELETE FROM evidencias WHERE id_evidencia=?", [id]);
    return resultado.affectedRows > 0;
  }
}