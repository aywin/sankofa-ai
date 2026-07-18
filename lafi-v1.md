# LAFI IA — v1 (Next.js + Vercel)

Chaque prompt ci-dessous se suffit à lui-même : à donner un par un à un agent de codage
(dans un nouveau projet ou en continuation), dans l'ordre. Ne pas passer au prompt N+1
avant d'avoir vérifié les critères d'acceptation du prompt N.

**Décisions déjà prises (ne pas remettre en question) :**
- Next.js (App Router, TypeScript) + Tailwind, déployé sur Vercel.
- Supabase Postgres + extension `pgvector` comme base de données.
- Gemini (`gemini-2.5-flash` pour le chat, `text-embedding-004` pour les embeddings) via le Vercel AI SDK (`ai` + `@ai-sdk/google`).
- Recherche **sémantique uniquement** (embeddings + cosine similarity). Aucun mot-clé, ILIKE ou regex.
- L'agent IA a un **accès outillé (tool calling)** à la base — ce n'est pas un pipeline figé
  "1 recherche → 1 réponse", c'est une boucle agentique : l'agent décide quels outils
  appeler, combien de fois, avant de répondre.
- Le SQL (schéma + seed) est déjà écrit : `supabase/schema.sql` et `supabase/seed.sql` à la racine du repo.
  Ils doivent être exécutés manuellement dans Supabase (SQL Editor) avant le prompt 2.

---

## Prompt 1 — Setup du projet Next.js + connexion Supabase

**Objectif :** avoir un projet Next.js qui démarre, connecté à Supabase, prêt à recevoir le reste.

**Contexte :** le backend existant (`backend/`) est un squelette Python/FastAPI jamais réellement
implémenté (juste `main.py`, un `README.md` décrivant l'API voulue, `requirements.txt`). On ne
migre pas de code — on repart sur une nouvelle app Next.js, dans un dossier `web/` à la racine
du repo, à côté de `backend/` (qu'on laisse tel quel pour l'instant, sans y toucher).

**Tâches :**
1. Créer une app Next.js dans `web/` : TypeScript, App Router, Tailwind, ESLint activés.
2. Installer les dépendances : `@supabase/supabase-js`, `ai`, `@ai-sdk/google`, `zod`.
3. Créer `web/.env.local.example` avec les variables :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (jamais exposée au client, utilisée uniquement côté serveur)
   - `GOOGLE_GENERATIVE_AI_API_KEY`
4. Créer `web/lib/supabase.ts` : un client Supabase **serveur uniquement** (utilise la service role
   key), à importer dans les routes API / server actions. Pas de client Supabase côté navigateur en v1.
5. Créer une route de vérification `web/app/api/health/route.ts` qui retourne `{ status: "ok" }`.
6. Mettre à jour `web/README.md` avec les instructions d'installation (`npm install`, copier
   `.env.local.example` en `.env.local`, `npm run dev`).

**Critères d'acceptation :**
- `npm run dev` lance l'app sans erreur.
- `GET /api/health` répond `{ status: "ok" }`.
- Le client Supabase se connecte sans erreur (test simple : une requête `select 1` ou équivalent
  loggée au démarrage, ou une route `/api/debug-db` temporaire qui fait un `select count(*) from maladies`
  et retourne le résultat — à supprimer une fois vérifié).

---

## Prompt 2 — Vérifier les données et exposer des routes de lecture simples

**Objectif :** confirmer que le schéma + seed SQL (déjà exécutés manuellement dans Supabase via
`supabase/schema.sql` puis `supabase/seed.sql`) sont bien en place, et exposer deux routes de
lecture basiques pour les inspecter facilement.

**Contexte :** à ce stade, les tables `maladies`, `plantes`, `usages` existent et sont peuplées
(8 maladies, 15 plantes, 24 usages), mais la colonne `usages.embedding` est `NULL` partout —
elle sera remplie au prompt 3.

**Tâches :**
1. Créer `web/app/api/maladies/route.ts` (GET) : retourne la liste des maladies (`id`, `nom`,
   `symptomes`, `description`).
2. Créer `web/app/api/plantes/route.ts` (GET) : retourne la liste des plantes (`id`, `nom_local`,
   `nom_scientifique`, `description`, `precautions`).
3. Définir les types TypeScript correspondants dans `web/lib/types.ts` (`Maladie`, `Plante`, `Usage`).

**Critères d'acceptation :**
- `GET /api/maladies` retourne les 8 maladies seedées.
- `GET /api/plantes` retourne les 15 plantes seedées.
- Aucune erreur TypeScript, types cohérents avec le schéma SQL.

---

## Prompt 3 — Génération des embeddings

**Objectif :** remplir la colonne `usages.embedding` pour que la recherche sémantique (prompt 4)
ait quelque chose à interroger.

**Tâches :**
1. Créer un script `web/scripts/generate-embeddings.ts` (exécutable via `tsx` ou `ts-node`,
   ajouter le script npm `"embeddings": "tsx scripts/generate-embeddings.ts"`).
2. Le script :
   - Récupère toutes les lignes de `usages` où `embedding is null`.
   - Pour chacune, appelle le modèle d'embedding Gemini (`text-embedding-004` via
     `@ai-sdk/google`, fonction `embed()` du Vercel AI SDK) sur le champ `contenu_pour_recherche`
     (déjà pré-rempli par le seed SQL — pas besoin de le reconstruire).
   - Met à jour la ligne correspondante avec le vecteur obtenu (`update usages set embedding = ... where id = ...`).
   - Logge une ligne de progression par usage traité (ex: `✓ Neem → Paludisme`).
3. Gérer les erreurs API (retry simple, 1 tentative supplémentaire en cas d'échec) sans faire
   planter tout le script pour une seule ligne.

**Critères d'acceptation :**
- Après exécution, `select count(*) from usages where embedding is null` retourne `0`.
- Un test manuel de la fonction RPC `match_usages` dans le SQL Editor Supabase, avec un vecteur
  d'une requête test (ex. embedding de "j'ai de la fièvre et des frissons"), retourne des résultats
  pertinents (Neem, Papayer, Caïlcédrat, Néré pour le paludisme en tête de liste).

---

## Prompt 4 — Agent IA avec accès outillé à la base (`/api/chat`)

**Objectif :** la pièce centrale — un agent Gemini qui peut interroger la base Supabase via des
outils (tool calling), en boucle agentique, avant de répondre à l'utilisateur.

**Contexte :** pas de recherche par mot-clé/regex nulle part. Toute recherche passe par la fonction
RPC `match_usages` (similarité cosine sur embeddings), exposée à l'agent comme un outil parmi
d'autres — l'agent décide seul quand et combien de fois l'appeler.

**Tâches :**
1. Créer `web/app/api/chat/route.ts` (POST, streaming) utilisant `streamText` du Vercel AI SDK
   avec le modèle `google('gemini-2.5-flash')`.
2. Définir deux outils (format `tool()` du SDK, avec schéma Zod) :
   - **`rechercher_par_symptome`** : paramètre `description: string`. Génère l'embedding de la
     description via `text-embedding-004`, appelle la RPC `match_usages` (Supabase), retourne les
     résultats (plante, préparation, posologie, niveau de preuve, similarité).
   - **`obtenir_details_plante`** : paramètre `nom: string`. Récupère la ligne complète de
     `plantes` (description, précautions) par `nom_local`.
3. Configurer une boucle multi-étapes (`stopWhen`/`maxSteps` selon la version du SDK, borner à
   ~4-5 étapes) pour que l'agent puisse enchaîner plusieurs appels d'outils avant de répondre.
4. Rédiger un system prompt en français qui impose :
   - Toujours passer par `rechercher_par_symptome` avant de proposer une plante — ne jamais
     inventer une plante ou un usage qui ne vient pas des résultats d'outil.
   - Mentionner systématiquement le `niveau_de_preuve` de chaque recommandation.
   - Terminer chaque réponse par un rappel que ça ne remplace pas un avis médical professionnel.
   - Répondre en français, ton clair et accessible (pas de jargon).
5. Streamer la réponse au format attendu par `useChat` (prompt 5).

**Critères d'acceptation :**
- Un appel `POST /api/chat` avec un message du type "j'ai de la fièvre et des frissons depuis
  2 jours" déclenche un appel à `rechercher_par_symptome`, puis une réponse streamée citant des
  plantes réellement présentes en base (pas inventées).
- Un message hors sujet (ex. "quelle heure est-il") ne déclenche pas d'appel d'outil inutile et
  reçoit une réponse cohérente indiquant que la plateforme traite des questions de santé/plantes.

---

## Prompt 5 — Interface de chat

**Objectif :** une UI de chat fonctionnelle, intuitive, connectée à `/api/chat`.

**Tâches :**
1. Page principale `web/app/page.tsx` : interface de chat plein écran, utilisant `useChat` (hook
   `ai/react` ou `@ai-sdk/react` selon la version) pointé sur `/api/chat`.
2. Composants dans `web/components/chat/` :
   - `ChatMessages.tsx` : bulles de message (utilisateur à droite, agent à gauche), rendu markdown
     léger pour la réponse de l'agent, indicateur de streaming (texte qui s'affiche au fur et à mesure).
   - `ChatInput.tsx` : zone de saisie + bouton d'envoi, désactivé pendant le streaming, focus auto.
   - `SourcesBadge.tsx` (optionnel mais recommandé) : quand un outil a été appelé, afficher un petit
     badge listant les plantes citées comme sources, pour rendre visible que la réponse est ancrée
     dans la base et pas générée librement.
3. Bandeau de disclaimer fixe en haut de page : rappel que Lafi IA ne remplace pas un avis médical.
4. Design sobre, mobile-first, lisible — pas besoin de charte graphique poussée pour la v1, mais
   propre (espacement correct, contraste correct, pas de superposition sur mobile).
5. État vide (avant le premier message) : quelques exemples de questions cliquables (ex. "J'ai de
   la fièvre et des frissons", "Comment soigner une plaie qui s'infecte ?") pour guider l'utilisateur.

**Critères d'acceptation :**
- Ouvrir `http://localhost:3000`, taper un symptôme, voir la réponse se streamer avec des plantes
  réelles de la base citées.
- Testable sur mobile (responsive, pas de débordement horizontal).
- Le disclaimer est visible sans avoir à scroller.

---

## Prompt 6 — Finitions et déploiement Vercel

**Objectif :** une version publique, stable, accessible par URL.

**Tâches :**
1. Gestion d'erreurs : message clair si `/api/chat` échoue (clé API invalide, Supabase injoignable,
   timeout), pas d'écran blanc ni d'erreur brute affichée à l'utilisateur.
2. États de chargement propres (skeleton ou spinner pendant le premier chargement, pendant le streaming).
3. Vérifier `npm run build` en local sans erreur ni warning bloquant.
4. Nettoyer les routes/scripts de debug temporaires créés au prompt 1 (`/api/debug-db` etc.) si non désirés en prod.
5. Déploiement Vercel :
   - Connecter le repo GitHub au projet Vercel, **root directory = `web/`**.
   - Renseigner les 3 variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`) dans Vercel (Production +
     Preview).
   - Déployer, vérifier le build en ligne.
6. Test end-to-end sur l'URL Vercel : poser 2-3 questions différentes (paludisme, plaie, insomnie)
   et vérifier que les réponses sont cohérentes avec les données seedées.

**Critères d'acceptation :**
- URL Vercel publique fonctionnelle, chat opérationnel de bout en bout, sans clé API ni secret
  exposés côté client (vérifier dans l'onglet Network du navigateur qu'aucune clé n'apparaît).
