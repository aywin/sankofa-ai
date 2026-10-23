import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";

interface Ligne {
  url: string;
  credit_auteur: string;
  licence: string;
  taxon: { slug: string; nom_scientifique: string; noms_vernaculaires: { libelle: string; est_principal: boolean }[] } | null;
}

// Trois vraies photos de plantes documentées (taxon_media, sous licence
// libre, créditées), chacune menant à sa fiche.
export async function HeroPhotos() {
  const { data } = await supabaseServer
    .from("taxon_media")
    .select("url, credit_auteur, licence, taxon(slug, nom_scientifique, noms_vernaculaires:nom_vernaculaire(libelle, est_principal))")
    .limit(30)
    .returns<Ligne[]>();

  // Une photo par plante, trois plantes.
  const vues = new Set<string>();
  const photos = (data ?? []).filter((p) => p.taxon && !vues.has(p.taxon.slug) && vues.add(p.taxon.slug)).slice(0, 3);
  if (photos.length === 0) return null;

  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
      {photos.map((p, i) => {
        const nom = p.taxon!.noms_vernaculaires.find((n) => n.est_principal)?.libelle ?? p.taxon!.nom_scientifique;
        return (
          <Link
            key={p.url}
            href={`/plants/${p.taxon!.slug}`}
            className={`group relative overflow-hidden rounded-2xl bg-neutral-200 ${i === 0 ? "row-span-2" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={nom}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-white">
              <span className="block text-sm font-semibold">{nom}</span>
              <span className="block truncate text-[11px] text-white/70" title={`${p.credit_auteur}, ${p.licence}`}>
                Photo {p.credit_auteur}, {p.licence}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
