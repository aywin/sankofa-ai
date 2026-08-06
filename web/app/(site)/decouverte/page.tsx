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
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        {results.length} usage{results.length > 1 ? "s" : ""} traditionnel{results.length > 1 ? "s" : ""}
        {results.length !== totalCount ? ` sur ${totalCount} au total` : ""} — classés du niveau de preuve le
        plus solide au moins solide.
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
