import { Router } from "../dependencies/dependencias.ts";
import { verificarAutenticacion, verificarRol } from "../middlewares/authMiddleware.ts";

// Auth
import { login, logout, perfil } from "../controller/AuthController.ts";

// Controladores
import {
  obtenerClientes, obtenerClientePorId,
  crearCliente, actualizarCliente, eliminarCliente,
} from "../controller/ClienteController.ts";
import {
  obtenerEquipos, obtenerEquipoPorId, obtenerEquiposPorCliente,
  crearEquipo, actualizarEquipo, eliminarEquipo,
} from "../controller/EquipoController.ts";
import {
  obtenerTecnicos, obtenerTecnicoPorId,
  crearTecnico, actualizarTecnico, eliminarTecnico,
} from "../controller/TecnicoController.ts";
import {
  obtenerOrdenes, obtenerOrdenPorId, crearOrden,
  actualizarOrden, cambiarEstadoOrden, obtenerHistorialOrden, eliminarOrden,
} from "../controller/OrdenController.ts";
import {
  obtenerUsuarios, obtenerUsuarioPorId,
  crearUsuario, actualizarUsuario, eliminarUsuario,
} from "../controller/UsuarioController.ts";

const router = new Router();

// ── Auth ──────────────────────────────────────────────
router.post("/api/login", login);
router.post("/api/logout", verificarAutenticacion, logout);
router.get("/api/perfil", verificarAutenticacion, perfil);

// ── Clientes ──────────────────────────────────────────
router.get("/api/clientes", verificarAutenticacion, obtenerClientes);
router.get("/api/clientes/:id", verificarAutenticacion, obtenerClientePorId);
router.post("/api/clientes", verificarAutenticacion, crearCliente);
router.put("/api/clientes/:id", verificarAutenticacion, actualizarCliente);
router.delete(
  "/api/clientes/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarCliente,
);

// ── Equipos ───────────────────────────────────────────
router.get("/api/equipos", verificarAutenticacion, obtenerEquipos);
router.get("/api/equipos/:id", verificarAutenticacion, obtenerEquipoPorId);
router.get("/api/clientes/:id/equipos", verificarAutenticacion, obtenerEquiposPorCliente);
router.post("/api/equipos", verificarAutenticacion, crearEquipo);
router.put("/api/equipos/:id", verificarAutenticacion, actualizarEquipo);
router.delete(
  "/api/equipos/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarEquipo,
);

// ── Técnicos ──────────────────────────────────────────
router.get("/api/tecnicos", verificarAutenticacion, obtenerTecnicos);
router.get("/api/tecnicos/:id", verificarAutenticacion, obtenerTecnicoPorId);
router.post(
  "/api/tecnicos",
  verificarAutenticacion,
  verificarRol("Administrador"),
  crearTecnico,
);
router.put(
  "/api/tecnicos/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  actualizarTecnico,
);
router.delete(
  "/api/tecnicos/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarTecnico,
);

// ── Órdenes ───────────────────────────────────────────
router.get("/api/ordenes", verificarAutenticacion, obtenerOrdenes);
router.get("/api/ordenes/:id", verificarAutenticacion, obtenerOrdenPorId);
router.get("/api/ordenes/:id/historial", verificarAutenticacion, obtenerHistorialOrden);
router.post("/api/ordenes", verificarAutenticacion, crearOrden);
router.put("/api/ordenes/:id", verificarAutenticacion, actualizarOrden);
router.patch("/api/ordenes/:id/estado", verificarAutenticacion, cambiarEstadoOrden);
router.delete(
  "/api/ordenes/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarOrden,
);

// ── Usuarios (solo admin) ─────────────────────────────
router.get(
  "/api/usuarios",
  verificarAutenticacion,
  verificarRol("Administrador"),
  obtenerUsuarios,
);
router.get(
  "/api/usuarios/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  obtenerUsuarioPorId,
);
router.post(
  "/api/usuarios",
  verificarAutenticacion,
  verificarRol("Administrador"),
  crearUsuario,
);
router.put(
  "/api/usuarios/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  actualizarUsuario,
);
router.delete(
  "/api/usuarios/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarUsuario,
);

export { router };