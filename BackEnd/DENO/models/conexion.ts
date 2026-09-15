import { Client } from "../dependencies/dependencias.ts";

export const conexion = await new Client().connect({
  hostname: Deno.env.get("DB_HOST") ?? "localhost",
  username: Deno.env.get("DB_USER") ?? "root",
  password: Deno.env.get("DB_PASS") ?? "",
  db: Deno.env.get("DB_NAME") ?? "servicio_tecnico",
  port: Number(Deno.env.get("DB_PORT") ?? "3306"),
});