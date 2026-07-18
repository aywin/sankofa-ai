-- ============================================================
-- LAFI — Comptes utilisateurs + historique de conversations
-- À exécuter dans Supabase : Project > SQL Editor > New query
-- Nécessite que l'auth email/mot de passe soit activée
-- (Authentication > Providers > Email, activée par défaut sur un
-- nouveau projet Supabase).
-- ============================================================

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nouvelle conversation',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx on conversations(user_id);

-- RLS : chaque utilisateur ne voit et ne modifie que ses propres
-- conversations. Contrairement à maladies/plantes/usages (accès service
-- role uniquement), cette table est interrogée directement par le
-- navigateur avec la clé anon + la session de l'utilisateur connecté —
-- c'est le RLS qui fait tout le travail de sécurité ici.
alter table conversations enable row level security;

create policy "Les utilisateurs lisent leurs propres conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs créent leurs propres conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres conversations"
  on conversations for delete
  using (auth.uid() = user_id);
