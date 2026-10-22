# Boutiques des tradipraticiens — fonctionnement et mise en route

## Ce que ça fait

- **Un tradipraticien** ouvre sa boutique depuis `/moi/boutique` (connexion requise). Il peut ensuite :
  - ajouter, modifier, masquer ou supprimer des produits (nom, prix en FCFA, description, photo, stock facultatif, plantes utilisées) ;
  - copier ou partager sur WhatsApp le lien de sa boutique, `/b/<adresse>` ;
  - suivre ses commandes payées, marquer « remise », et voir ce que Lafi doit lui reverser.
- **Un acheteur**, sans compte :
  - ouvre le lien, remplit son panier et donne son nom, son téléphone et son e-mail ;
  - paie sur la page de paiement SasPay (choix d'Orange Money, Moov…) ;
  - revient sur une page de suivi qui se met à jour toute seule.
- **L'équipe Lafi**, sur `/admin/ventes` :
  - voit les reversements à faire, regroupés par boutique, avec le numéro mobile money du vendeur ;
  - fait le reversement dans le tableau de bord SasPay, puis enregistre sa référence ;
  - traite les signalements, et retire ou rétablit des produits.

## Décisions (22/10/2026)

| Sujet | Décision | Où c'est appliqué |
|---|---|---|
| Flux d'argent | Lafi encaisse (un seul compte marchand SasPay) et reverse **à la main** | `commande.reversement_statut`, `/admin/ventes` |
| Commission | 0 % pendant le pilote, taux stocké par commande | `commande.commission_taux` |
| Publication | Immédiate ; modération a posteriori (signalements, retrait) | `produit.statut`, trigger `produit_proteger_moderation` |
| Frais SasPay | À la charge du vendeur (`DEDUCTED`) : l'acheteur paie le prix affiché | `lib/saspay.ts` |
| Allégations | « guérit », « miracle », « 100 % », « garanti », « sans danger », « remplace le traitement », maladies graves : refusées | `texte_sans_allegation` (SQL) et `lib/allegations.ts` |

Pourquoi les reversements sont manuels : `POST /payouts/initialize/` exige une IP serveur autorisée chez SasPay, et Vercel n'a pas d'IP fixe sans option payante. Pour automatiser plus tard, il faudra une IP fixe, puis un appel de payout dans `/admin/ventes` avec une `Idempotency-Key`.

## Sécurité du paiement

- La clé SasPay reste **côté serveur** (`lib/saspay.ts`). Elle n'est jamais journalisée.
- Une commande n'est **payée** que lorsque `GET /payments/{id}/verify/` renvoie `SUCCESS`. Le corps d'un webhook ne sert qu'à savoir quelle commande revérifier.
- La confirmation passe par la fonction SQL `commande_confirmer_paiement`. Elle est atomique et idempotente : la page de retour et le webhook peuvent arriver en même temps sans double confirmation ni double baisse de stock.
- Les prix sont toujours relus en base au moment de la commande, jamais pris dans le navigateur.
- Webhook : signature HMAC vérifiée sur le corps brut, horodatage refusé au-delà de 300 s, comparaison en temps constant. Tous les webhooks reçus sont journalisés dans `saspay_evenement`.
- Une **clé live est refusée hors production**, sauf si `SASPAY_AUTORISER_LIVE_HORS_PROD=1`.
- L'acheteur suit sa commande grâce à un jeton aléatoire dans l'URL. L'identifiant de commande seul ne donne pas accès.
- Le numéro de reversement d'une boutique n'est servi par aucune route publique.

## Mise en route — à faire de ton côté

1. **Base de données.** Exécute [supabase/migrations/0001_boutique.sql](../supabase/migrations/0001_boutique.sql) dans Supabase (SQL Editor). Il crée aussi le bucket Storage `produits`.
2. **Compte admin.** Exécute la requête en fin de migration avec l'e-mail du compte qui gère les reversements et la modération.
3. **Clé de test.** Dans `web/.env.local`, remplace la clé `sk_live_…` actuelle par une clé `sk_test_…` (tableau de bord SasPay, section Développeur). La clé live ne doit être que dans les variables d'environnement Vercel de production.
4. **Webhook.** Dans le tableau de bord SasPay (Webhooks), crée un point de réception vers `https://<ton-domaine>/api/saspay/webhook`, abonné à `transaction.success` et `transaction.failed`. Le **secret de signature ne s'affiche qu'une fois** : copie-le dans `SASPAY_WEBHOOK_SECRET` (Vercel et `.env.local`).
5. **Adresse du site.** Renseigne `NEXT_PUBLIC_SITE_URL` en production (ex. `https://lafi.bf`). Elle sert à construire l'URL de retour après paiement.
6. **Test de bout en bout**, avec la clé de test :
   1. crée une boutique et un produit ;
   2. achète-le depuis le lien partagé ;
   3. paie sur la page SasPay de test ;
   4. vérifie que la commande passe à « Paiement reçu » et apparaît dans `/admin/ventes` ;
   5. enregistre un reversement fictif.

Vérification hors ligne (sans SasPay ni base) : `npx tsx scripts/check-boutique.ts`, depuis `web/`.

## Limites connues

- **E-mail obligatoire pour l'acheteur** : c'est le champ `customer_email` du paiement hébergé SasPay. Pour s'en passer, il faudrait le paiement direct (`/payments/softpay/`), qui demande de gérer le code USSD préalable d'Orange Money Burkina.
- **Une boutique par compte.**
- Pas d'annulation ni de remboursement depuis Lafi : la doc SasPay ne décrit pas de remboursement. Un litige se règle avec le vendeur et dans le tableau de bord SasPay.
- La boutique n'apparaît pas sur les fiches plantes. Leur règle historique (`taxon.habitat_region` : « jamais d'annuaire, jamais de CTA ») est conservée : c'est la boutique qui renvoie vers les fiches, jamais l'inverse.
- **Responsabilité légale** : Lafi encaisse pour le compte de tiers qui vendent des préparations de santé. Avant d'ouvrir au public, il faudra des conditions de vente pour vendeurs et acheteurs, et vérifier le cadre burkinabè applicable à la vente de produits de pharmacopée traditionnelle.
