import type { User } from "@supabase/supabase-js";
import { supabaseServer } from "./supabase";

// Identifie l'utilisateur d'une requête serveur à partir du jeton de
// session Supabase envoyé par le navigateur (Authorization: Bearer …).
// Le jeton est vérifié par Supabase, jamais décodé localement sans contrôle.
export async function utilisateurDeLaRequete(req: Request): Promise<User | null> {
  const entete = req.headers.get("authorization");
  const jeton = entete?.startsWith("Bearer ") ? entete.slice(7) : null;
  if (!jeton) return null;
  const { data, error } = await supabaseServer.auth.getUser(jeton);
  return error ? null : data.user;
}

export async function estAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseServer.rpc("est_admin", { p_profil: userId });
  return data === true;
}
