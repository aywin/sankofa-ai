# Lafi — Web (Next.js)

Chat IA branché sur une base Supabase de plantes médicinales / maladies. Voir
`../lafi-v1.md` (build initial) et `../lafi-v2.md` (persona, interface,
comptes) à la racine du repo pour le détail des étapes.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Supabase (Postgres + pgvector) pour les données plantes/maladies (accès
  service role, serveur uniquement) et pour les comptes + l'historique de
  conversations (Supabase Auth + table `conversations`, accès anon + RLS,
  depuis le navigateur)
- Gemini (`gemini-3.5-flash` + `gemini-embedding-001`) via le Vercel AI SDK

## Installation locale

```bash
npm install
cp .env.local.example .env.local
# remplir NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
# NEXT_PUBLIC_SUPABASE_ANON_KEY, GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

Le schéma et les données de seed sont dans `../supabase/schema.sql` et
`../supabase/seed.sql` (plantes/maladies/usages), et `../supabase/schema_users.sql`
(comptes + historique) — à exécuter dans le SQL Editor de Supabase avant de
démarrer l'app. L'auth email/mot de passe doit être activée dans le projet
Supabase (Authentication > Providers > Email, activée par défaut).

## Vérifier la connexion à la base

```bash
curl http://localhost:3000/api/health
```

Doit répondre `{ "status": "ok", "database": "connected", "maladies_count": 8 }`.

## Déploiement

Vercel, avec `web/` comme root directory du projet. Voir prompt 6 de `../lafi-v1.md`.
