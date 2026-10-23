# Lafi — lot B révisé au 23 octobre 2026

Les 11 CSV sont encodés en UTF-8, séparés par des points-virgules. Le schéma figure dans schema.json et le contrôle reproductible dans verifier.py. structures.csv et remedes_non_vegetaux.csv conservent leurs en-têtes : ils relèvent du lot A.

## Corrections de format

Ajout de nom_dans_lafi et synonymes dans taxons ; ambigu, acces_source et localisation_source dans noms_vernaculaires et usages ; pays dans produits_homologues ; source dans indications. Les noms scientifiques acceptés sont conservés avec leur correspondance Lafi. Les codes contrôlés sont sans accent ; les libellés français des maux conservent exactement accents et casse de la liste fermée, dont Paludisme et Hypertension.

Les champs de sécurité inconnus portent non_documente. Les preuves absentes portent aucune_etude. Une absence de documentation n’est pas codée comme une innocuité démontrée. Les champs descriptifs hors sécurité peuvent rester vides lorsque la donnée manque.

Affections du foie a été supprimé des CSV importables : une indication, un usage et une étude. Aucun rattachement à Ictère et hépatite n’a été fait. retraits_v1.json conserve uniquement une trace historique non importable.

## Vagues complémentaires et couverture

| Mal | Usages retenus | Origine documentaire |
|---|---:|---|
| Règles douloureuses | 1 | Mali, Prélude / référence HA 11 |
| Anémie | 1 | Côte d’Ivoire, N’Guessan et al. 2010 |
| Infections urinaires | 4 | Burkina Faso, Kam et al. 2020 |
| Diabète | 3 | Mali, Dembélé et al. 2026 ; Ghana, Asafo-Agyei et al. 2023 |
| Drépanocytose | 1 | Mali, Cissé et al. 2022 |

Le corpus compte 15 taxons, 25 noms vernaculaires, 20 usages et 8 études. Il s’agit d’une couverture documentaire partielle, pas d’une validation thérapeutique.

La ligne Règles douloureuses concerne une association de plusieurs plantes avec Trichilia emetica, et non une recette de cette plante seule. Le texte original de 1981 n’a pas été ouvert ; l’accès secondaire par Prélude est indiqué. Les deux lignes Cassia sieberiana pour Diabète et Hypertension décrivent une indication conjointe dans la source, signalée par ambigu=oui. Pour Momordica charantia, le tableau décrit des fruits broyés et une décoction bue ; le protocole détaillé n’est pas précisé. Aucun dosage n’a été inventé.

Les études antioxydantes et anti-inflammatoires de Zanthoxylum ne sont pas présentées comme des essais cliniques ou antifalciformants. Les preuves sur d’autres extraits ne valident pas automatiquement la préparation traditionnelle recensée. Les noms locaux ne sont pas attribués à une langue lorsque la source ne la précise pas.

## Doublons et vérification

La clé de contrôle est plante + partie + mode de préparation + indication. Trois groupes ont été fusionnés : Terminalia leiocarpa / Paludisme, Mitragyna inermis / Rhumatismes, Sclerocarya birrea / Infections urinaires. Les voies multiples restent détaillées dans la description ; voie=autre les regroupe sans perte de provenance. Il reste zéro doublon selon cette clé. Voir doublons_usages.json.

Le contrôle vérifie les en-têtes, codes autorisés, indications fermées, rattachements aux taxons, sources, champs de sécurité et de preuve et la couverture des cinq maux demandés. Les résultats détaillés figurent dans controle.json. La vérification porte sur les CSV importables ; a_verifier_non_import.csv et retraits_v1.json sont des annexes exclues de l’import.

Les régions historiques des enquêtes sont conservées sans inférer leur correspondance administrative actuelle. Les prix, conservation, présence régionale et données nationales insuffisamment établis restent incomplets. Aucune vérification croisée du lot A n’a été effectuée.

## Sources des nouvelles vagues

- Kam et al. 2020 : https://www.ijsr.net/archive/v9i5/SR20506024028.pdf
- Dembélé et al. 2026 : https://academicjournals.org/journal/SRE/article-full-text-pdf/C36567A74207
- N’Guessan et al. 2010 : https://www.aensiweb.com/old/jasr/jasr/2010/1291-1297.pdf
- Cissé et al. 2022 : https://www.jddtonline.info/index.php/jddt/article/download/5745/5049
- Prélude, Trichilia : https://www.ethnopharmacologia.org/recherche-dans-prelude/?plant_id=5978
- Sanogo 2011 : https://www.athmsi.org/journals/index.php/ajtcam/article/view/1320
- Asafo-Agyei et al. 2023 : https://ugspace.ug.edu.gh/server/api/core/bitstreams/42f02515-6d6a-475c-9483-544473f72b3c/content
- Toxicologie Cassia, revue 2019 : https://www.gssrr.org/JournalOfBasicAndApplied/article/download/10147/5422/30704
- Autres références et localisations précises : champs source(s), sources_tradition et localisation_source des CSV.
