import { supabaseBrowser } from "./supabase-browser";

export interface FavoritePlant {
  planteNom: string;
  addedAt: number;
}

const STORAGE_KEY = "lafi-favorites";

// ---------------------------------------------------------------
// Mode invité : favoris dans le localStorage du navigateur.
// ---------------------------------------------------------------

function loadLocal(): FavoritePlant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoritePlant[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort((a, b) => b.addedAt - a.addedAt);
  } catch {
    return [];
  }
}

function addLocal(planteNom: string) {
  if (typeof window === "undefined") return;
  const all = loadLocal();
  if (all.some((f) => f.planteNom === planteNom)) return;
  all.unshift({ planteNom, addedAt: Date.now() });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function removeLocal(planteNom: string) {
  if (typeof window === "undefined") return;
  const remaining = loadLocal().filter((f) => f.planteNom !== planteNom);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

// ---------------------------------------------------------------
// Compte connecté : favoris dans Supabase (table "favoris", protégée
// par RLS — voir supabase/schema_v3.sql). Identifié par plante_nom,
// pas par plante_id : "plantes" n'est pas accessible depuis le
// navigateur (service role uniquement).
// ---------------------------------------------------------------

interface FavoriRow {
  plante_nom: string;
  created_at: string;
}

async function loadRemote(): Promise<FavoritePlant[]> {
  const { data, error } = await supabaseBrowser
    .from("favoris")
    .select("plante_nom, created_at")
    .order("created_at", { ascending: false })
    .returns<FavoriRow[]>();

  if (error || !data) return [];
  return data.map((row) => ({ planteNom: row.plante_nom, addedAt: new Date(row.created_at).getTime() }));
}

async function addRemote(userId: string, planteNom: string) {
  await supabaseBrowser
    .from("favoris")
    .upsert({ user_id: userId, plante_nom: planteNom }, { onConflict: "user_id,plante_nom", ignoreDuplicates: true });
}

async function removeRemote(planteNom: string) {
  await supabaseBrowser.from("favoris").delete().eq("plante_nom", planteNom);
}

// ---------------------------------------------------------------
// API unifiée : userId=null -> localStorage, sinon -> Supabase.
// ---------------------------------------------------------------

export async function loadFavorites(userId: string | null): Promise<FavoritePlant[]> {
  return userId ? loadRemote() : loadLocal();
}

export async function addFavorite(userId: string | null, planteNom: string): Promise<void> {
  if (userId) await addRemote(userId, planteNom);
  else addLocal(planteNom);
}

export async function removeFavorite(userId: string | null, planteNom: string): Promise<void> {
  if (userId) await removeRemote(planteNom);
  else removeLocal(planteNom);
}

// Appelée une fois à la connexion : envoie les favoris locaux (invité)
// vers le compte qui vient de se connecter, puis vide le localStorage.
export async function migrateLocalFavoritesToRemote(userId: string): Promise<void> {
  const local = loadLocal();
  for (const fav of local) {
    await addRemote(userId, fav.planteNom);
  }
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}
