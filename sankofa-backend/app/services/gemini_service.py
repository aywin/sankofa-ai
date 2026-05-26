from app.config import gemini
import json
import re


PROMPT_EXTRACTION = """
Tu es un assistant médical spécialisé en médecine traditionnelle africaine.
Analyse le texte suivant et extrais les informations médicales pertinentes.

Texte : "{texte}"

Réponds UNIQUEMENT en JSON valide, sans markdown, sans explications :
{{
  "maladie": "nom de la maladie détectée ou null",
  "symptomes": ["liste", "des", "symptômes", "mentionnés"],
  "contexte": "adulte | enfant | femme_enceinte | inconnu",
  "urgence": "faible | modérée | élevée"
}}

Maladies connues dans notre base : Paludisme, Diarrhée, Fièvre typhoïde, Hypertension, Diabète.
Si la maladie mentionnée correspond à l'une de ces maladies (même avec un autre nom), utilise le nom exact de notre base.
"""


async def extraire_entites(texte: str) -> dict:
    try:
        prompt = PROMPT_EXTRACTION.format(texte=texte)
        response = gemini.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"```json|```", "", raw).strip()
        return json.loads(raw)
    except Exception as e:
        return {
            "maladie": None,
            "symptomes": [],
            "contexte": "inconnu",
            "urgence": "faible"
        }


MESSAGES_PROFIL = {
    "patient": "Voici les plantes documentées qui correspondent à votre situation. Ces informations sont un support de connaissance — consultez un professionnel de santé pour tout traitement.",
    "tradipraticien": "Résultats croisés avec les bases scientifiques et les témoignages terrain. Score de confiance calculé sur la convergence des sources.",
    "chercheur": "Données issues du croisement Knowledge Graph + bases moléculaires (ANPDB, ChEMBL). Voir détail moléculaire pour chaque plante."
}

AVERTISSEMENT = "Sankofa AI est un outil d'information et de préservation du patrimoine. Il ne remplace pas un diagnostic médical ni l'avis d'un professionnel de santé."
