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
  // OBTENER UNA POR ID
  // =========================================================
  async obtenerSolicitudPorId(id) {
    const { data, error } = await supabase
      .from(TABLA)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    return { data, error };
  },


  // =========================================================
  // ACTUALIZAR SOLICITUD
  // =========================================================
  async actualizarSolicitud(
    id,
    solicitudData
  ) {
    const { data, error } = await supabase
      .from(TABLA)
      .update(solicitudData)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },


  // =========================================================
  // ELIMINAR SOLICITUD
  // =========================================================
  async eliminarSolicitud(id) {
    const { data, error } = await supabase
      .from(TABLA)
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    return { data, error };
  },

};