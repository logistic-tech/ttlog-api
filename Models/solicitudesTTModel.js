import supabase from "../config/supabase.js";

const TABLA = "solicitudes_tt";

export const SolicitudesTTModel = {

  // =========================================================
  // CREAR SOLICITUD
  // =========================================================
  async crearSolicitud(solicitudData) {
    const { data, error } = await supabase
      .from(TABLA)
      .insert([solicitudData])
      .select()
      .single();

    return { data, error };
  },


  // =========================================================
  // OBTENER TODAS
  // =========================================================
  async obtenerSolicitudes() {
    const { data, error } = await supabase
      .from(TABLA)
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    return { data, error };
  },


  // =========================================================
  // OBTENER POR ID
  // =========================================================
  async obtenerSolicitudPorId(id) {
    const idNumerico = Number(id);

    const { data, error } = await supabase
      .from(TABLA)
      .select("*")
      .eq("id", idNumerico)
      .maybeSingle();

    return { data, error };
  },


  // =========================================================
  // ACTUALIZAR
  // =========================================================
  async actualizarSolicitud(
    id,
    solicitudData
  ) {
    const idNumerico = Number(id);

    const { data, error } = await supabase
      .from(TABLA)
      .update(solicitudData)
      .eq("id", idNumerico)
      .select()
      .single();

    return { data, error };
  },


  // =========================================================
  // ELIMINAR
  // =========================================================
  async eliminarSolicitud(id) {
    const idNumerico = Number(id);

    const { data, error } = await supabase
      .from(TABLA)
      .delete()
      .eq("id", idNumerico)
      .select()
      .maybeSingle();

    return { data, error };
  },

};