import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaxonBySlug, getClaimsForTaxon, getComposesForTaxon } from "@/lib/taxon";
import { LeafIcon } from "@/components/chat/icons";
import { FavoriteButton } from "@/components/chat/FavoriteButton";
import { PlantGallery } from "@/components/plant/PlantGallery";
import { HabitatAvailabilityBlock } from "@/components/plant/HabitatAvailabilityBlock";
import { IndicationsList } from "@/components/plant/IndicationsList";
import { ScienceSection } from "@/components/plant/ScienceSection";
import { PrecautionsBanner } from "@/components/plant/PrecautionsBanner";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const taxon = await getTaxonBySlug(slug);
  if (!taxon) notFound();

  const [claims, composes] = await Promise.all([getClaimsForTaxon(taxon.id), getComposesForTaxon(taxon.id)]);

  const nomPrincipal =
    taxon.noms_vernaculaires.find((n) => n.est_principal)?.libelle ?? taxon.nom_scientifique;
  const autresNoms = taxon.noms_vernaculaires.filter((n) => !n.est_principal);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-8">
      <Link
        href="/plants"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Toutes les plantes
      </Link>

      <div className="flex items-start gap-4">
        <PlantGallery media={taxon.media} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{nomPrincipal}</h1>
            <FavoriteButton planteNom={nomPrincipal} />
          </div>
          {autresNoms.length > 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Aussi appelée{" "}
              {autresNoms.map((n) => (n.langue !== "non précisé" ? `${n.libelle} (${n.langue})` : n.libelle)).join(", ")}
            </p>
          )}
          <p className="italic text-neutral-500 dark:text-neutral-400">
            {taxon.nom_scientifique}
            {taxon.autorite ? ` ${taxon.autorite}` : ""}
            {taxon.famille ? ` — ${taxon.famille}` : ""}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            {taxon.voucher_reference
              ? `Spécimen déposé : ${taxon.voucher_reference}${taxon.herbier ? ` (${taxon.herbier})` : ""}`
              : "Aucun spécimen déposé en herbier — donnée non publiable en l'état."}
          </p>
        </div>
      </div>

      {taxon.description && (
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">{taxon.description}</p>
      )}

      <div className="mt-4">
        <HabitatAvailabilityBlock habitatRegion={taxon.habitat_region} />
      </div>

      {taxon.precautions && (
        <div className="mt-4">
          <PrecautionsBanner precautions={taxon.precautions} />
        </div>
      )}

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
        Maladies traitées
      </h2>
      <IndicationsList claims={claims} />

      <h2 className="mb-3 mt-8 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
        <LeafIcon className="h-3.5 w-3.5" />
        Ce que dit la science
      </h2>
      <ScienceSection composes={composes} />
    </div>
  );
}
