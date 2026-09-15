import { create, verify, getNumericDate, type Payload } from "../dependencies/dependencias.ts";

const encoder = new TextEncoder();

// 8 horas de duración del token
const DURACION_TOKEN_SEGUNDOS = 60 * 60 * 8;

async function obtenerClave(): Promise<CryptoKey> {
  const secret = Deno.env.get("SECRET_KEY");
  if (!secret) {
    throw new Error("SECRET_KEY no está definida en las variables de entorno (.env)");
  }
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface TokenPayload extends Payload {
  id_usuario: number;
  correo: string;
  rol: "Administrador" | "Técnico";
}

export async function generarToken(payload: TokenPayload): Promise<string> {
  const clave = await obtenerClave();
  return await create(
    { alg: "HS256", typ: "JWT" },
    { ...payload, exp: getNumericDate(DURACION_TOKEN_SEGUNDOS) },
    clave
  );
}

export async function verificarToken(token: string): Promise<TokenPayload> {
  const clave = await obtenerClave();
  return (await verify(token, clave)) as TokenPayload;
}