// "12 500 FCFA" — espace insécable fine comme séparateur de milliers.
export function formatFcfa(montant: number | string): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(montant))} FCFA`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}
