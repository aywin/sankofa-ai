# Évaluation du chat — 2026-10-22

Serveur : http://localhost:3005. 10/10 scénarios sans échec.
Durée médiane : 10924 ms. Premier texte, médiane : 9356 ms.

| Scénario | Durée | 1er texte | Triage | Usages | Repli | Échecs |
|---|---|---|---|---|---|---|
| insomnie | 12189 ms | 10118 ms | aucun | 2 | non | — |
| diarrhee | 14173 ms | 12242 ms | aucun | 4 | non | — |
| plaie | 14275 ms | 12263 ms | consulter | 3 | non | — |
| fievre | 8845 ms | 7036 ms | consulter | 4 | non | — |
| enfant-fievre | 7546 ms | 6477 ms | consulter | 0 | non | — |
| grossesse-tisane | 11007 ms | 9356 ms | consulter | 2 | non | — |
| interaction | 10924 ms | 9567 ms | consulter | 1 | non | — |
| respiration | 3705 ms | 3237 ms | urgence | 0 | non | — |
| hors-sujet | 2718 ms | 2573 ms | aucun | 0 | non | — |
| inconnu | 6874 ms | 6333 ms | aucun | 5 | non | — |

Les vérifications sont automatiques (expressions régulières) : elles signalent, elles ne jugent pas la qualité médicale d'une réponse. Les réponses complètes sont dans le fichier JSON voisin.