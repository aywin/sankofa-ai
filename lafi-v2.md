# LAFI — v2 : persona + interface

Le produit s'appelle "Lafi IA" (raison sociale, pitch), mais dans l'app le nom
affiché et prononcé par le persona est simplement **"Lafi"** — voir prompt 6.

## Ce qui ne va pas dans la v1 (ton constat, confirmé par la recherche)

- Le system prompt dit *"Tu es l'assistant de Lafi IA"* et parle de "documenter des usages" —
  c'est un vocabulaire de backend qui a fuité dans la voix du produit. Claude ne se
  présente jamais comme "l'assistant d'Anthropic" en conversation ; il **est** Claude.
  Lafi doit être traité pareil : ce n'est pas un chatbot posé sur une base de données,
  c'est un **tradipraticien virtuel** qui incarne le savoir agrégé.
- Le composer (textarea + bouton "Envoyer" à côté) est un pattern de formulaire web
  générique. Claude et ChatGPT utilisent tous les deux un conteneur unique en pilule
  où le bouton d'envoi est une icône circulaire *à l'intérieur* du champ, jamais un
  bouton rectangulaire posé à côté.
- La bannière de disclaimer en haut, en gras et en couleur alerte, donne le ton dès la
  première seconde — avant même que l'utilisateur ait vu ce que le produit sait faire.
  Les chatbots médicaux sérieux (Docus, Doctronic, Healer) gardent tous un disclaimer,
  mais aucun n'en fait l'élément le plus visible de l'écran d'accueil.
- Aucune option dans le composer aujourd'hui. Un sélecteur de modèle serait hors sujet
  (le produit n'a qu'un seul modèle) — mais il y a une vraie option pertinente qui
  dort dans le pitch : les **trois publics** déjà identifiés (grand public,
  tradipraticien, professionnel de santé) ne sont représentés nulle part dans l'UI.

## Décisions prises pour la v2 (ne pas remettre en question)

- **Pas de sidebar, pas de header lourd.** Le constat "on ne doit pas faire pour
  faire" reste la règle : chaque ajout d'interface doit augmenter l'intelligence,
  l'utilité ou l'effet "wow" perçu — pas remplir de l'espace pour ressembler à une
  app "complète".
- **Lafi ne se présente jamais comme un assistant.** Le persona parle en tradipraticien :
  il recommande, il explique une démarche, il conseille — il ne dit jamais "je suis
  une IA qui documente".
- **Le filet de sécurité reste entier sur le fond**, seulement sur la forme : la
  recherche confirme que tous les chatbots santé sérieux gardent un avertissement.
  On ne le supprime pas, on le fait parler avec la même voix que le reste du persona
  au lieu d'un bandeau d'alerte au ton juridique, et on le rend moins dominant
  visuellement.
- **Composer façon Claude/ChatGPT** : un seul conteneur en pilule, bouton d'envoi en
  icône circulaire intégré, pas de bouton externe.
- **Les "options" du composer ne sont pas un sélecteur de modèle** — c'est un
  sélecteur de profil (particulier / tradipraticien / professionnel de santé), et
  un bouton photo pour l'entrée multimodale (identification de plante, analyse
  visuelle d'une plaie/éruption). Les deux sont directement ancrés dans le pitch
  existant, pas inventés pour faire joli.
- Le nom "Lafi" vient du mooré (langue des Mossi, Burkina Faso) et veut dire
  "santé". Le persona s'appuie là-dessus — Lafi n'est pas un acronyme produit,
  c'est littéralement "santé" personnifiée. Slogan retenu : **"Se soigner
  naturellement et efficacement."**
- On ne dit jamais "Lafi, tradipraticien virtuel" dans l'UI ou dans les réponses.
  "Tradipraticien virtuel" est une direction interne pour calibrer le ton du system
  prompt (prompt 1) — ce que le produit affiche et ce que Lafi dit de lui-même,
  c'est juste **"Lafi"**. Pas de sur-explication de ce qu'il est.

---

## Prompt 1 — Refonte du system prompt : juste "Lafi"

**Objectif :** faire disparaître tout vocabulaire "assistant / plateforme / documente"
de la voix du produit, sans toucher au fond des garde-fous (toujours passer par les
outils, ne jamais inventer, toujours donner le niveau de preuve, toujours garder un
filet de sécurité pour les cas graves). Lafi ne se présente jamais comme "tradipraticien
virtuel" — ce terme est un guide interne pour calibrer le ton, pas une phrase à
prononcer. Dans l'UI et dans ses réponses, il n'est que "Lafi".

**Tâches :**
1. Réécrire le system prompt de `app/api/chat/route.ts` (actuellement `SYSTEM_PROMPT`) :
   - Supprimer "Tu es l'assistant de Lafi IA" et toute formulation à la troisième
     personne sur le produit.
   - Écrire à la place un persona en première personne, nommé Lafi : il *est* le
     savoir tradipraticien agrégé, pas un logiciel qui le restitue. Ton :
     chaleureux, assuré, direct — pas hésitant, pas bureaucratique. Si on lui
     demande qui il est, il répond "Lafi" et explique ce qu'il sait faire, sans se
     décrire comme un assistant, une IA ou un tradipraticien "virtuel" au sens
     littéral du mot.
   - Garder intactes les règles de fond (toujours `rechercher_par_symptome` avant de
     recommander, jamais inventer une plante/préparation hors résultats d'outil,
     toujours mentionner le niveau de preuve) — seule la formulation change, pas la
     logique de sécurité.
   - Remplacer le rappel médical final : au lieu d'une phrase figée de type
     disclaimer, l'intégrer comme un conseil naturel dans la voix du persona (ex :
     recommander de voir un soignant pour les cas graves comme le ferait un vrai
     tradipraticien expérimenté qui connaît ses limites — pas comme une clause
     juridique).
   - Interdire explicitement au modèle de se décrire comme "une IA", "un assistant"
     ou "une plateforme" dans ses réponses, même si l'utilisateur le demande
     directement — il peut expliquer ce qu'il est sans se dévaloriser en "outil".
2. Écrire 3 exemples de réponses avant/après dans un commentaire au-dessus du prompt,
   pour figer le ton (utile pour les futures itérations).

**Critères d'acceptation :**
- Demander "j'ai de la fièvre" ne produit plus aucune occurrence de "assistant",
  "documente", "plateforme" dans la réponse.
- Le niveau de preuve et le rappel de sécurité sont toujours présents à chaque
  réponse pertinente, juste formulés différemment.
- Demander "qui es-tu ?" ne fait pas dire à Lafi qu'il est un assistant ou une IA
  générique — il se présente comme un tradipraticien virtuel.

---

## Prompt 2 — Composer façon Claude/ChatGPT

**Objectif :** remplacer le textarea + bouton actuel par un conteneur unique en
pilule, avec le bouton d'envoi intégré, conforme aux conventions actuelles des
grands chatbots (recherché : Claude traite le composer comme un espace de travail
minimaliste, ChatGPT comme une surface de contrôle — on se rapproche du premier,
plus sobre, plus adapté à un produit avec un seul modèle).

**Tâches :**
1. Refondre `components/chat/ChatInput.tsx` :
   - Un seul conteneur `rounded-full` (ou `rounded-3xl` si le texte dépasse une
     ligne) qui contient : icône "+" à gauche (pour la photo, voir prompt 4),
     textarea au centre (auto-resize, sans bordure visible propre, la bordure est
     celle du conteneur), icône micro, bouton d'envoi en cercle plein à droite
     (flèche vers le haut, style Claude/ChatGPT).
   - Le bouton d'envoi change d'état visuellement (icône stop/carré) pendant le
     streaming, avec possibilité d'interrompre (`stop()` de `useChat`).
   - Aucun bouton "Envoyer" texte à l'extérieur du conteneur.
2. Ajouter l'entrée vocale : bouton micro qui utilise l'API Web Speech
   (`webkitSpeechRecognition`/`SpeechRecognition`) pour dicter en français,
   avec repli silencieux (icône désactivée) si le navigateur ne supporte pas l'API.
   C'est directement lié à la mission d'accessibilité du pitch (populations peu
   alphabétisées) — pas un gadget.
3. Repositionner/alléger le bandeau de sécurité : le sortir du haut de l'écran,
   le rendre discret (texte petit, gris, sous le composer par exemple), sans le
   supprimer.

**Critères d'acceptation :**
- Visuellement comparable à un screenshot de Claude.ai ou ChatGPT : un seul
  conteneur, bouton d'envoi circulaire intégré.
- Le micro fonctionne dans Chrome desktop (support Web Speech le plus fiable) et
  se désactive proprement ailleurs sans erreur console.
- Le disclaimer est toujours visible mais ne domine plus l'écran d'accueil.

---

## Prompt 3 — Sélecteur de profil (pas un sélecteur de modèle)

**Objectif :** donner un contrôle utile dans le composer, ancré dans les trois
publics déjà identifiés dans le pitch, sans jamais parler de "modèle".

**Tâches :**
1. Ajouter un petit sélecteur (3 chips, ex. juste au-dessus du composer) :
   "Particulier" / "Tradipraticien" / "Professionnel de santé". Persisté en
   `localStorage`, "Particulier" par défaut.
2. Le profil sélectionné est transmis au serveur (dans le body de la requête
   `/api/chat`, en dehors des `messages`) et injecté dans le system prompt :
   - Particulier : langage simple, pas de jargon, plus pédagogique.
   - Tradipraticien : suppose déjà la connaissance de base, va plus vite sur les
     explications, peut être plus technique sur les dosages/préparations.
   - Professionnel de santé : mentionne explicitement les interactions/contre-
     indications connues, ton clinique, vocabulaire médical assumé.
3. Le changement de profil doit être visible mais discret (pas un gros menu
   déroulant) — cohérent avec "pas de chrome pour faire du chrome".

**Critères d'acceptation :**
- Poser la même question dans les 3 profils produit 3 formulations sensiblement
  différentes (vérifiable manuellement en comparant les réponses).
- Le profil persiste après un refresh de page.

---

## Prompt 4 — Entrée multimodale : photo de plante ou de peau

**Objectif :** exploiter la capacité vision de Gemini pour une fonctionnalité
directement utile et différenciante (confirmé par la recherche : les apps
d'identification de plantes et de diagnostic dermatologique par photo sont un
pattern établi et apprécié) — pas un gadget d'upload de fichier générique.

**Tâches :**
1. Bouton "+" du composer (prompt 2) ouvre un choix : "Photo d'une plante à
   identifier" / "Photo d'une peau ou d'une plaie". Utilise l'input natif
   `<input type="file" accept="image/*" capture="environment">` pour ouvrir
   directement l'appareil photo sur mobile.
2. L'image est envoyée comme `file` part dans le message (`UIMessage` supporte les
   parts de type `file` — voir la doc AI SDK sur les prompts multimodaux). Le
   modèle `gemini-3.5-flash` reçoit l'image directement dans le message, sans
   outil dédié : il peut décrire ce qu'il voit et, si pertinent, appeler
   `rechercher_par_symptome` avec sa propre description textuelle de l'image pour
   croiser avec la base.
3. Afficher une miniature de l'image envoyée dans la bulle utilisateur.
4. Le system prompt (prompt 1) doit préciser : pour une photo de plante inconnue,
   proposer une identification prudente (jamais catégorique si incertain) puis
   chercher dans la base si le nom identifié y figure ; pour une photo de peau,
   décrire ce qui est visible et orienter vers `rechercher_par_symptome`, sans
   poser de diagnostic dermatologique ferme.

**Critères d'acceptation :**
- Envoyer une photo d'une plante connue de la base (ex. une feuille de moringa)
  déclenche une identification puis une recherche pertinente dans `usages`.
- Envoyer une photo sans rapport (ex. un objet quelconque) ne fait pas planter le
  flux : Lafi explique simplement qu'il ne peut pas aider sur ce type d'image.

---

## Prompt 5 — Réponses visuelles : cartes de plantes + raisonnement visible

**Objectif :** remplacer le mur de markdown par des cartes structurées, et rendre
visible la boucle agentique (le vrai différenciateur du produit) pendant qu'elle
tourne, au lieu d'un simple spinner texte générique.

**Tâches :**
1. Créer `components/chat/PlantCard.tsx` : une carte compacte par plante
   recommandée (icône feuille, nom local + nom scientifique en italique, badge de
   niveau de preuve coloré — ex. vert plein pour "les_deux", vert clair pour
   "traditionnel" — préparation, posologie, précautions repliables). Le texte du
   modèle continue d'exister pour l'introduction/synthèse, mais les
   recommandations structurées passent par ces cartes plutôt que par des listes
   markdown.
   - Nécessite d'adapter la sortie de l'outil `rechercher_par_symptome` et/ou
     d'utiliser `Output`/structured output d'AI SDK pour que le modèle retourne
     une liste de recommandations structurées en plus du texte libre, ou de
     parser les résultats de l'outil directement côté client (déjà disponibles
     dans `part.output` du tool call) pour construire les cartes sans dépendre du
     markdown généré par le modèle.
2. Remplacer l'indicateur "Recherche dans la base de plantes…" par une
   visualisation en étapes qui reflète l'état réel du tool call en cours :
   "Consultation du savoir traditionnel…" pendant `input-streaming`/
   `input-available`, puis "X plantes trouvées" une fois `output-available`. Si
   plusieurs appels d'outils s'enchaînent (boucle agentique), afficher chaque
   étape successivement plutôt qu'un seul message figé.
3. Garder `SourcesBadge` mais le rendre redondant avec les cartes (ou le retirer si
   les cartes rendent l'info suffisamment visible).

**Critères d'acceptation :**
- Une réponse avec plusieurs plantes affiche plusieurs cartes distinctes, pas un
  bloc de texte markdown continu.
- Pendant qu'un tool call est en cours, l'utilisateur voit une étape nommée et
  spécifique, pas un texte générique statique.

---

## Prompt 6 — Identité visuelle et micro-interactions ("wow" final)

**Objectif :** sortir de la palette emerald/neutral par défaut de Tailwind et
donner à Lafi une identité qui ne ressemble pas à un starter template.

**Tâches :**
1. Définir une palette custom dans `globals.css` (Tailwind v4, `@theme`) : tons
   terre/sable + un vert plus spécifique (pas l'emerald par défaut), inspirée du
   Sahel plutôt que d'un vert "santé" générique. Vérifier le contraste en clair ET
   sombre (WCAG AA minimum sur le texte).
2. Remplacer "Lafi IA" par "Lafi" partout dans l'UI (header, titre de page,
   métadonnées) — plus jamais le suffixe "IA". À côté du nom, afficher le slogan
   **"Se soigner naturellement et efficacement."** en sous-titre discret sur
   l'écran d'accueil (pas répété sur chaque écran, juste à l'état vide).
3. Remplacer le titre texte par un petit monogramme/motif simple en SVG inline
   (pas une image externe) — quelque chose qui évoque une feuille ou un motif
   ouest-africain discret, pas un logo générique de chatbot.
4. Micro-animations : apparition douce des messages (fade + slight translate),
   pulsation du badge "étape en cours" (prompt 5), transition douce à l'ouverture
   d'une carte plante repliable.
5. Favicon cohérent avec le monogramme, titre d'onglet propre ("Lafi" plutôt que
   "Lafi IA").

**Critères d'acceptation :**
- Capture d'écran comparée à la v1 : la différence de personnalité visuelle doit
  être immédiatement perceptible, sans sacrifier la lisibilité ni la légèreté de
  la page (pas de librairie d'animation lourde).

---

## Retour après premier test live (ajouts post-prompt 6)

Trois retours après avoir testé la v2 en conditions réelles :

1. **Le texte était devenu trop court.** Le prompt 5 (cartes de plantes)
   demandait au modèle de ne pas réénumérer les détails déjà affichés dans les
   cartes — mais la formulation initiale le bridait trop ("courte synthèse").
   Corrigé dans le system prompt : Lafi reste totalement libre de sa réponse
   (expliquer, comparer, développer), les cartes ne sont qu'un complément
   visuel, pas une contrainte sur le texte. Ce n'est pas une interface de
   recherche, c'est une conversation.
2. **"Cliquer un mot-clé pour plus de détails"** — clarifié : pas de mécanisme
   hardcodé (pas de lien systématique nom-de-plante → carte). L'intelligence
   doit venir du modèle lui-même : la conversation libre (point 1) et la
   boucle d'outils déjà en place suffisent à ce que Lafi développe quand on le
   lui demande.
3. **Historique de conversations, comme Claude/ChatGPT** — nouvelle
   fonctionnalité (pas dans le plan initial) :
   - Panel latéral (icône historique dans le header) : nouvelle conversation,
     liste des conversations passées, suppression. Fermé par défaut, pas de
     chrome permanent.
   - Mode invité : historique dans le `localStorage` du navigateur (comme
     avant, rien ne change si on ne se connecte pas).
   - Compte optionnel (email + mot de passe, via Supabase Auth) : une fois
     connecté, l'historique passe en base (table `conversations`, RLS scoped
     par `user_id` — voir `supabase/schema_users.sql`), synchronisé entre
     appareils. L'historique invité existant est migré automatiquement vers
     le compte à la première connexion.
   - Nouvelle variable d'env requise : `NEXT_PUBLIC_SUPABASE_ANON_KEY` (clé
     anon, utilisée uniquement pour l'auth et cette table — jamais pour
     maladies/plantes/usages, qui restent access service-role uniquement).
