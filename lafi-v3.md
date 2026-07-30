# LAFI — v3 : plateforme (architecture, confiance, contribution)

**Prérequis :** v1 (moteur agentique + chat basique) et v2 (persona, composer,
profils, multimodal, cartes de plantes, identité visuelle, historique de
conversations avec comptes) sont déjà en place. Ce document ne les refait pas,
il construit dessus.

Même format que v1/v2 : chaque prompt se suffit à lui-même, à donner un par un
à un agent de codage, dans l'ordre. Ne pas passer au prompt N+1 avant d'avoir
vérifié les critères d'acceptation du prompt N.

## D'où vient ce document

Deux constats indépendants, l'un sur le *scope produit* (comparaison avec le
pitch/MVP décrit dans `LAFI IA.docx`), l'autre sur l'*interface* (retour direct
après avoir vu l'app tourner), pointent dans la même direction : Lafi
fonctionne, mais se présente comme un widget de recherche plutôt que comme la
plateforme décrite dans le pitch. Les deux constats sont résumés ci-dessous
pour ne pas les reperdre.

### Ce qui manque côté produit (vs. le pitch)

- Une **fiche plante complète** (photo, précautions, sources) — aujourd'hui
  une plante n'est qu'une carte dans une réponse de chat, jamais une page.
- Un **score de confiance réel** — aujourd'hui juste "traditionnel" ou
  "traditionnel + scientifique", sans volume de preuve visible.
- Le **"pourquoi cette recommandation"** — déjà couvert en fait : le point 1
  du retour post-v2 (`lafi-v2.md`, tout en bas) a déjà rendu Lafi libre
  d'expliquer/comparer/justifier dans son texte. Pas besoin d'un mécanisme
  séparé, juste de vérifier que le system prompt encourage bien ce
  raisonnement visible — pas de prompt dédié ici pour ne pas dupliquer.
- La **contribution communautaire** ("chez moi on utilise cette plante
  contre...") — décrite dans le pitch comme le mécanisme qui construit la
  base de connaissances dans la durée, et actuellement totalement absente.
  C'est probablement la fonctionnalité la plus différenciante du projet et
  celle qui manque le plus.
- **Favoris** — pas construits.
- **Identification par photo** — déjà techniquement en place depuis la v2
  (entrée multimodale), mais peu visible dans l'UI ; à mettre en avant dans
  la nouvelle sidebar (prompt 2) plutôt qu'à reconstruire.

### Ce qui ne va pas côté interface

- La colonne de conversation est plafonnée à `max-w-2xl` (672px) alors que
  l'écran fait 1920px de large sur desktop : plus de 60% de l'écran reste
  vide. Une recherche rapide confirme que même Claude.ai — pourtant déjà une
  référence UX — reçoit ce reproche : plusieurs extensions de navigateur
  existent uniquement pour élargir sa zone de chat ([Claude Wide
  Chat](https://chromewebstore.google.com/detail/claude-wide-chat/jmipcnoekninfignnkmeadoaaljnaaja),
  [WideChat](https://chromewebstore.google.com/detail/widechat-full-width-ai-ch/nblbllelpafbjfjdhidfneoajhoemgnh)).
  Le signal n'est pas "copier Claude à l'identique", c'est "ne pas être plus
  étroit qu'un produit qui se fait déjà critiquer pour ça".
- La réponse de Lafi est enfermée dans une carte grise arrondie
  (`bg-neutral-100`, voir `ChatMessages.tsx`) — ça donne un look "résultat de
  recherche" plutôt que "conversation", surtout quand la carte de plante
  (`PlantCard`) est elle-même une deuxième carte juste en dessous.
- Aucune navigation persistante : l'historique existe (v2) mais reste caché
  derrière une icône et un tiroir — sur desktop, rien ne signale qu'on est
  dans un produit avec plusieurs fonctionnalités plutôt qu'une seule page.
- Les précautions sont cachées derrière "Voir les précautions" — pour un
  produit de santé, une information de sécurité ne devrait jamais nécessiter
  un clic supplémentaire pour être vue.

## Décisions prises pour la v3 (supersèdent certaines décisions v2)

- **On revient sur "pas de sidebar, pas de header" de la v2.** Ce choix avait
  du sens pour un MVP minimal ; à l'usage sur desktop, il donne l'impression
  d'un formulaire de recherche plutôt que d'une plateforme. On assume
  maintenant une vraie coquille d'app : header + sidebar persistante sur
  desktop (repliable), tiroir sur mobile (l'interaction mobile de la v2 ne
  change pas). L'esprit "chaque ajout doit augmenter l'utilité perçue, pas
  remplir de l'espace" reste la règle pour tout le reste.
- **Largeur de contenu :** `max-w-2xl` (672px) → **~880px** pour la colonne
  de conversation. On vise large sans devenir un mur de texte illisible —
  pas de edge-to-edge.
- **Un score de confiance ne s'invente jamais.** Le "🟢 92%" vu dans les
  retours externes était un exemple d'habillage, pas un contrat de données.
  En v3, le score vient uniquement du nombre réel de sources enregistrées en
  base (table `sources`, prompt 1) — jamais une estimation produite par le
  modèle. C'est la même règle que "ne jamais inventer une plante", appliquée
  à la confiance.
- **Précautions toujours visibles directement**, sur la carte comme sur la
  fiche — jamais derrière un accordéon.
- **Fiche plante = vraie page** (`/plants/[slug]`), pas une popup ni un
  accordéon dans le chat.
- **Contribution = capture uniquement en v3.** Table `contributions` avec
  statut `en_attente`, pas de back-office de validation — la validation
  manuelle via le Table Editor de Supabase suffit tant que le volume est
  faible. Un vrai back-office de modération est un chantier v4.
- **Favoris** suivent exactement le pattern déjà établi pour l'historique
  (`lib/conversations.ts`) : invité → `localStorage`, compte → Supabase avec
  migration automatique à la connexion. Pas de nouvelle architecture
  parallèle.

---

## Prompt 1 — Fondations de données : sources et confiance réelle

**Objectif :** sans ça, le "score de confiance" du prompt 5 ne serait qu'un
habillage cosmétique déconnecté des données — donc on pose d'abord la table
qui rend le score honnête.

**Contexte :** `usages` a déjà un `niveau_de_preuve` (traditionnel /
scientifique / les_deux) et `match_usages` retourne déjà une `similarity`
(similarité cosine de la requête, pas une mesure de confiance — ne pas
confondre les deux). Ce qui manque : un décompte réel du nombre de sources
qui appuient chaque usage.

**Tâches :**
1. Nouveau fichier `supabase/schema_v3.sql` (même pattern que
   `schema_users.sql` : fichier séparé à exécuter manuellement dans le SQL
   Editor Supabase) :
   ```sql
   create table if not exists sources (
     id uuid primary key default gen_random_uuid(),
     usage_id uuid not null references usages(id) on delete cascade,
     type text not null check (type in ('tradipraticien', 'scientifique', 'institution')),
     label text not null, -- ex. "Tradipraticien, région du Sahel" ou "Journal of Ethnopharmacology, 2019"
     reference_url text,
     created_at timestamptz not null default now()
   );
   create index if not exists sources_usage_id_idx on sources(usage_id);
   alter table sources enable row level security; -- pas de policy : accès service role uniquement, comme usages/plantes/maladies
   ```
   Ajouter aussi `alter table plantes add column if not exists photo_url text;`
   dans le même fichier.
2. Compléter `supabase/seed.sql` avec quelques lignes `sources` illustratives
   pour une partie des 24 usages existants (pas besoin de couvrir les 24) —
   commenter clairement que ce sont des données d'exemple à remplacer avant
   une vraie démo, exactement dans l'esprit du seed existant.
3. Mettre à jour la fonction `match_usages` (dans `supabase/schema.sql`, ou
   une nouvelle version dans `schema_v3.sql` qui la remplace via
   `create or replace function`) pour retourner en plus, par ligne :
   `tradipraticien_count int`, `scientifique_count int`,
   `institution_count int` (comptage via sous-requête ou jointure agrégée sur
   `sources`).
4. Mettre à jour `web/lib/types.ts` : ajouter `Source` (`id`, `usage_id`,
   `type`, `label`, `reference_url`) et étendre `MatchUsageResult` avec les
   trois champs de comptage.

**Critères d'acceptation :**
- `select * from sources` retourne les lignes seedées.
- Un appel à `match_usages` sur une requête type "paludisme" retourne des
  comptages cohérents avec un `select count(*) from sources where usage_id = ...`
  manuel.
- `plantes.photo_url` existe (nullable, peut rester vide pour l'instant).

---

## Prompt 2 — Coquille d'application : header + sidebar persistante

**Objectif :** remplacer le tiroir flottant + colonne centrée étroite par une
vraie coquille d'app, sur le modèle deux-colonnes (sidebar + zone principale)
de Claude.ai.

**Contexte :** `ConversationSidebar.tsx` existe déjà (tiroir en overlay,
fermé par défaut, avec nouvelle conversation / historique / compte) — on ne
la reconstruit pas, on l'étend et on change son mode d'affichage sur desktop.

**Tâches :**
1. Sur desktop (`md:` et plus) : la sidebar devient **persistante et
   inline** (plus un overlay), largeur fixe ~280px, avec un bouton pour la
   replier (état persisté en `localStorage`, comme `PROFIL_STORAGE_KEY`).
   Sur mobile : comportement inchangé (tiroir en overlay, tel qu'aujourd'hui).
2. Étendre `ConversationSidebar.tsx` avec une section "Explorer" au-dessus ou
   en dessous de l'historique :
   - "🌿 Plantes" → `/plants` (index créé au prompt 4)
   - "🦠 Maladies" → `/maladies` (nouvelle page simple listant les maladies
     via l'API `/api/maladies` déjà existante — pas de nouvelle route API)
   - "📷 Identifier une plante" → déclenche directement le flux photo déjà
     construit en v2 (le menu "+" du composer), pour lui donner de la
     visibilité sans rien reconstruire.
   - Emplacement réservé pour "⭐ Favoris" (câblé au prompt 7).
3. Header : garde le logo "Lafi" + le toggle sidebar (remplace l'icône
   historique actuelle qui ouvrait le tiroir) ; le `ProfileSelector` reste
   près du composer (c'est un réglage par message, pas un réglage de
   navigation).

**Critères d'acceptation :**
- Sur un viewport ≥1024px, la sidebar et le header sont visibles en
  permanence sans avoir à cliquer sur quoi que ce soit.
- Sur mobile, le comportement (ouverture/fermeture du tiroir) est identique
  à celui d'aujourd'hui.
- Les liens "Plantes"/"Maladies" mènent aux pages du prompt 4.

---

## Prompt 3 — Largeur et flux de conversation façon Claude

**Objectif :** faire disparaître l'effet "mur de vide" et l'effet "carte de
résultats" pointés dans le retour.

**Tâches :**
1. Élargir la colonne de conversation de `max-w-2xl` à `max-w-[880px]` —
   appliquer la même largeur partout où `max-w-2xl` structure aujourd'hui la
   mise en page (`ChatMessages.tsx`, le conteneur du composer, du
   `ProfileSelector`, du `DisclaimerBanner` dans `page.tsx`) pour que tout
   reste aligné sur une seule colonne cohérente.
2. Retirer l'habillage `bg-neutral-100 rounded-2xl` sur le texte de
   l'assistant dans `ChatMessages.tsx` (~ligne 205) : le texte de Lafi doit
   couler directement sur le fond de la page, aligné à gauche, pleine
   largeur de la colonne — sans carte. Garder la bulle teintée pour les
   messages utilisateur (la distinction "moi" / "Lafi" reste un signal
   utile, contrairement à la carte sur la réponse de Lafi qui n'ajoutait
   rien).
3. Alléger visuellement `PlantCard.tsx` en conséquence : maintenant que le
   texte libre au-dessus n'est plus dans une carte, la carte de plante ne
   doit plus donner l'impression d'être une deuxième carte de résultats qui
   fait doublon — bordure plus discrète, moins de fond plein.

**Critères d'acceptation :**
- Comparaison de capture d'écran avant/après : les réponses de Lafi ne sont
  plus dans un encadré gris.
- Sur un viewport ≥1440px, l'espace vide de part et d'autre de la
  conversation est nettement réduit par rapport à aujourd'hui.

---

## Prompt 4 — Fiche plante complète (`/plants/[slug]`)

**Objectif :** transformer une plante d'un fragment de réponse de chat en un
véritable enregistrement consultable — et rendre les précautions visibles
sans clic (répond directement aux deux points du retour sur les fiches et la
sécurité).

**Tâches :**
1. Petit helper de slug dans `web/lib/slug.ts` (ex. `Neem (Margousier)` →
   `neem-margousier`), utilisé dans les deux sens (génération du lien,
   résolution de la fiche par `nom_local` — comparaison insensible à la
   casse/accents).
2. `web/app/plants/[slug]/page.tsx` (server component) : résout la plante
   par slug via `supabaseServer`, récupère aussi tous ses `usages` (jointure
   `maladies` + `sources`) — une plante peut traiter plusieurs maladies.
   Affiche : photo (`photo_url`, ou un simple pictogramme feuille en
   fallback si vide — pas besoin d'un vrai service de photos pour ce
   prompt), nom local + nom scientifique (italique), description,
   **précautions affichées directement, jamais repliées**, puis la liste des
   usages (maladie, préparation, posologie, niveau de preuve, sources).
3. `web/app/plants/page.tsx` : index simple de toutes les plantes (réutilise
   `GET /api/plantes` existant), grille ou liste, chaque entrée renvoie vers
   sa fiche.
4. Dans `PlantCard.tsx`, le nom de la plante devient un lien vers
   `/plants/[slug]`.

**Critères d'acceptation :**
- Cliquer sur le nom d'une plante dans une réponse de chat, ou depuis
  `/plants`, ouvre une page dédiée avec des données réelles de Supabase.
- Les précautions sont visibles immédiatement sur la fiche, sans interaction.

---

## Prompt 5 — Score de confiance honnête

**Objectif :** afficher un indicateur 🟢/🟡 basé **uniquement** sur les
comptages réels du prompt 1 — jamais un pourcentage inventé.

**Tâches :**
1. `web/lib/confidence.ts` : fonction pure qui prend
   `{ tradipraticien_count, scientifique_count, institution_count }` et
   retourne un tier. Règle explicite à documenter en commentaire (c'est un
   choix produit, pas une évidence) : par exemple `🟢 "Fiable"` si
   `scientifique_count >= 1 && tradipraticien_count >= 2`, sinon `🟡
   "Données limitées"` si au moins une source existe, sinon
   `"Sources non renseignées"` (ne jamais afficher 🟡 avec un décompte à
   zéro — un badge de confiance sur zéro donnée serait aussi malhonnête
   qu'un chiffre inventé).
2. Afficher le tier + les décomptes réels (ex. "🟢 Fiable — 3
   tradipraticiens, 1 publication") sur `PlantCard.tsx` et sur la fiche
   plante (prompt 4), en complément du badge `niveau_de_preuve` existant —
   les deux répondent à des questions différentes (nature de la preuve vs.
   volume de preuve), donc les garder tous les deux plutôt que remplacer
   l'un par l'autre.

**Critères d'acceptation :**
- Pour un usage seedé avec des sources (prompt 1), le badge correspond
  exactement à un comptage manuel dans la table `sources`.
- Aucune plante n'affiche jamais un pourcentage qui ne soit pas traçable à
  un comptage de lignes réel.

---

## Prompt 6 — Contribution communautaire ("Signaler un remède")

**Objectif :** capter le signal décrit dans le pitch comme le mécanisme qui
construit la base de connaissances dans la durée — la fonctionnalité la plus
différenciante et, actuellement, la plus absente.

**Tâches :**
1. Dans `supabase/schema_v3.sql` (prompt 1) : table `contributions`
   (`id`, `plante_nom text`, `maladie_nom text`, `preparation text`,
   `posologie text`, `region text`, `ethnie text`, `langue text`,
   `contributeur text`, `contact text`, `statut text not null default
   'en_attente' check (statut in ('en_attente','validee','rejetee'))`,
   `created_at`). Pas de clé étrangère vers `plantes`/`maladies` — tout
   l'intérêt est de pouvoir signaler quelque chose qui n'existe pas encore
   en base. RLS activé, **aucune policy de lecture** (insertion via la route
   API service-role uniquement ; consultation manuelle via le Table Editor
   Supabase pour la modération v3).
2. `web/app/api/contributions/route.ts` (POST) : valide le corps avec Zod,
   insère une ligne via `supabaseServer`. Pas d'authentification requise
   (`contributeur`/`contact` sont du texte libre optionnel, pas un compte).
3. `web/components/chat/ContributeModal.tsx` : formulaire correspondant aux
   champs de la table, message de confirmation après envoi ("Merci, on
   vérifie ça"). Deux points d'entrée : un lien "➕ Contribuer" dans la
   sidebar (prompt 2), et une invite contextuelle affichée par l'UI (pas par
   le modèle) juste sous le message "Aucune correspondance trouvée dans le
   savoir traditionnel" dans `ChatMessages.tsx` — une affordance d'interface,
   pas un texte que le modèle doit apprendre à générer.

**Critères d'acceptation :**
- Soumettre le formulaire crée une ligne avec `statut = 'en_attente'`,
  visible dans le Table Editor Supabase.
- Aucune route ne permet à un client de lister les contributions des autres
  utilisateurs (RLS bloque le select).

---

## Prompt 7 — Favoris

**Objectif :** même dualité invité/compte que l'historique de conversations,
appliquée aux plantes sauvegardées — même pattern, pas une architecture
parallèle.

**Tâches :**
1. `web/lib/favorites.ts` : miroir de `web/lib/conversations.ts` (mêmes
   noms de fonctions par analogie : `loadFavorites`, `saveFavorite`,
   `removeFavorite`, `migrateLocalToRemote`), stockage `localStorage` en
   mode invité (liste de `plante_id`).
2. Côté Supabase, ajouter dans `schema_v3.sql` : table `favoris` (`id`,
   `user_id references auth.users(id) on delete cascade`,
   `plante_id references plantes(id) on delete cascade`,
   `unique(user_id, plante_id)`, `created_at`), RLS scopée par `user_id`
   exactement comme `conversations` dans `schema_users.sql` (4 policies :
   select/insert/update/delete sur `auth.uid() = user_id`).
3. Bouton étoile sur `PlantCard.tsx` et sur la fiche plante (prompt 4) ;
   section "⭐ Favoris" dans la sidebar (prompt 2) listant les plantes
   sauvegardées avec lien vers leur fiche.
4. Réutiliser le même point de migration que pour les conversations
   (`migratedForUser` dans `page.tsx`) pour transférer les favoris invités
   vers le compte à la connexion.

**Critères d'acceptation :**
- Mettre une plante en favori déconnecté persiste après rafraîchissement
  (localStorage).
- Se connecter migre ce favori vers le compte.
- Un favori ajouté connecté est visible depuis une seconde session connectée
  au même compte.
