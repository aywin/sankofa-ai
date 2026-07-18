# Lafi IA — Web (Next.js)

Chat IA branché sur une base Supabase de plantes médicinales / maladies. Voir
`../lafi-v1.md` à la racine du repo pour le détail des étapes de build.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Supabase (Postgres + pgvector) — accès serveur uniquement (service role key)
- Gemini (`gemini-2.5-flash` + `text-embedding-004`) via le Vercel AI SDK

## Installation locale

```bash
npm install
cp .env.local.example .env.local
# remplir NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

Le schéma et les données de seed sont dans `../supabase/schema.sql` et
`../supabase/seed.sql` — à exécuter dans le SQL Editor de Supabase avant de démarrer l'app.

## Vérifier la connexion à la base

```bash
curl http://localhost:3000/api/health
```

Doit répondre `{ "status": "ok", "database": "connected", "maladies_count": 8 }`.

## Déploiement

Vercel, avec `web/` comme root directory du projet. Voir prompt 6 de `../lafi-v1.md`.
