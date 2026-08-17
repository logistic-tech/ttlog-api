import "dotenv/config";

import express from "express";
import cors from "cors";

import serviciosTTRoutes from "./routes/serviciosTTRoutes.js";

const app = express();

const port =
  process.env.PORT || 3000;


// =========================================================
// MIDDLEWARES
// =========================================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// =========================================================
// SERVICIOS TT
// =========================================================

app.use(
  "/api/serviciostt",
  serviciosTTRoutes
);


// =========================================================
// TEST
// =========================================================

app.get(
  "/api/test",
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: "Backend funcionando",
    });
  }
);


// =========================================================
// RUTA PRINCIPAL
// =========================================================

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: "API funcionando",
    });
  }
);


// =========================================================
// SERVIDOR
// =========================================================

app.listen(
  port,
  "0.0.0.0",
  () => {
    console.log(
      `Servidor corriendo en puerto ${port}`
    );

    console.log(
      `Test: http://localhost:${port}/api/test`
    );

    console.log(
      `Servicios TT: http://localhost:${port}/api/serviciostt`
    );
  }
);