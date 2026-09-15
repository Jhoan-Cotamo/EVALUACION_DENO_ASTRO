import { conexion } from "./conexion.ts";

export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  contraseña: string;
  rol: "Administrador" | "Técnico";
  estado?: "Activo" | "Inactivo";
}

export class UsuarioModel {
  async crear(datos: Omit<Usuario, "id">): Promise<number> {
    const resultado = await conexion.execute(
      "INSERT INTO usuarios (nombre, correo, contraseña, rol, estado) VALUES (?, ?, ?, ?, ?)",
      [datos.nombre, datos.correo, datos.contraseña, datos.rol, datos.estado ?? "Activo"]
    );
    return resultado.lastInsertId as number;
  }

  async buscarTodos(): Promise<Usuario[]> {
    const resultado = await conexion.query("SELECT * FROM usuarios");
    return resultado as Usuario[];
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const resultado = await conexion.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id]);
    return resultado.length ? (resultado[0] as Usuario) : null;
  }

  async actualizar(id: number, datos: Partial<Usuario>): Promise<boolean> {
    const resultado = await conexion.execute(
      "UPDATE usuarios SET nombre=?, correo=?, contraseña=?, rol=?, estado=? WHERE id_usuario=?",
      [datos.nombre, datos.correo, datos.contraseña, datos.rol, datos.estado, id]
    );
    return resultado.affectedRows > 0;
  }

  async eliminar(id: number): Promise<boolean> {
    const resultado = await conexion.execute("DELETE FROM usuarios WHERE id_usuario=?", [id]);
    return resultado.affectedRows > 0;
  }
}