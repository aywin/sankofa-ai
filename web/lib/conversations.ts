import type { UIMessage } from "ai";
import { supabaseBrowser } from "./supabase-browser";

export interface StoredConversation {
  id: string;
  title: string;
  messages: UIMessage[];
  updatedAt: number;
}

const STORAGE_KEY = "lafi-conversations";

// ---------------------------------------------------------------
// Mode invité : historique dans le localStorage du navigateur.
// ---------------------------------------------------------------

function loadLocal(): StoredConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredConversation[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function saveLocal(id: string, messages: UIMessage[]) {
  if (typeof window === "undefined" || messages.length === 0) return;
  const all = loadLocal();
  const idx = all.findIndex((c) => c.id === id);
  const entry: StoredConversation = { id, title: deriveTitle(messages), messages, updatedAt: Date.now() };
  if (idx >= 0) all[idx] = entry;
  else all.unshift(entry);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function deleteLocal(id: string) {
  if (typeof window === "undefined") return;
  const remaining = loadLocal().filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

// ---------------------------------------------------------------
// Compte connecté : historique dans Supabase (table "conversations",
// protégée par RLS — voir supabase/schema_users.sql).
// ---------------------------------------------------------------

interface ConversationRow {
  id: string;
  title: string;
  messages: UIMessage[];
  updated_at: string;
}

async function loadRemote(): Promise<StoredConversation[]> {
  const { data, error } = await supabaseBrowser
    .from("conversations")
    .select("id, title, messages, updated_at")
    .order("updated_at", { ascending: false })
    .returns<ConversationRow[]>();

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    messages: row.messages,
    updatedAt: new Date(row.updated_at).getTime(),
  }));
}

async function saveRemote(userId: string, id: string, messages: UIMessage[]) {
  if (messages.length === 0) return;
  await supabaseBrowser.from("conversations").upsert({
    id,
    user_id: userId,
    title: deriveTitle(messages),
    messages,
    updated_at: new Date().toISOString(),
  });
}

async function deleteRemote(id: string) {
  await supabaseBrowser.from("conversations").delete().eq("id", id);
}

// ---------------------------------------------------------------
// API unifiée : userId=null -> localStorage, sinon -> Supabase.
// ---------------------------------------------------------------

export async function loadConversations(userId: string | null): Promise<StoredConversation[]> {
  return userId ? loadRemote() : loadLocal();
}

export async function saveConversation(
  userId: string | null,
  id: string,
  messages: UIMessage[]
): Promise<void> {
  if (userId) await saveRemote(userId, id, messages);
  else saveLocal(id, messages);
}

export async function deleteConversation(userId: string | null, id: string): Promise<void> {
  if (userId) await deleteRemote(id);
  else deleteLocal(id);
}

// Appelée une fois à la connexion : envoie l'historique local (invité)
// vers le compte qui vient de se connecter, puis vide le localStorage.
export async function migrateLocalToRemote(userId: string): Promise<void> {
  const local = loadLocal();
  for (const conv of local) {
    await saveRemote(userId, conv.id, conv.messages);
  }
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
}

export function newConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const text =
    firstUser?.parts.find((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      ?.text ?? "Nouvelle conversation";
  const trimmed = text.trim();
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed || "Nouvelle conversation";
}
