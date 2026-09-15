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
router.get("/clientes/:id", verificarAutenticacion, obtenerClientePorId);
router.post("/clientes", verificarAutenticacion, crearCliente);
router.put("/clientes/:id", verificarAutenticacion, actualizarCliente);
router.delete(
  "/clientes/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarCliente,
);

// ── Equipos ───────────────────────────────────────────
router.get("/api/equipos", verificarAutenticacion, obtenerEquipos);
router.get("/equipos/:id", verificarAutenticacion, obtenerEquipoPorId);
router.get("/clientes/:id/equipos", verificarAutenticacion, obtenerEquiposPorCliente);
router.post("/api/equipos", verificarAutenticacion, crearEquipo);
router.put("/equipos/:id", verificarAutenticacion, actualizarEquipo);
router.delete(
  "/equipos/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarEquipo,
);

// ── Técnicos ──────────────────────────────────────────
router.get("/api/tecnicos", verificarAutenticacion, obtenerTecnicos);
router.get("/tecnicos/:id", verificarAutenticacion, obtenerTecnicoPorId);
router.post(
  "/api/tecnicos",
  verificarAutenticacion,
  verificarRol("Administrador"),
  crearTecnico,
);
router.put(
  "/tecnicos/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  actualizarTecnico,
);
router.delete(
  "/tecnicos/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarTecnico,
);

// ── Órdenes ───────────────────────────────────────────
router.get("/api/ordenes", verificarAutenticacion, obtenerOrdenes);
router.get("/ordenes/:id", verificarAutenticacion, obtenerOrdenPorId);
router.get("/ordenes/:id/historial", verificarAutenticacion, obtenerHistorialOrden);
router.post("/api/ordenes", verificarAutenticacion, crearOrden);
router.put("/ordenes/:id", verificarAutenticacion, actualizarOrden);
router.patch("/ordenes/:id/estado", verificarAutenticacion, cambiarEstadoOrden);
router.delete(
  "/ordenes/:id",
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
  "/usuarios/:id",
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
  "/usuarios/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  actualizarUsuario,
);
router.delete(
  "/usuarios/:id",
  verificarAutenticacion,
  verificarRol("Administrador"),
  eliminarUsuario,
);

export { router };