# Comptes utilisateurs

## Modèle

- **Tout compte peut chercher des remèdes** (chat, plantes, achats), sans statut particulier.
- **Le statut tradipraticien sert à vendre.** On l'obtient de deux façons :
  - en cochant « Je suis tradipraticien » à l'inscription ;
  - plus tard, avec « Activer le statut tradipraticien » dans `/moi`.

  Il reste `declare` tant que l'équipe ne l'a pas vérifié. **Il ne se retire pas.**

À l'inscription, le nom (et `profil: "tradipraticien"` si la case est cochée) part dans `user_metadata`. Le trigger `profil_creer_pour_nouvel_utilisateur` ([0002_comptes.sql](../supabase/migrations/0002_comptes.sql)) crée le profil et, si besoin, le statut, dans la même transaction que le compte.

## Mon espace

On y accède en cliquant sur son profil : l'initiale dans l'en-tête du site, ou « Mon compte » en bas de la barre du chat. L'espace a un en-tête (avatar, nom, e-mail, mention « Tradipraticien ») et des onglets :

| Onglet | Contenu |
|---|---|
| **Informations personnelles** (`/moi`) | Nom, changement d'e-mail (confirmé par lien), mot de passe, déconnexion, suppression du compte. |
| **Ma boutique** (`/moi/boutique`) | Sans statut tradipraticien : bouton « Activer le statut tradipraticien ». Avec le statut mais sans boutique : état vide et « Créer ma boutique ». Dans ces deux cas, les produits déjà disponibles sur Lafi s'affichent en dessous. Avec une boutique : produits (ajout, modification, masquage, suppression), commandes, réglages, lien à partager. |
| **Mes plantes** (`/moi/plantes`) | Plantes gardées depuis le chat ou les fiches. |
| **Administration** (`/admin/ventes`) | Pour les admins seulement : reversements et modération. |

Un **produit** a : un nom, une description, une photo (facultative), un prix, un prix réduit (facultatif, le prix d'origine s'affiche alors barré, et c'est le prix réduit qui est payé), une ville (celle de la boutique par défaut), une plante d'origine (choisie dans les fiches Lafi ou écrite librement) et un stock (facultatif).

La fenêtre de connexion (en-tête, chat, espace) propose la connexion, l'inscription avec la case « Je suis tradipraticien », le mot de passe oublié (qui renvoie sur `/moi/mot-de-passe`) et l'écran « vérifie ta boîte mail ». Les erreurs Supabase sont traduites en français (`lib/auth.ts`).

**Suppression du compte** : la fonction `supprimer_mon_compte()` efface le compte, le profil, les rôles, les conversations et les favoris. Elle ferme aussi une boutique qui n'a jamais rien vendu. Si la boutique a des ventes payées, la suppression est refusée : les reversements doivent être soldés avec l'équipe. Les photos de produits restent dans Storage, et un nettoyage manuel est possible.

## Réglages à faire dans Supabase

1. **Migrations** : exécute `0001_boutique.sql`, puis `0002_comptes.sql` (SQL Editor). Les deux comptes existants reçoivent un profil sans statut tradipraticien.

2. **Confirmation par e-mail**. Elle est aujourd'hui **activée** (vérifié le 22/10/2026 : `mailer_autoconfirm = false`). Pour la désactiver : Authentication > Sign In / Providers > Email > décocher **Confirm email**.
   - Désactivée : l'inscription connecte directement, et un tradipraticien arrive sur sa boutique.
   - Activée : la fenêtre affiche « vérifie ta boîte mail », avec un bouton pour renvoyer le lien.

   Le code gère les deux cas, il n'y a rien à changer côté site. Désactiver la confirmation rend l'inscription plus simple, mais permet aussi de s'inscrire avec l'e-mail de quelqu'un d'autre. Le changement d'e-mail et le mot de passe oublié passent toujours par un lien.

3. **Adresses de redirection** (Authentication > URL Configuration) :
   - Site URL : l'adresse de production ;
   - Redirect URLs : `https://<domaine>/moi`, `https://<domaine>/moi/boutique` et `https://<domaine>/moi/mot-de-passe`, plus les mêmes en `http://localhost:3000` pour le développement.

   Sans cette liste, les liens de confirmation et de réinitialisation renvoient vers la page d'accueil.

4. **E-mails en français** (Authentication > Email Templates) : les modèles « Confirm signup », « Reset password » et « Change email address » sont en anglais par défaut. Ils sont à traduire.

5. **Envoi des e-mails** : l'expéditeur intégré de Supabase est limité à quelques e-mails par heure. Si la confirmation reste activée en production, il faut configurer un SMTP (Authentication > SMTP Settings), par exemple Brevo ou Resend.
