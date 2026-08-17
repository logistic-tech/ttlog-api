import supabase from "../config/supabase.js";

const TABLA = "servicios_tt";
const BUCKET = "servicios-tt";

const limpiarNombreArchivo = (nombre = "imagen") => {
  return String(nombre)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
};
 
export const ServiciosTTModel = {

  // =========================================================
  // OBTENER SERVICIOS ACTIVOS
  // Para la página web
  // =========================================================
  async obtenerServiciosActivos() {
    const { data, error } = await supabase
      .from(TABLA)
      .select(`
        id,
        titulo,
        tipo_servicio,
        destino,
        fecha_salida,
        fecha_regreso,
        duracion,
        descripcion,
        observaciones,
        incluye,
        no_incluye,
        imagen_principal,
        imagenes,
        estado
      `)
      .eq("estado", "activo")
      .order("fecha_salida", {
        ascending: true,
        nullsFirst: false,
      });

    return { data, error };
  },

  // =========================================================
  // OBTENER TODOS
  // Para el software interno
  // =========================================================
  async obtenerServicios() {
    const { data, error } = await supabase
      .from(TABLA)
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    return { data, error };
  },

  // =========================================================
  // OBTENER UNO POR ID
  // =========================================================
  async obtenerServicioPorId(id) {
    const { data, error } = await supabase
      .from(TABLA)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    return { data, error };
  },

  // =========================================================
  // CREAR SERVICIO
  // Supabase genera automáticamente el ID
  // =========================================================
  async crearServicio(servicioData) {
    const { data, error } = await supabase
      .from(TABLA)
      .insert([servicioData])
      .select()
      .single();

    return { data, error };
  },

  // =========================================================
  // ACTUALIZAR SERVICIO
  // =========================================================
  async actualizarServicio(id, servicioData) {
    const { data, error } = await supabase
      .from(TABLA)
      .update(servicioData)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // =========================================================
  // ELIMINAR SERVICIO
  // =========================================================
  async eliminarServicio(id) {
    const { data, error } = await supabase
      .from(TABLA)
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    return { data, error };
  },

  // =========================================================
  // SUBIR UNA IMAGEN
  // =========================================================
  async subirImagen(
    servicioId,
    file,
    carpeta = "galeria",
    orden = 0
  ) {
    const nombreOriginal =
      limpiarNombreArchivo(file.originalname);

    const nombreArchivo =
      `${Date.now()}-${orden}-${nombreOriginal}`;

    const path =
      `${servicioId}/${carpeta}/${nombreArchivo}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(
        path,
        file.buffer,
        {
          contentType: file.mimetype,
          cacheControl: "31536000",
          upsert: false,
        }
      );

    if (error) {
      return {
        data: null,
        error,
      };
    }

    const { data: publicData } =
      supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

    return {
      data: {
        url: publicData.publicUrl,
        path,
      },
      error: null,
    };
  },

  // =========================================================
  // ELIMINAR IMÁGENES
  // =========================================================
  async eliminarImagenes(paths = []) {
    const pathsValidos =
      paths.filter(Boolean);

    if (pathsValidos.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    const { data, error } =
      await supabase.storage
        .from(BUCKET)
        .remove(pathsValidos);

    return { data, error };
  },
};