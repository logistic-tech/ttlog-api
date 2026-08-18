import express from "express";

import {
  crearSolicitud,
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  actualizarSolicitud,
  actualizarEstadoSolicitud,
  eliminarSolicitud,
} from "../Controllers/solicitudesTTController.js";


const router =
  express.Router();


// =========================================================
// CREAR
// =========================================================

router.post(
  "/",
  crearSolicitud
);


// =========================================================
// VER TODAS
// =========================================================

router.get(
  "/",
  obtenerSolicitudes
);


// =========================================================
// ACTUALIZAR SOLO ESTADO
//
// IMPORTANTE:
// Debe ir antes de /:id
// =========================================================

router.patch(
  "/:id/estado",
  actualizarEstadoSolicitud
);


// =========================================================
// VER UNA
// =========================================================

router.get(
  "/:id",
  obtenerSolicitudPorId
);


// =========================================================
// EDITAR / ACTUALIZAR
// =========================================================

router.put(
  "/:id",
  actualizarSolicitud
);


// =========================================================
// ELIMINAR
// =========================================================

router.delete(
  "/:id",
  eliminarSolicitud
);


export default router;