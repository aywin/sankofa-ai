import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoutiquePublique } from "@/lib/boutique";
import { Vitrine } from "@/components/boutique/Vitrine";

// Lien court à partager (WhatsApp, SMS) : /b/<slug>.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const boutique = await getBoutiquePublique(slug);
  if (!boutique) return { title: "Boutique introuvable · Lafi" };
  const description = boutique.description ?? `Les préparations de ${boutique.nom}${boutique.ville ? `, ${boutique.ville}` : ""}.`;
  return {
    title: `${boutique.nom}, boutique sur Lafi`,
    description,
    openGraph: { title: boutique.nom, description, images: boutique.produits.find((p) => p.image_url)?.image_url ?? undefined },
  };
}

export default async function BoutiquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boutique = await getBoutiquePublique(slug);
  if (!boutique) notFound();
  return <Vitrine boutique={boutique} />;
}
