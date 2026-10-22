import crypto from "crypto";

// Client SasPay — serveur uniquement (la clé donne accès au compte marchand
// entier : encaissements, retraits, solde). Ne jamais importer ce fichier
// dans un composant "use client".
//
// Source de vérité : https://docs.saspay.me/api-reference/openapi.json.
// Seuls les endpoints et champs de la spécification sont utilisés ici :
//   POST /checkout-sessions/                 créer un paiement hébergé
//   GET  /checkout-sessions/{id}/status/     session -> transaction_id
//   GET  /payments/{payment_id}/verify/      état réel, fait foi
// Le checkout hébergé gère lui-même le code USSD préalable qu'exige Orange
// Money Burkina : rien à collecter de notre côté.

const BASE_URL = process.env.SASPAY_API_URL ?? "https://api.saspay.me/api/v1";
const TIMEOUT_MS = 20_000;

export class SasPayErreur extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null
  ) {
    super(message);
    this.name = "SasPayErreur";
  }
}

function cle(): string {
  // .env.local historique : "SAS_PAY_API_KEY =..." — on tolère l'espace.
  const valeur = process.env.SAS_PAY_API_KEY?.trim();
  if (!valeur) throw new SasPayErreur("SAS_PAY_API_KEY n'est pas définie.", 500, "configuration");
  // Une clé live débite de vrais comptes : hors production, il faut le
  // vouloir explicitement (doc SasPay : sk_test_ en développement).
  if (
    valeur.startsWith("sk_live_") &&
    process.env.NODE_ENV !== "production" &&
    process.env.SASPAY_AUTORISER_LIVE_HORS_PROD !== "1"
  ) {
    throw new SasPayErreur(
      "Clé SasPay de production utilisée hors production : utilise une clé sk_test_ en développement.",
      500,
      "configuration"
    );
  }
  return valeur;
}

async function appel<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${chemin}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cle()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  const texte = await res.text();
  let corps: unknown = null;
  try {
    corps = texte ? JSON.parse(texte) : null;
  } catch {
    // corps non JSON : traité comme une erreur ci-dessous
  }

  // Enveloppe documentée : { success, data, code } ou { success: false,
  // error: { message, code } }. Les exemples de la spécification montrent
  // aussi l'objet nu : on accepte les deux formes.
  const enveloppe = corps as { success?: boolean; data?: unknown; error?: { message?: string; code?: string } } | null;
  if (!res.ok || enveloppe?.success === false) {
    const erreur = enveloppe?.error ?? (corps as { message?: string; code?: string } | null);
    const message =
      res.status === 429
        ? "SasPay limite le nombre de requêtes : réessaie dans un instant."
        : (erreur?.message ?? `Erreur SasPay (HTTP ${res.status}).`);
    // Jamais la clé ni le corps complet dans les journaux.
    console.error(JSON.stringify({ scope: "saspay", chemin, status: res.status, code: erreur?.code ?? null }));
    throw new SasPayErreur(message, res.status, erreur?.code ?? null);
  }
  return (enveloppe && "data" in enveloppe && enveloppe.success !== undefined ? enveloppe.data : corps) as T;
}

// Montants : chaînes décimales, jamais de flottants (doc SasPay).
export function montantSasPay(fcfa: number): string {
  if (!Number.isInteger(fcfa) || fcfa <= 0) throw new Error(`Montant invalide : ${fcfa}`);
  return `${fcfa}.00`;
}

export interface SessionCheckout {
  id: string;
  checkout_url: string;
  status: string;
}

export function creerSessionCheckout(params: {
  montantFcfa: number;
  description: string;
  client: { nom: string; email: string; telephone: string };
  returnUrl: string;
  metadata: Record<string, string>;
}): Promise<SessionCheckout> {
  // POST /checkout-sessions/ ne prend pas d'Idempotency-Key (doc) : un
  // double envoi crée deux sessions, sans débit tant qu'aucune n'est payée.
  // Le formulaire est désactivé pendant l'envoi pour l'éviter.
  return appel<SessionCheckout>("/checkout-sessions/", {
    method: "POST",
    body: JSON.stringify({
      amount: montantSasPay(params.montantFcfa),
      currency: "XOF",
      country: "BF",
      description: params.description,
      customer_name: params.client.nom,
      customer_email: params.client.email,
      customer_phone: params.client.telephone,
      return_url: params.returnUrl,
      metadata: params.metadata,
      // Décision du 22/10 : frais à la charge du vendeur.
      fee_charge_mode: "DEDUCTED",
    }),
  });
}

export interface StatutSession {
  id: string;
  status: string;
  transaction_id: string | null;
  transaction_status: string | null;
  transaction_reference: string | null;
}

export function statutSession(sessionId: string): Promise<StatutSession> {
  return appel<StatutSession>(`/checkout-sessions/${encodeURIComponent(sessionId)}/status/`);
}

export interface PaiementVerifie {
  id: string;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  requested_amount: string;
  debited_amount: string;
  net_amount: string;
  currency: string;
}

// Seule source qui autorise à livrer : revérifie toujours l'état réel côté
// SasPay, jamais un statut mémorisé ni le corps d'un webhook.
export function verifierPaiement(paymentId: string): Promise<PaiementVerifie> {
  return appel<PaiementVerifie>(`/payments/${encodeURIComponent(paymentId)}/verify/`);
}

const TOLERANCE_WEBHOOK_S = 300;

// Signature = HMAC-SHA256 hex de "<timestamp>.<corps brut>" (doc SasPay,
// section Webhooks). Comparaison en temps constant ; horodatage à plus de
// 5 minutes rejeté, sinon un webhook intercepté resterait rejouable.
export function signatureWebhookValide(
  corpsBrut: string,
  signature: string | null,
  horodatage: string | null,
  secret: string
): boolean {
  if (!signature || !horodatage || !/^\d+$/.test(horodatage)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(horodatage)) > TOLERANCE_WEBHOOK_S) return false;
  const attendue = crypto.createHmac("sha256", secret).update(`${horodatage}.${corpsBrut}`).digest("hex");
  const a = Buffer.from(signature.toLowerCase());
  const b = Buffer.from(attendue);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
