import { bcrypt } from "../dependencies/dependencias.ts";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function compararPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}