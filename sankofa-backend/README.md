# Sankofa AI — Backend

## Stack
- FastAPI + Uvicorn
- Supabase (PostgreSQL)
- Gemini 2.5 Flash (extraction d'entités)
- Déployé sur Render

## Installation locale

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Remplir les variables dans .env
uvicorn main:app --reload
```

## Variables d'environnement

| Variable | Description |
|---|---|
| SUPABASE_URL | URL de ton projet Supabase |
| SUPABASE_KEY | Clé anon publique Supabase |
| GEMINI_API_KEY | Clé API Google AI Studio |

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| POST | /api/recherche | Recherche par symptômes ou maladie |
| GET | /api/plantes | Liste toutes les plantes |
| GET | /api/plantes/{id} | Détail d'une plante + molécules |
| GET | /api/maladies | Liste toutes les maladies |
| GET | /health | Vérification de l'état de l'API |

## Déploiement Render

1. Push sur GitHub
2. Créer un Web Service sur Render
3. Connecter le repo
4. Ajouter les variables d'environnement
5. Deploy

## Exemple de requête

```bash
curl -X POST https://ton-backend.onrender.com/api/recherche \
  -H "Content-Type: application/json" \
  -d '{"texte": "fièvre et frissons depuis 2 jours", "profil": "patient"}'
```
