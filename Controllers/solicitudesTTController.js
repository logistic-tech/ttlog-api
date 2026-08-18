import {
  SolicitudesTTModel,
} from "../Models/solicitudesTTModel.js";


const ESTADOS = [
  "nueva",
  "contactada",
  "en_proceso",
  "completada",
  "cancelada",
];

 const validarId = (id) => {

  const idNumerico =
    Number(id);

  return (
    Number.isInteger(idNumerico) &&
    idNumerico > 0
  );
};


// =========================================================
// NORMALIZAR SOLICITUD
// =========================================================

const normalizarSolicitud = (
  body = {},
  actual = {}
) => {
  return {

    nombre:
      body.nombre !== undefined
        ? String(body.nombre).trim()
        : actual.nombre || "",

    apellido:
      body.apellido !== undefined
        ? String(body.apellido).trim()
        : actual.apellido || "",

    telefono:
      body.telefono !== undefined
        ? String(body.telefono).trim()
        : actual.telefono || "",

    email:
      body.email !== undefined
        ? String(body.email)
            .trim()
            .toLowerCase()
        : actual.email || "",

    servicio_deseado:
      body.servicio_deseado !== undefined
        ? String(
            body.servicio_deseado || ""
          ).trim()
        : actual.servicio_deseado || "",

    servicio_id:
      body.servicio_id !== undefined
        ? body.servicio_id
          ? Number(body.servicio_id)
          : null
        : actual.servicio_id || null,

    estado:
      body.estado !== undefined
        ? String(body.estado).trim()
        : actual.estado || "nueva",
  };
};


// =========================================================
// VALIDAR DATOS
// =========================================================

const validarSolicitud = (
  solicitud
) => {

  if (!solicitud.nombre) {
    return "El nombre es obligatorio.";
  }

  if (!solicitud.apellido) {
    return "El apellido es obligatorio.";
  }

  if (!solicitud.telefono) {
    return "El teléfono es obligatorio.";
  }

  if (!solicitud.email) {
    return "El correo electrónico es obligatorio.";
  }


  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailValido.test(
      solicitud.email
    )
  ) {
    return "El correo electrónico no es válido.";
  }


  if (
    solicitud.servicio_id !== null &&
    (
      !Number.isInteger(
        solicitud.servicio_id
      ) ||
      solicitud.servicio_id <= 0
    )
  ) {
    return "El ID del servicio no es válido.";
  }


  if (
    !ESTADOS.includes(
      solicitud.estado
    )
  ) {
    return "El estado de la solicitud no es válido.";
  }


  return null;
};


// =========================================================
// POST /api/solicitudestt
// CREAR
// =========================================================

export const crearSolicitud =
  async (
    req,
    res
  ) => {

    try {

      const solicitud =
        normalizarSolicitud(
          req.body
        );


      const errorValidacion =
        validarSolicitud(
          solicitud
        );


      if (errorValidacion) {

        return res
          .status(400)
          .json({
            ok: false,
            message:
              errorValidacion,
          });
      }


      const {
        data,
        error,
      } =
        await SolicitudesTTModel
          .crearSolicitud(
            solicitud
          );


      if (error) {
        throw error;
      }


      return res
        .status(201)
        .json({
          ok: true,
          message:
            "Solicitud creada correctamente.",
          data,
        });


    } catch (error) {

      console.error(
        "Error en crearSolicitud:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,
          message:
            "No fue posible crear la solicitud.",
        });
    }
  };


// =========================================================
// GET /api/solicitudestt
// VER TODAS
// =========================================================

export const obtenerSolicitudes =
  async (
    req,
    res
  ) => {

    try {

      const {
        data,
        error,
      } =
        await SolicitudesTTModel
          .obtenerSolicitudes();


      if (error) {
        throw error;
      }


      return res
        .status(200)
        .json({
          ok: true,
          data: data || [],
        });


    } catch (error) {

      console.error(
        "Error en obtenerSolicitudes:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,
          message:
            "No fue posible obtener las solicitudes.",
        });
    }
  };


// =========================================================
// GET /api/solicitudestt/:id
// VER UNA
// =========================================================

export const obtenerSolicitudPorId =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


    if (!validarId(id)) {
  return res.status(400).json({
    ok: false,
    message:
      "El ID de la solicitud no es válido.",
  });
}


      const {
        data,
        error,
      } =
        await SolicitudesTTModel
          .obtenerSolicitudPorId(
            id
          );


      if (error) {
        throw error;
      }


      if (!data) {

        return res
          .status(404)
          .json({
            ok: false,
            message:
              "Solicitud no encontrada.",
          });
      }


      return res
        .status(200)
        .json({
          ok: true,
          data,
        });


    } catch (error) {

      console.error(
        "Error en obtenerSolicitudPorId:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,
          message:
            "No fue posible obtener la solicitud.",
        });
    }
  };


// =========================================================
// PUT /api/solicitudestt/:id
// EDITAR / ACTUALIZAR
// =========================================================

export const actualizarSolicitud =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      if (!esUUID(id)) {

        return res
          .status(400)
          .json({
            ok: false,
            message:
              "El ID de la solicitud no es válido.",
          });
      }


      // =====================================================
      // BUSCAR SOLICITUD ACTUAL
      // =====================================================

      const {
        data:
          solicitudActual,
        error:
          errorBuscar,
      } =
        await SolicitudesTTModel
          .obtenerSolicitudPorId(
            id
          );


      if (errorBuscar) {
        throw errorBuscar;
      }


      if (!solicitudActual) {

        return res
          .status(404)
          .json({
            ok: false,
            message:
              "Solicitud no encontrada.",
          });
      }


      // =====================================================
      // ACTUALIZAR
      // =====================================================

      const solicitud =
        normalizarSolicitud(
          req.body,
          solicitudActual
        );


      const errorValidacion =
        validarSolicitud(
          solicitud
        );


      if (errorValidacion) {

        return res
          .status(400)
          .json({
            ok: false,
            message:
              errorValidacion,
          });
      }


      const {
        data,
        error,
      } =
        await SolicitudesTTModel
          .actualizarSolicitud(
            id,
            solicitud
          );


      if (error) {
        throw error;
      }


      return res
        .status(200)
        .json({
          ok: true,
          message:
            "Solicitud actualizada correctamente.",
          data,
        });


    } catch (error) {

      console.error(
        "Error en actualizarSolicitud:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,
          message:
            "No fue posible actualizar la solicitud.",
        });
    }
  };


// =========================================================
// PATCH /api/solicitudestt/:id/estado
// SOLO ACTUALIZAR ESTADO
// =========================================================

export const actualizarEstadoSolicitud =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;

      const {
        estado,
      } = req.body;


      if (!esUUID(id)) {

        return res
          .status(400)
          .json({
            ok: false,
            message:
              "El ID de la solicitud no es válido.",
          });
      }


      if (
        !ESTADOS.includes(
          estado
        )
      ) {

        return res
          .status(400)
          .json({
            ok: false,
            message:
              "El estado no es válido.",
          });
      }


      const {
        data:
          solicitudActual,
        error:
          errorBuscar,
      } =
        await SolicitudesTTModel
          .obtenerSolicitudPorId(
            id
          );


      if (errorBuscar) {
        throw errorBuscar;
      }


      if (!solicitudActual) {

        return res
          .status(404)
          .json({
            ok: false,
            message:
              "Solicitud no encontrada.",
          });
      }


      const {
        data,
        error,
      } =
        await SolicitudesTTModel
          .actualizarSolicitud(
            id,
            {
              estado,
            }
          );


      if (error) {
        throw error;
      }


      return res
        .status(200)
        .json({
          ok: true,
          message:
            "Estado actualizado correctamente.",
          data,
        });


    } catch (error) {

      console.error(
        "Error en actualizarEstadoSolicitud:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,
          message:
            "No fue posible actualizar el estado.",
        });
    }
  };


// =========================================================
// DELETE /api/solicitudestt/:id
// ELIMINAR
// =========================================================

export const eliminarSolicitud =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      if (!esUUID(id)) {

        return res
          .status(400)
          .json({
            ok: false,
            message:
              "El ID de la solicitud no es válido.",
          });
      }


      const {
        data:
          solicitudActual,
        error:
          errorBuscar,
      } =
        await SolicitudesTTModel
          .obtenerSolicitudPorId(
            id
          );


      if (errorBuscar) {
        throw errorBuscar;
      }


      if (!solicitudActual) {

        return res
          .status(404)
          .json({
            ok: false,
            message:
              "Solicitud no encontrada.",
          });
      }


      const {
        error,
      } =
        await SolicitudesTTModel
          .eliminarSolicitud(
            id
          );


      if (error) {
        throw error;
      }


      return res
        .status(200)
        .json({
          ok: true,
          message:
            "Solicitud eliminada correctamente.",
        });


    } catch (error) {

      console.error(
        "Error en eliminarSolicitud:",
        error
      );


      return res
        .status(500)
        .json({
          ok: false,
          message:
            "No fue posible eliminar la solicitud.",
        });
    }
  };