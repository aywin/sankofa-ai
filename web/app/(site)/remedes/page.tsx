import Link from "next/link";
import { getRemedes } from "@/lib/boutique";
import { CarteRemede } from "@/components/boutique/CarteRemede";
import { EnteteMarche } from "@/components/boutique/EnteteMarche";
import { CHAMP } from "@/components/boutique/styles";

export const metadata = {
  title: "Remèdes — Lafi",
  description: "Les préparations des tradipraticiens, à commander et payer par mobile money.",
};

// Filtres en paramètres d'URL (formulaire GET) : marchent sans JavaScript,
// se partagent par lien, et le bouton retour les conserve.
export default async function RemedesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plante?: string; ville?: string; prix?: string }>;
}) {
  const { q, plante, ville, prix } = await searchParams;
  const prixMax = prix ? Number(prix) || undefined : undefined;

  const [tous, remedes] = await Promise.all([getRemedes(), getRemedes({ texte: q, plante, ville, prixMax })]);

  // Options des filtres : seulement ce qui existe dans le catalogue.
  const plantes = [...new Map(tous.flatMap((r) => r.plantes).map((p) => [p.slug, p])).values()].sort((a, b) =>
    a.nom_scientifique.localeCompare(b.nom_scientifique)
  );
  const villes = [...new Set(tous.map((r) => r.ville).filter((v): v is string => !!v))].sort();
  const filtre = !!(q || plante || ville || prixMax);

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8">
      <EnteteMarche actif="remedes" />

      <form method="get" className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        <input name="q" defaultValue={q} placeholder="Chercher un remède, une plante…" className={CHAMP} aria-label="Recherche" />
        <select name="plante" defaultValue={plante ?? ""} className={CHAMP} aria-label="Plante">
          <option value="">Toutes les plantes</option>
          {plantes.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.nom_scientifique}
            </option>
          ))}
        </select>
        <select name="ville" defaultValue={ville ?? ""} className={CHAMP} aria-label="Ville">
          <option value="">Toutes les villes</option>
          {villes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select name="prix" defaultValue={prix ?? ""} className={CHAMP} aria-label="Prix maximum">
          <option value="">Tous les prix</option>
          <option value="2000">Jusqu&apos;à 2 000 FCFA</option>
          <option value="5000">Jusqu&apos;à 5 000 FCFA</option>
          <option value="10000">Jusqu&apos;à 10 000 FCFA</option>
        </select>
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Chercher
        </button>
      </form>

      {filtre && (
        <p className="mt-3 text-sm text-neutral-500">
          {remedes.length} remède{remedes.length > 1 ? "s" : ""} ·{" "}
          <Link href="/remedes" className="text-emerald-700 hover:underline dark:text-emerald-400">
            effacer les filtres
          </Link>
        </p>
      )}

      {remedes.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 px-6 py-12 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          {filtre ? "Aucun remède ne correspond à ta recherche." : "Aucun remède en vente pour le moment."}
          <p className="mt-2">
            Tu es tradipraticien ?{" "}
            <Link href="/moi/boutique" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Vends tes préparations sur Lafi
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {remedes.map((r) => (
            <CarteRemede key={r.id} remede={r} />
          ))}
        </div>
      )}
    </main>
  );
}
