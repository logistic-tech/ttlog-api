import express from "express";
import multer from "multer";

import {
  obtenerServiciosTT,
  obtenerServiciosTTAdmin,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controller/serviciosTTController.js";


const router =
  express.Router();


const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        6 * 1024 * 1024,

      files:
        11,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const permitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !permitidos.includes(
          file.mimetype
        )
      ) {
        return cb(
          new Error(
            "Solo se permiten imágenes JPG, PNG o WEBP."
          )
        );
      }

      cb(
        null,
        true
      );
    },
  });


const subirImagenes =
  upload.fields([
    {
      name:
        "imagen_principal",

      maxCount:
        1,
    },
    {
      name:
        "imagenes",

      maxCount:
        10,
    },
  ]);


// =========================================================
// RUTAS
// =========================================================


// Página pública
router.get(
  "/",
  obtenerServiciosTT
);


// Software interno
// IMPORTANTE:
// /admin debe ir antes que /:id
router.get(
  "/admin",
  obtenerServiciosTTAdmin
);


router.get(
  "/:id",
  obtenerServicioPorId
);


router.post(
  "/",
  subirImagenes,
  crearServicio
);


router.put(
  "/:id",
  subirImagenes,
  actualizarServicio
);


router.delete(
  "/:id",
  eliminarServicio
);


export default router;