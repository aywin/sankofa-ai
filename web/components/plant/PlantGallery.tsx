import { LeafIcon } from "@/components/chat/icons";
import type { TaxonMedia } from "@/lib/types";

// Sert à l'identification sur le terrain (§4 du brief). Fallback
// pictogramme quand aucun média n'est encore documenté — honnête plutôt
// que de simuler une photo.
export function PlantGallery({ media }: { media: TaxonMedia[] }) {
  if (media.length === 0) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        <LeafIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {media.map((m) => (
        <figure key={m.id} className="w-20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.url} alt={m.label} className="h-20 w-20 rounded-2xl object-cover" />
          <figcaption className="mt-1 truncate text-center text-[11px] text-neutral-500 dark:text-neutral-400">
            {m.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
