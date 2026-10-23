import { LeafIcon } from "@/components/chat/icons";
import type { TaxonMedia } from "@/lib/types";

// Photo principale en grand (sert aussi à reconnaître la plante sur le
// terrain), les autres en vignettes. Sans photo : un pictogramme, plutôt
// que de simuler une image.
export function PlantGallery({ media, nom }: { media: TaxonMedia[]; nom: string }) {
  if (media.length === 0) {
    return (
      <div className="flex aspect-[16/7] w-full items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        <LeafIcon className="h-12 w-12" />
      </div>
    );
  }

  const [principale, ...autres] = media;
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={principale.url} alt={principale.label || nom} className="aspect-[16/7] w-full rounded-3xl object-cover" />
      {autres.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {autres.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url} alt={m.label} title={m.label} className="h-20 w-28 shrink-0 rounded-xl object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}

// Attribution obligatoire des photos sous licence CC-BY(-SA) : en bas de
// fiche, jamais omise.
export function CreditsPhotos({ media }: { media: TaxonMedia[] }) {
  if (media.length === 0) return null;
  return (
    <p className="text-xs text-neutral-500">
      Photos :{" "}
      {media.map((m, i) => (
        <span key={m.id}>
          {i > 0 && ", "}
          <a href={m.source_url} target="_blank" rel="noreferrer" className="hover:underline">
            {m.label ? `${m.label} par ` : ""}
            {m.credit_auteur} ({m.licence})
          </a>
        </span>
      ))}
      .
    </p>
  );
}
