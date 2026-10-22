import { SuiviCommande } from "@/components/boutique/SuiviCommande";

export const metadata = { title: "Suivi de commande — Lafi", robots: { index: false } };

// Page de retour du paiement SasPay (return_url) — l'acheteur n'a pas de
// compte : le jeton `j` de l'URL est son droit d'accès.
export default async function CommandePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ j?: string }>;
}) {
  const { id } = await params;
  const { j } = await searchParams;
  return <SuiviCommande id={id} jeton={j ?? ""} />;
}
