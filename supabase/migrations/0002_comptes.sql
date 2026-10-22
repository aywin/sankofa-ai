-- ============================================================
-- LAFI — 0002 : inscription avec choix du profil, gestion du compte
--
-- À exécuter APRÈS 0001_boutique.sql (dépend de profil, profil_role,
-- boutique, commande). Idempotent.
--
-- Modèle retenu : tout compte peut chercher des remèdes, sans statut
-- particulier. Le statut tradipraticien s'ajoute pour vendre : coché à
-- l'inscription, ou activé plus tard depuis /moi (statut 'declare' tant
-- que l'équipe ne l'a pas vérifié). Il ne se retire pas.
-- ============================================================

-- À l'inscription, le navigateur envoie dans user_metadata :
--   { "nom": "...", "profil": "tradipraticien" }   (profil absent sinon)
-- (supabase.auth.signUp, options.data). Le trigger crée le profil et, si
-- demandé, déclare le rôle — en une seule transaction avec la création du
-- compte, que la confirmation par e-mail soit activée ou non.
create or replace function profil_creer_pour_nouvel_utilisateur()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_nom text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'nom', '')), '');
begin
  insert into profil (id, nom_affichage)
  values (new.id, left(v_nom, 80))
  on conflict (id) do nothing;

  if new.raw_user_meta_data ->> 'profil' = 'tradipraticien' then
    insert into profil_role (profil_id, role, statut)
    values (new.id, 'tradipraticien', 'declare')
    on conflict (profil_id, role) do nothing;
  end if;
  return new;
end $$;

-- Les traces "qui a vérifié / qui a reversé" ne doivent pas empêcher la
-- suppression du compte d'un membre de l'équipe : la trace devient NULL,
-- la date reste.
alter table profil_role drop constraint if exists profil_role_verifie_par_fkey;
alter table profil_role add constraint profil_role_verifie_par_fkey
  foreign key (verifie_par) references profil(id) on delete set null;
alter table commande drop constraint if exists commande_reverse_par_fkey;
alter table commande add constraint commande_reverse_par_fkey
  foreign key (reverse_par) references profil(id) on delete set null;

-- Suppression de son propre compte. Les commandes payées sont conservées
-- (comptabilité, reversements) : un vendeur qui en a ne peut pas supprimer
-- son compte seul, l'équipe ferme la boutique avec lui.
create or replace function supprimer_mon_compte()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_boutique uuid;
begin
  if v_uid is null then
    raise exception 'Non connecté.';
  end if;

  select id into v_boutique from boutique where proprietaire_id = v_uid;
  if v_boutique is not null then
    if exists (select 1 from commande where boutique_id = v_boutique and statut in ('payee', 'remise')) then
      raise exception 'Ta boutique a déjà des ventes payées : contacte l''équipe de Lafi pour fermer ton compte (les reversements doivent être soldés).';
    end if;
    -- Commandes jamais payées : rien à conserver.
    delete from commande where boutique_id = v_boutique;
    delete from boutique where id = v_boutique;
  end if;

  -- Cascade : profil, profil_role, conversations, favoris.
  delete from auth.users where id = v_uid;
end $$;
revoke all on function supprimer_mon_compte() from public, anon;
grant execute on function supprimer_mon_compte() to authenticated;
