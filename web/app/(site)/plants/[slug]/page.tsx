import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaxonBySlug, getClaimsForTaxon, getComposesForTaxon } from "@/lib/taxon";
import { FavoriteButton } from "@/components/chat/FavoriteButton";
import { CreditsPhotos, PlantGallery } from "@/components/plant/PlantGallery";
import { HabitatAvailabilityBlock } from "@/components/plant/HabitatAvailabilityBlock";
import { IndicationsList } from "@/components/plant/IndicationsList";
import { ScienceSection } from "@/components/plant/ScienceSection";
import { PrecautionsBanner } from "@/components/plant/PrecautionsBanner";
import { CarteRemede } from "@/components/boutique/CarteRemede";
import { getRemedes } from "@/lib/boutique";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const taxon = await getTaxonBySlug(slug);
  if (!taxon) notFound();

  const [claims, composes, remedes] = await Promise.all([
    getClaimsForTaxon(taxon.id),
    getComposesForTaxon(taxon.id),
    // La vente ne doit jamais casser la fiche : en cas d'erreur, pas de bloc.
    getRemedes({ taxonId: taxon.id }).catch(() => []),
  ]);

  const nomPrincipal =
    taxon.noms_vernaculaires.find((n) => n.est_principal)?.libelle ?? taxon.nom_scientifique;
  const autresNoms = taxon.noms_vernaculaires.filter((n) => !n.est_principal);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8">
      <Link
        href="/decouverte"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Plantes
      </Link>

      <PlantGallery media={taxon.media} nom={nomPrincipal} />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{nomPrincipal}</h1>
          <FavoriteButton planteNom={nomPrincipal} />
        </div>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          <span className="italic">{taxon.nom_scientifique}</span>
          {taxon.famille ? `, famille des ${taxon.famille}` : ""}
        </p>
        {autresNoms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {autresNoms.map((n) => (
              <span key={n.libelle} className="rounded-lg bg-white px-2.5 py-1 text-sm text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-800">
                {n.libelle}
                {n.langue !== "non précisé" && <span className="text-neutral-400"> {n.langue}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {taxon.description && (
        <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300">{taxon.description}</p>
      )}

      <div className="mt-4">
        <HabitatAvailabilityBlock habitatRegion={taxon.habitat_region} />
      </div>

      {taxon.precautions && (
        <div className="mt-4">
          <PrecautionsBanner precautions={taxon.precautions} />
        </div>
      )}

      <h2 className="mb-3 mt-10 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Usages documentés
      </h2>
      <IndicationsList claims={claims} />

      <h2 className="mb-3 mt-10 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Ce que dit la science
      </h2>
      <ScienceSection composes={composes} />

      {/* Séparé de l'information santé : la fiche dit ce qui est documenté,
          ce bloc dit seulement où des tradipraticiens vendent une préparation
          à base de cette plante. Le chat, lui, ne vend rien. */}
      {remedes.length > 0 && (
        <section className="mt-12 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800/70 dark:bg-neutral-900/40">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Remèdes disponibles chez des tradipraticiens</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Préparations vendues par des tradipraticiens, sous leur responsabilité. Lafi ne les a pas évaluées : les
            usages et les précautions ci-dessus restent la référence.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {remedes.slice(0, 6).map((r) => (
              <CarteRemede key={r.id} remede={r} />
            ))}
          </div>
          <Link href={`/remedes?plante=${taxon.slug}`} className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Voir tous les remèdes à base de {nomPrincipal} →
          </Link>
        </section>
      )}

      <footer className="mt-12 space-y-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <CreditsPhotos media={taxon.media} />
        <p className="text-xs text-neutral-500">
          {taxon.voucher_reference
            ? `Spécimen de référence : ${taxon.voucher_reference}${taxon.herbier ? ` (${taxon.herbier})` : ""}.`
            : "Pas encore de spécimen de référence déposé en herbier."}
          {taxon.autorite ? ` Nom complet : ${taxon.nom_scientifique} ${taxon.autorite}.` : ""}
        </p>
      </footer>
    </div>
  );
}
