import { createClient } from "@supabase/supabase-js";

// Client Supabase côté navigateur (clé anon, jamais la service role key).
// Utilisé uniquement pour l'auth et la table "conversations", toutes deux
// protégées par RLS — voir supabase/schema_users.sql.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies (voir .env.local.example)."
  );
}

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
