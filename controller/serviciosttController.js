import {
  ServiciosTTModel,
} from "../Models/serviciosTTModel.js";


const TIPOS_SERVICIO = [
  "paquete_nacional",
  "paquete_internacional",
  "crucero",
  "excursionesTT",
];

const ESTADOS = [
  "activo",
  "inactivo",
];


// =========================================================
// CONVERTIR ARRAYS QUE VIENEN EN FORMDATA
// =========================================================

const parseArray = (
  value,
  defaultValue = []
) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed =
      JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : defaultValue;
  } catch {
    return defaultValue;
  }
};


// =========================================================
// NORMALIZAR INFORMACIÓN
// =========================================================

const normalizarServicio = (
  body = {},
  actual = {}
) => {
  return {
    titulo:
      body.titulo !== undefined
        ? String(body.titulo).trim()
        : actual.titulo || "",

    tipo_servicio:
      body.tipo_servicio !== undefined
        ? String(
            body.tipo_servicio
          ).trim()
        : actual.tipo_servicio || "",

    destino:
      body.destino !== undefined
        ? String(body.destino).trim()
        : actual.destino || "",

    fecha_salida:
      body.fecha_salida !== undefined
        ? body.fecha_salida || null
        : actual.fecha_salida || null,

    fecha_regreso:
      body.fecha_regreso !== undefined
        ? body.fecha_regreso || null
        : actual.fecha_regreso || null,

    duracion:
      body.duracion !== undefined
        ? String(body.duracion).trim()
        : actual.duracion || "",

    descripcion:
      body.descripcion !== undefined
        ? String(
            body.descripcion
          ).trim()
        : actual.descripcion || "",

    observaciones:
      body.observaciones !== undefined
        ? String(
            body.observaciones
          ).trim()
        : actual.observaciones || "",

    incluye:
      parseArray(
        body.incluye,
        actual.incluye || []
      ),

    no_incluye:
      parseArray(
        body.no_incluye,
        actual.no_incluye || []
      ),

    estado:
      body.estado !== undefined
        ? String(body.estado).trim()
        : actual.estado || "activo",
  };
};


// =========================================================
// VALIDACIÓN
// =========================================================

const validarServicio = (
  servicio
) => {
  if (!servicio.titulo) {
    return "El título es obligatorio.";
  }

  if (!servicio.destino) {
    return "El destino es obligatorio.";
  }

  if (
    !TIPOS_SERVICIO.includes(
      servicio.tipo_servicio
    )
  ) {
    return "El tipo de servicio no es válido.";
  }

  if (
    !ESTADOS.includes(
      servicio.estado
    )
  ) {
    return "El estado no es válido.";
  }

  return null;
};


// =========================================================
// GET /api/serviciostt
//
// PÚBLICO
// Página web
// =========================================================

export const obtenerServiciosTT = async (
  req,
  res
) => {
  try {
    const {
      data,
      error,
    } =
      await ServiciosTTModel
        .obtenerServiciosActivos();

    if (error) {
      throw error;
    }

    const servicios =
      data || [];

   return res.status(200).json({
  paquetes_nacionales:
    servicios.filter(
      (item) =>
        item.tipo_servicio ===
        "paquete_nacional"
    ),

  paquetes_internacionales:
    servicios.filter(
      (item) =>
        item.tipo_servicio ===
        "paquete_internacional"
    ),

  cruceros:
    servicios.filter(
      (item) =>
        item.tipo_servicio ===
        "crucero"
    ),

  excursionesTT:
    servicios.filter(
      (item) =>
        item.tipo_servicio ===
        "excursionesTT"
    ),
});

  } catch (error) {
    console.error(
      "Error en obtenerServiciosTT:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "No fue posible obtener los servicios turísticos.",
    });
  }
};


// =========================================================
// GET /api/serviciostt/admin
//
// SOFTWARE INTERNO
// Activos + Inactivos
// =========================================================

export const obtenerServiciosTTAdmin =
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } =
        await ServiciosTTModel
          .obtenerServicios();

      if (error) {
        throw error;
      }

      return res.status(200).json({
        ok: true,
        data,
      });

    } catch (error) {
      console.error(
        "Error en obtenerServiciosTTAdmin:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No fue posible obtener los servicios turísticos.",
      });
    }
  };


// =========================================================
// GET /api/serviciostt/:id
// =========================================================

export const obtenerServicioPorId =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const {
        data,
        error,
      } =
        await ServiciosTTModel
          .obtenerServicioPorId(
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
              "Servicio no encontrado.",
          });
      }

      return res.status(200).json({
        ok: true,
        data,
      });

    } catch (error) {
      console.error(
        "Error en obtenerServicioPorId:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "No fue posible obtener el servicio.",
      });
    }
  };


// =========================================================
// POST /api/serviciostt
// =========================================================

export const crearServicio =
  async (
    req,
    res
  ) => {
    let servicioCreado = null;

    const imagenesSubidas = [];

    try {
      const servicio =
        normalizarServicio(
          req.body
        );

      const errorValidacion =
        validarServicio(
          servicio
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


      // =====================================================
      // 1. CREAR PRIMERO EL REGISTRO
      //
      // Así Supabase genera el ID.
      // =====================================================

      const {
        data,
        error,
      } =
        await ServiciosTTModel
          .crearServicio({
            ...servicio,

            imagen_principal:
              null,

            imagen_principal_path:
              null,

            imagenes: [],

            imagenes_paths: [],
          });

      if (error) {
        throw error;
      }

      servicioCreado =
        data;


      // =====================================================
      // 2. IMAGEN PRINCIPAL
      // =====================================================

      let imagenPrincipal =
        null;

      let imagenPrincipalPath =
        null;

      const archivoPrincipal =
        req.files
          ?.imagen_principal
          ?.[0];

      if (archivoPrincipal) {
        const {
          data: imagen,
          error:
            errorImagen,
        } =
          await ServiciosTTModel
            .subirImagen(
              servicioCreado.id,
              archivoPrincipal,
              "principal",
              0
            );

        if (errorImagen) {
          throw errorImagen;
        }

        imagenPrincipal =
          imagen.url;

        imagenPrincipalPath =
          imagen.path;

        imagenesSubidas.push(
          imagen.path
        );
      }


      // =====================================================
      // 3. GALERÍA
      // =====================================================

      const archivosGaleria =
        req.files
          ?.imagenes ||
        [];

      const imagenesGaleria =
        [];

      const pathsGaleria =
        [];

      for (
        let i = 0;
        i <
        archivosGaleria.length;
        i++
      ) {
        const archivo =
          archivosGaleria[i];

        const {
          data: imagen,
          error:
            errorImagen,
        } =
          await ServiciosTTModel
            .subirImagen(
              servicioCreado.id,
              archivo,
              "galeria",
              i + 1
            );

        if (errorImagen) {
          throw errorImagen;
        }

        imagenesGaleria.push(
          imagen.url
        );

        pathsGaleria.push(
          imagen.path
        );

        imagenesSubidas.push(
          imagen.path
        );
      }


      // =====================================================
      // 4. ARRAY COMPLETO DE IMÁGENES
      // =====================================================

      const imagenesFinales = [];

      const pathsFinales = [];

      if (
        imagenPrincipal
      ) {
        imagenesFinales.push(
          imagenPrincipal
        );

        pathsFinales.push(
          imagenPrincipalPath
        );
      }

      imagenesFinales.push(
        ...imagenesGaleria
      );

      pathsFinales.push(
        ...pathsGaleria
      );


      // =====================================================
      // 5. ACTUALIZAR REGISTRO CON LAS URL
      // =====================================================

      const {
        data:
          servicioFinal,
        error:
          errorActualizar,
      } =
        await ServiciosTTModel
          .actualizarServicio(
            servicioCreado.id,
            {
              imagen_principal:
                imagenPrincipal,

              imagen_principal_path:
                imagenPrincipalPath,

              imagenes:
                imagenesFinales,

              imagenes_paths:
                pathsFinales,
            }
          );

      if (
        errorActualizar
      ) {
        throw errorActualizar;
      }


      return res
        .status(201)
        .json({
          ok: true,

          message:
            "Servicio creado correctamente.",

          data:
            servicioFinal,
        });

    } catch (error) {
      console.error(
        "Error en crearServicio:",
        error
      );


      // =====================================================
      // LIMPIEZA SI FALLÓ LA OPERACIÓN
      // =====================================================

      if (
        imagenesSubidas.length >
        0
      ) {
        await ServiciosTTModel
          .eliminarImagenes(
            imagenesSubidas
          );
      }

      if (
        servicioCreado?.id
      ) {
        await ServiciosTTModel
          .eliminarServicio(
            servicioCreado.id
          );
      }


      return res
        .status(500)
        .json({
          ok: false,

          message:
            "No fue posible crear el servicio turístico.",
        });
    }
  };


// =========================================================
// PUT /api/serviciostt/:id
// =========================================================

export const actualizarServicio =
  async (
    req,
    res
  ) => {
    const nuevasImagenesSubidas =
      [];

    try {
      const {
        id,
      } = req.params;


      // =====================================================
      // BUSCAR ACTUAL
      // =====================================================

      const {
        data:
          servicioActual,
        error:
          errorBuscar,
      } =
        await ServiciosTTModel
          .obtenerServicioPorId(
            id
          );

      if (errorBuscar) {
        throw errorBuscar;
      }

      if (!servicioActual) {
        return res
          .status(404)
          .json({
            ok: false,
            message:
              "Servicio no encontrado.",
          });
      }


      // =====================================================
      // INFORMACIÓN
      // =====================================================

      const servicio =
        normalizarServicio(
          req.body,
          servicioActual
        );

      const errorValidacion =
        validarServicio(
          servicio
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


      // =====================================================
      // IMÁGENES A ELIMINAR
      //
      // Deben venir como:
      //
      // imagenes_eliminar:
      // JSON.stringify([
      //   "id/galeria/foto.jpg"
      // ])
      // =====================================================

      const imagenesEliminar =
        new Set(
          parseArray(
            req.body
              .imagenes_eliminar,
            []
          )
        );


      // =====================================================
      // IMÁGENES ACTUALES
      // =====================================================

      const urlsActuales =
        Array.isArray(
          servicioActual.imagenes
        )
          ? servicioActual.imagenes
          : [];

      const pathsActuales =
        Array.isArray(
          servicioActual.imagenes_paths
        )
          ? servicioActual.imagenes_paths
          : [];


      let imagenPrincipal =
        servicioActual.imagen_principal;

      let imagenPrincipalPath =
        servicioActual.imagen_principal_path;


      // =====================================================
      // NUEVA IMAGEN PRINCIPAL
      // =====================================================

      const nuevaPrincipal =
        req.files
          ?.imagen_principal
          ?.[0];

      if (nuevaPrincipal) {
        const {
          data:
            imagen,
          error:
            errorImagen,
        } =
          await ServiciosTTModel
            .subirImagen(
              id,
              nuevaPrincipal,
              "principal",
              0
            );

        if (errorImagen) {
          throw errorImagen;
        }

        nuevasImagenesSubidas.push(
          imagen.path
        );

        if (
          imagenPrincipalPath
        ) {
          imagenesEliminar.add(
            imagenPrincipalPath
          );
        }

        imagenPrincipal =
          imagen.url;

        imagenPrincipalPath =
          imagen.path;
      }


      // =====================================================
      // SI MANUALMENTE ELIMINARON LA PRINCIPAL
      // =====================================================

      if (
        !nuevaPrincipal &&
        imagenPrincipalPath &&
        imagenesEliminar.has(
          imagenPrincipalPath
        )
      ) {
        imagenPrincipal =
          null;

        imagenPrincipalPath =
          null;
      }


      // =====================================================
      // MANTENER IMÁGENES EXISTENTES
      // =====================================================

      const imagenesConservadas =
        [];

      for (
        let i = 0;
        i <
        pathsActuales.length;
        i++
      ) {
        const path =
          pathsActuales[i];

        const url =
          urlsActuales[i];

        if (
          imagenesEliminar.has(
            path
          )
        ) {
          continue;
        }

        // La principal se maneja aparte
        if (
          path ===
          servicioActual
            .imagen_principal_path
        ) {
          continue;
        }

        imagenesConservadas.push({
          url,
          path,
        });
      }


      // =====================================================
      // NUEVAS IMÁGENES DE GALERÍA
      // =====================================================

      const nuevosArchivos =
        req.files
          ?.imagenes ||
        [];

      const nuevasGaleria =
        [];

      for (
        let i = 0;
        i <
        nuevosArchivos.length;
        i++
      ) {
        const {
          data:
            imagen,
          error:
            errorImagen,
        } =
          await ServiciosTTModel
            .subirImagen(
              id,
              nuevosArchivos[i],
              "galeria",
              i + 1
            );

        if (errorImagen) {
          throw errorImagen;
        }

        nuevasImagenesSubidas.push(
          imagen.path
        );

        nuevasGaleria.push(
          imagen
        );
      }


      // =====================================================
      // CONSTRUIR ARRAY FINAL
      // =====================================================

      const imagenesFinales =
        [];

      if (
        imagenPrincipal &&
        imagenPrincipalPath
      ) {
        imagenesFinales.push({
          url:
            imagenPrincipal,

          path:
            imagenPrincipalPath,
        });
      }

      imagenesFinales.push(
        ...imagenesConservadas
      );

      imagenesFinales.push(
        ...nuevasGaleria
      );


      // =====================================================
      // SI NO HAY PRINCIPAL,
      // USAR PRIMERA FOTO
      // =====================================================

      if (
        !imagenPrincipal &&
        imagenesFinales.length >
          0
      ) {
        imagenPrincipal =
          imagenesFinales[0]
            .url;

        imagenPrincipalPath =
          imagenesFinales[0]
            .path;
      }


      const urlsFinales =
        imagenesFinales.map(
          (item) =>
            item.url
        );

      const pathsFinales =
        imagenesFinales.map(
          (item) =>
            item.path
        );


      // =====================================================
      // ACTUALIZAR
      // =====================================================

      const {
        data,
        error,
      } =
        await ServiciosTTModel
          .actualizarServicio(
            id,
            {
              ...servicio,

              imagen_principal:
                imagenPrincipal,

              imagen_principal_path:
                imagenPrincipalPath,

              imagenes:
                urlsFinales,

              imagenes_paths:
                pathsFinales,
            }
          );

      if (error) {
        throw error;
      }


      // =====================================================
      // AHORA SÍ BORRAMOS LAS VIEJAS
      // =====================================================

      if (
        imagenesEliminar.size >
        0
      ) {
        const {
          error:
            errorEliminar,
        } =
          await ServiciosTTModel
            .eliminarImagenes(
              Array.from(
                imagenesEliminar
              )
            );

        if (
          errorEliminar
        ) {
          console.error(
            "No se pudieron eliminar algunas imágenes:",
            errorEliminar
          );
        }
      }


      return res
        .status(200)
        .json({
          ok: true,

          message:
            "Servicio actualizado correctamente.",

          data,
        });

    } catch (error) {
      console.error(
        "Error en actualizarServicio:",
        error
      );


      // Si el UPDATE falla,
      // eliminamos solamente
      // las nuevas imágenes.

      if (
        nuevasImagenesSubidas.length >
        0
      ) {
        await ServiciosTTModel
          .eliminarImagenes(
            nuevasImagenesSubidas
          );
      }


      return res
        .status(500)
        .json({
          ok: false,

          message:
            "No fue posible actualizar el servicio turístico.",
        });
    }
  };


// =========================================================
// DELETE /api/serviciostt/:id
// =========================================================

export const eliminarServicio =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const {
        data:
          servicio,
        error:
          errorBuscar,
      } =
        await ServiciosTTModel
          .obtenerServicioPorId(
            id
          );

      if (errorBuscar) {
        throw errorBuscar;
      }

      if (!servicio) {
        return res
          .status(404)
          .json({
            ok: false,

            message:
              "Servicio no encontrado.",
          });
      }


      // =====================================================
      // ELIMINAR REGISTRO
      // =====================================================

      const {
        error,
      } =
        await ServiciosTTModel
          .eliminarServicio(
            id
          );

      if (error) {
        throw error;
      }


      // =====================================================
      // ELIMINAR IMÁGENES DEL STORAGE
      // =====================================================

      const paths =
        Array.isArray(
          servicio.imagenes_paths
        )
          ? servicio.imagenes_paths
          : [];

      if (
        paths.length > 0
      ) {
        const {
          error:
            storageError,
        } =
          await ServiciosTTModel
            .eliminarImagenes(
              paths
            );

        if (
          storageError
        ) {
          console.error(
            "Error eliminando imágenes:",
            storageError
          );
        }
      }


      return res
        .status(200)
        .json({
          ok: true,

          message:
            "Servicio eliminado correctamente.",
        });

    } catch (error) { 
      console.error(
        "Error en eliminarServicio:",
        error
      );

      return res
        .status(500)
        .json({
          ok: false,

          message:
            "No fue posible eliminar el servicio turístico.",
        });
    }
  };