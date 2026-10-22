-- ============================================================
-- LAFI — 0001 : comptes (profil, rôles) et boutiques des tradipraticiens
--
-- Premier fichier du dossier supabase/migrations/ (lafi-v5.md P3.2 : les
-- anciens schema_v*.sql seront rangés ensuite). Idempotent : peut être
-- rejoué sans casser l'existant.
--
-- Décisions produit (22/10/2026) :
--   - Lafi encaisse via SasPay (un seul compte marchand) et reverse à la
--     main aux tradipraticiens, depuis le tableau de bord SasPay ;
--   - aucune commission pendant le pilote — le taux est quand même stocké
--     par commande, pour que l'historique reste juste le jour où il change ;
--   - un produit est publié tout de suite ; la modération retire a
--     posteriori (statut 'retire', que seul un admin peut poser ou lever) ;
--   - frais SasPay en mode DEDUCTED : l'acheteur paie le prix affiché, le
--     tradipraticien reçoit le net.
--
-- À exécuter dans Supabase : SQL Editor > New query.
-- ============================================================

-- ---------- Profil et rôles (base de lafi-v5.md P3.5) ----------

create table if not exists profil (
  id uuid primary key references auth.users(id) on delete cascade,
  nom_affichage text check (nom_affichage is null or length(trim(nom_affichage)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function profil_creer_pour_nouvel_utilisateur()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profil (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists profil_a_l_inscription on auth.users;
create trigger profil_a_l_inscription
  after insert on auth.users
  for each row execute function profil_creer_pour_nouvel_utilisateur();

-- Comptes existants avant cette migration.
insert into profil (id) select id from auth.users on conflict (id) do nothing;

-- Rôles cumulables : une même personne peut être utilisatrice simple ET
-- tradipraticienne, et passer de l'un à l'autre.
create table if not exists profil_role (
  profil_id uuid not null references profil(id) on delete cascade,
  role text not null check (role in ('tradipraticien', 'pro_sante', 'chercheur', 'curateur', 'admin')),
  statut text not null default 'declare' check (statut in ('declare', 'verifie', 'refuse')),
  verifie_par uuid references profil(id),
  verifie_le timestamptz,
  justificatif text,
  created_at timestamptz not null default now(),
  primary key (profil_id, role)
);

create or replace function est_admin(p_profil uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profil_role
    where profil_id = p_profil and role = 'admin' and statut = 'verifie'
  );
$$;

alter table profil enable row level security;
alter table profil_role enable row level security;

drop policy if exists "profil : lecture de soi" on profil;
create policy "profil : lecture de soi" on profil for select using (auth.uid() = id);
drop policy if exists "profil : modification de soi" on profil;
create policy "profil : modification de soi" on profil for update using (auth.uid() = id);

drop policy if exists "profil_role : lecture de soi" on profil_role;
create policy "profil_role : lecture de soi" on profil_role for select using (auth.uid() = profil_id);
-- On peut SE DÉCLARER tradipraticien ; jamais se vérifier, jamais se
-- donner un autre rôle (curateur, admin…) depuis le navigateur.
drop policy if exists "profil_role : se declarer tradipraticien" on profil_role;
create policy "profil_role : se declarer tradipraticien" on profil_role for insert
  with check (auth.uid() = profil_id and role = 'tradipraticien' and statut = 'declare' and verifie_par is null);

-- ---------- Allégations interdites ----------
-- Même liste que web/lib/allegations.ts (message lisible côté interface) ;
-- la contrainte en base garantit la règle même si l'interface est
-- contournée. Publication immédiate = aucun humain ne relit avant la mise
-- en ligne : c'est le seul filet a priori.
create or replace function texte_sans_allegation(p_texte text)
returns boolean language sql immutable as $$
  select coalesce(p_texte, '') !~* (
    'gu[eéè]ri|miracle|miraculeu|100 ?%|garanti|sans (aucun )?(danger|risque|effet secondaire)'
    || '|remplace (le |les |votre |ton |tes )?(m[eé]dicament|traitement)'
    || '|(soigne|traite|gu[eé]rit|contre) (le |la |les |l'')?(cancer|diab[eè]te|vih|sida|h[eé]patite|[eé]pilepsie|st[eé]rilit[eé]|infertilit[eé])'
  );
$$;

-- ---------- Boutique ----------

create table if not exists boutique (
  id uuid primary key default gen_random_uuid(),
  -- Une boutique par compte pour le pilote.
  proprietaire_id uuid not null unique references profil(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 40),
  nom text not null check (length(trim(nom)) between 2 and 80),
  description text check (description is null or length(description) <= 1000),
  ville text check (ville is null or length(ville) <= 80),
  -- Affiché publiquement : c'est le contact de l'acheteur pour la remise.
  telephone_contact text not null check (telephone_contact ~ '^\+?[0-9 ]{8,20}$'),
  -- Privé : numéro mobile money sur lequel Lafi reverse les ventes. Jamais
  -- servi par une route publique (lib/boutique.ts sélectionne ses colonnes).
  reversement_reseau text check (reversement_reseau in ('orange_money', 'moov_money', 'autre')),
  reversement_numero text check (reversement_numero is null or reversement_numero ~ '^\+?[0-9 ]{8,20}$'),
  reversement_nom text check (reversement_nom is null or length(reversement_nom) <= 80),
  statut text not null default 'active' check (statut in ('active', 'suspendue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boutique_sans_allegation check (texte_sans_allegation(nom) and texte_sans_allegation(description))
);

-- ---------- Produit ----------

create table if not exists produit (
  id uuid primary key default gen_random_uuid(),
  boutique_id uuid not null references boutique(id) on delete cascade,
  nom text not null check (length(trim(nom)) between 2 and 100),
  description text check (description is null or length(description) <= 2000),
  -- Franc CFA : pas de centimes. numeric (jamais de flottant), envoyé à
  -- SasPay en chaîne "2500.00".
  prix numeric(12, 2) not null check (prix >= 100 and prix <= 5000000 and prix = round(prix)),
  -- Réduction : prix réduit affiché à la place du prix (barré). NULL = pas
  -- de réduction. C'est ce prix-là qui est encaissé.
  prix_reduit numeric(12, 2) check (prix_reduit is null or (prix_reduit >= 100 and prix_reduit < prix and prix_reduit = round(prix_reduit))),
  devise text not null default 'XOF' check (devise = 'XOF'),
  -- Où le produit est disponible (par défaut la ville de la boutique).
  ville text check (ville is null or length(ville) <= 80),
  -- Plante d'origine quand elle n'est pas dans les fiches Lafi (sinon :
  -- produit_taxon, qui relie aux fiches).
  plante_origine_libre text check (plante_origine_libre is null or length(plante_origine_libre) <= 120),
  -- NULL = stock non suivi.
  stock integer check (stock is null or stock >= 0),
  image_url text,
  statut text not null default 'publie' check (statut in ('publie', 'masque', 'retire')),
  retire_motif text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint produit_sans_allegation check (texte_sans_allegation(nom) and texte_sans_allegation(description))
);
create index if not exists produit_boutique_idx on produit(boutique_id);

-- Plantes entrant dans la composition — relie la vitrine aux fiches et
-- usages documentés, sans en faire une allégation.
create table if not exists produit_taxon (
  produit_id uuid not null references produit(id) on delete cascade,
  taxon_id uuid not null references taxon(id),
  primary key (produit_id, taxon_id)
);

-- Le statut 'retire' appartient à la modération : un vendeur ne peut ni le
-- poser ni le lever. Idem pour la suspension d'une boutique.
create or replace function produit_proteger_moderation()
returns trigger language plpgsql as $$
begin
  if (new.statut = 'retire' or old.statut = 'retire') and new.statut is distinct from old.statut
     and auth.role() = 'authenticated' and not est_admin() then
    raise exception 'Ce produit a été retiré par la modération de Lafi : contacte l''équipe.';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists produit_moderation on produit;
create trigger produit_moderation before update on produit
  for each row execute function produit_proteger_moderation();

create or replace function boutique_proteger_statut()
returns trigger language plpgsql as $$
begin
  if new.statut is distinct from old.statut and auth.role() = 'authenticated' and not est_admin() then
    raise exception 'Seule l''équipe de Lafi peut suspendre ou réactiver une boutique.';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists boutique_statut on boutique;
create trigger boutique_statut before update on boutique
  for each row execute function boutique_proteger_statut();

-- ---------- Commandes ----------

create table if not exists commande (
  id uuid primary key default gen_random_uuid(),
  -- Référence lisible à dicter au téléphone (ex. L7K3QX).
  reference text not null unique,
  -- Secret de la page de suivi côté acheteur (pas de compte requis pour
  -- acheter) : l'UUID seul ne vaut pas autorisation.
  jeton_acces text not null,
  boutique_id uuid not null references boutique(id) on delete restrict,
  statut text not null default 'en_attente_paiement'
    check (statut in ('en_attente_paiement', 'payee', 'echouee', 'expiree', 'remise', 'annulee')),
  acheteur_nom text not null check (length(trim(acheteur_nom)) between 2 and 80),
  acheteur_telephone text not null check (acheteur_telephone ~ '^\+?[0-9 ]{8,20}$'),
  acheteur_email text not null check (acheteur_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  acheteur_note text check (acheteur_note is null or length(acheteur_note) <= 500),
  montant_total numeric(12, 2) not null check (montant_total > 0),
  devise text not null default 'XOF',
  commission_taux numeric(5, 4) not null default 0 check (commission_taux >= 0 and commission_taux < 1),
  -- Renseignés à la confirmation, depuis GET /payments/{id}/verify/ — jamais
  -- depuis le corps d'un webhook.
  frais_saspay numeric(12, 2),
  montant_net numeric(12, 2),
  montant_a_reverser numeric(12, 2),
  saspay_session_id text unique,
  saspay_checkout_url text,
  saspay_transaction_id text unique,
  saspay_reference text,
  payee_le timestamptz,
  remise_le timestamptz,
  reversement_statut text not null default 'non_du' check (reversement_statut in ('non_du', 'a_reverser', 'reverse')),
  reversement_reference text,
  reverse_le timestamptz,
  reverse_par uuid references profil(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists commande_boutique_idx on commande(boutique_id, created_at desc);
create index if not exists commande_a_reverser_idx on commande(reversement_statut) where reversement_statut = 'a_reverser';

create table if not exists commande_ligne (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references commande(id) on delete cascade,
  -- set null : la commande garde son instantané si le produit est supprimé.
  produit_id uuid references produit(id) on delete set null,
  nom_produit text not null,
  prix_unitaire numeric(12, 2) not null,
  quantite integer not null check (quantite between 1 and 99)
);
create index if not exists commande_ligne_commande_idx on commande_ligne(commande_id);

-- Confirmation atomique et idempotente : n'agit qu'une fois, même si la
-- page de retour, le webhook et une relance arrivent en même temps.
create or replace function commande_confirmer_paiement(
  p_commande uuid, p_transaction_id text, p_reference text, p_net numeric, p_frais numeric
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update commande
     set statut = 'payee',
         saspay_transaction_id = p_transaction_id,
         saspay_reference = p_reference,
         montant_net = p_net,
         frais_saspay = p_frais,
         montant_a_reverser = round(p_net * (1 - commission_taux)),
         reversement_statut = 'a_reverser',
         payee_le = now(),
         updated_at = now()
   where id = p_commande and statut in ('en_attente_paiement', 'echouee', 'expiree');

  if not found then
    return false;
  end if;

  update produit p
     set stock = greatest(p.stock - l.quantite, 0)
    from commande_ligne l
   where l.commande_id = p_commande and l.produit_id = p.id and p.stock is not null;
  return true;
end $$;
revoke all on function commande_confirmer_paiement(uuid, text, text, numeric, numeric) from public, anon, authenticated;

-- Le vendeur signale qu'il a remis la commande à l'acheteur.
create or replace function commande_marquer_remise(p_commande uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update commande c
     set statut = 'remise', remise_le = now(), updated_at = now()
    from boutique b
   where c.id = p_commande and c.boutique_id = b.id
     and b.proprietaire_id = auth.uid() and c.statut = 'payee';
  return found;
end $$;
revoke all on function commande_marquer_remise(uuid) from public, anon;
grant execute on function commande_marquer_remise(uuid) to authenticated;

-- ---------- Journal SasPay et signalements (serveur uniquement) ----------

-- Corps brut des webhooks : charge utile d'un tiers conservée telle quelle
-- pour l'audit (seul usage de jsonb ici, volontairement).
create table if not exists saspay_evenement (
  id uuid primary key default gen_random_uuid(),
  evenement text,
  transaction_id text,
  signature_valide boolean not null,
  corps jsonb,
  erreur text,
  recu_le timestamptz not null default now(),
  traite_le timestamptz
);

create table if not exists signalement_produit (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid not null references produit(id) on delete cascade,
  motif text not null check (length(trim(motif)) between 3 and 500),
  contact text check (contact is null or length(contact) <= 120),
  traite boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------

alter table boutique enable row level security;
alter table produit enable row level security;
alter table produit_taxon enable row level security;
alter table commande enable row level security;
alter table commande_ligne enable row level security;
alter table saspay_evenement enable row level security;
alter table signalement_produit enable row level security;
-- saspay_evenement, signalement_produit : aucune policy = service role seul.

drop policy if exists "boutique : proprietaire lit" on boutique;
create policy "boutique : proprietaire lit" on boutique for select using (auth.uid() = proprietaire_id);
drop policy if exists "boutique : proprietaire cree" on boutique;
create policy "boutique : proprietaire cree" on boutique for insert
  with check (auth.uid() = proprietaire_id and statut = 'active');
drop policy if exists "boutique : proprietaire modifie" on boutique;
create policy "boutique : proprietaire modifie" on boutique for update using (auth.uid() = proprietaire_id);

drop policy if exists "produit : proprietaire gere" on produit;
create policy "produit : proprietaire gere" on produit for all
  using (exists (select 1 from boutique b where b.id = boutique_id and b.proprietaire_id = auth.uid()))
  with check (exists (select 1 from boutique b where b.id = boutique_id and b.proprietaire_id = auth.uid()));

drop policy if exists "produit_taxon : proprietaire gere" on produit_taxon;
create policy "produit_taxon : proprietaire gere" on produit_taxon for all
  using (exists (select 1 from produit p join boutique b on b.id = p.boutique_id
                 where p.id = produit_id and b.proprietaire_id = auth.uid()))
  with check (exists (select 1 from produit p join boutique b on b.id = p.boutique_id
                      where p.id = produit_id and b.proprietaire_id = auth.uid()));

-- Commandes : lecture seule pour le vendeur ; création et confirmation
-- uniquement par le serveur (service role).
drop policy if exists "commande : vendeur lit" on commande;
create policy "commande : vendeur lit" on commande for select
  using (exists (select 1 from boutique b where b.id = boutique_id and b.proprietaire_id = auth.uid()));
drop policy if exists "commande_ligne : vendeur lit" on commande_ligne;
create policy "commande_ligne : vendeur lit" on commande_ligne for select
  using (exists (select 1 from commande c join boutique b on b.id = c.boutique_id
                 where c.id = commande_id and b.proprietaire_id = auth.uid()));

-- ---------- Images des produits (Supabase Storage) ----------
-- Bucket public en lecture ; chacun n'écrit que dans son dossier <uid>/.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produits', 'produits', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "produits : depot dans son dossier" on storage.objects;
create policy "produits : depot dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'produits' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "produits : remplacement dans son dossier" on storage.objects;
create policy "produits : remplacement dans son dossier" on storage.objects for update to authenticated
  using (bucket_id = 'produits' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "produits : suppression dans son dossier" on storage.objects;
create policy "produits : suppression dans son dossier" on storage.objects for delete to authenticated
  using (bucket_id = 'produits' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- Premier admin ----------
-- À exécuter à la main, une fois, avec l'email du compte qui gère les
-- reversements et la modération :
--   insert into profil_role (profil_id, role, statut, verifie_le)
--   select id, 'admin', 'verifie', now() from auth.users where email = '...'
--   on conflict (profil_id, role) do update set statut = 'verifie';
