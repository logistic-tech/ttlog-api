import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// cargar variables
dotenv.config();

// usar process.env ✅
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// validar (pro tip 🔥)
if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Variables de entorno no cargadas");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;