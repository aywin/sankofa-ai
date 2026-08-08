import { getDiscoveryData } from "@/lib/decouverte";
import { DiscoveryFilters } from "@/components/decouverte/DiscoveryFilters";
import { DiscoveryCard } from "@/components/decouverte/DiscoveryCard";
import { EmptyState } from "@/components/decouverte/EmptyState";
import { LeafIcon } from "@/components/chat/icons";

export const metadata = { title: "Découverte — Lafi" };

export default async function DecouvertePage({
  searchParams,
}: {
  searchParams: Promise<{ indication?: string; partie?: string; qualite?: string; region?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    indicationId: params.indication || undefined,
    partieNom: params.partie || undefined,
    qualite: params.qualite || undefined,
    region: params.region || undefined,
  };

  const { results, totalCount, options } = await getDiscoveryData(filters);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        <LeafIcon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
        Découverte
      </h1>
      <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
        {results.length} usage{results.length > 1 ? "s" : ""} traditionnel{results.length > 1 ? "s" : ""}
        {results.length !== totalCount ? ` sur ${totalCount} au total` : ""} — classés du niveau de preuve le
        plus solide au moins solide.
      </p>
      <p className="mb-6 rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
        La collecte de terrain auprès des tradipraticiens est en cours — une partie des sources affichées ici sont
        encore illustratives, clairement indiquées comme telles sur chaque carte.
      </p>

      <div className="mb-6">
        <DiscoveryFilters options={options} current={filters} />
      </div>

      {results.length === 0 ? (
        <EmptyState suggestions={options.indications} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <DiscoveryCard key={r.claimId} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
