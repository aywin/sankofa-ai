import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { LeafIcon } from "@/components/chat/icons";

interface PreviewRow {
  slug: string;
  nom_scientifique: string;
  noms_vernaculaires: { libelle: string; est_principal: boolean }[];
  media: { url: string; label: string }[];
}

// Aperçu de cartes → page découverte complète (§9 du brief). Seules les
// plantes pilotes (vraies données, vraies photos) sont mises en avant
// ici — pas les 16 plantes du corpus démonstratif, pour ne pas donner
// une fausse impression de profondeur dès le premier écran.
export async function PlantsPreview({ limit = 6 }: { limit?: number }) {
  const { data } = await supabaseServer
    .from("taxon")
    .select("slug, nom_scientifique, noms_vernaculaires:nom_vernaculaire(libelle, est_principal), media:taxon_media(url, label)")
    .not("media", "is", null)
    .returns<PreviewRow[]>();

  const withPhotos = (data ?? []).filter((t) => t.media.length > 0).slice(0, limit);
  if (withPhotos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {withPhotos.map((t) => {
        const nom = t.noms_vernaculaires.find((n) => n.est_principal)?.libelle ?? t.nom_scientifique;
        return (
          <Link
            key={t.slug}
            href={`/plants/${t.slug}`}
            className="group overflow-hidden rounded-xl border border-neutral-200 transition hover:border-emerald-300 dark:border-neutral-800 dark:hover:border-emerald-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.media[0].url} alt={t.media[0].label} className="h-20 w-full object-cover" />
            <div className="flex items-center gap-1.5 p-2">
              <LeafIcon className="h-3 w-3 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">{nom}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
