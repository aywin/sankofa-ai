"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { allegationsTrouvees } from "@/lib/allegations";
import { CHAMP, Dialogue } from "./Dialogue";

export interface ProduitGere {
  id: string;
  nom: string;
  description: string | null;
  prix: number;
  prix_reduit: number | null;
  ville: string | null;
  plante_origine_libre: string | null;
  stock: number | null;
  image_url: string | null;
  statut: "publie" | "masque" | "retire";
  retire_motif: string | null;
  taxonIds: string[];
}

interface Plante {
  id: string;
  nom_scientifique: string;
}

const IMAGE_MAX_OCTETS = 3 * 1024 * 1024;

export function FormulaireProduit({
  boutiqueId,
  villeBoutique,
  userId,
  produit,
  onFermer,
  onEnregistre,
}: {
  boutiqueId: string;
  villeBoutique: string | null;
  userId: string;
  produit: ProduitGere | null;
  onFermer: () => void;
  onEnregistre: () => void;
}) {
  const [nom, setNom] = useState(produit?.nom ?? "");
  const [prix, setPrix] = useState(produit ? String(produit.prix) : "");
  const [prixReduit, setPrixReduit] = useState(produit?.prix_reduit != null ? String(produit.prix_reduit) : "");
  const [ville, setVille] = useState(produit ? (produit.ville ?? "") : (villeBoutique ?? ""));
  const [planteLibre, setPlanteLibre] = useState(produit?.plante_origine_libre ?? "");
  const [description, setDescription] = useState(produit?.description ?? "");
  const [suivreStock, setSuivreStock] = useState(produit ? produit.stock !== null : false);
  const [stock, setStock] = useState(produit?.stock != null ? String(produit.stock) : "");
  const [imageUrl, setImageUrl] = useState(produit?.image_url ?? null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [taxonIds, setTaxonIds] = useState<string[]>(produit?.taxonIds ?? []);
  const [plantes, setPlantes] = useState<Plante[]>([]);
  const [recherche, setRecherche] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plantes")
      .then((r) => r.json())
      .then((d: { plantes?: Plante[] }) => setPlantes(d.plantes ?? []))
      .catch(() => setPlantes([]));
  }, []);

  const apercu = useMemo(() => (fichier ? URL.createObjectURL(fichier) : imageUrl), [fichier, imageUrl]);
  const allegations = allegationsTrouvees(nom, description);
  const plantesFiltrees = plantes.filter(
    (p) => !taxonIds.includes(p.id) && recherche.length >= 2 && p.nom_scientifique.toLowerCase().includes(recherche.toLowerCase())
  );

  const choisirFichier = (f: File | null) => {
    setErreur(null);
    if (f && f.size > IMAGE_MAX_OCTETS) {
      setErreur("Photo trop lourde (3 Mo maximum).");
      return;
    }
    setFichier(f);
  };

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    if (allegations.length > 0) return;
    setEnvoi(true);
    setErreur(null);
    try {
      let url = imageUrl;
      if (fichier) {
        const extension = fichier.type === "image/png" ? "png" : fichier.type === "image/webp" ? "webp" : "jpg";
        // Dossier = identifiant du compte : la policy Storage n'autorise
        // l'écriture que là.
        const chemin = `${userId}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabaseBrowser.storage.from("produits").upload(chemin, fichier, { contentType: fichier.type });
        if (error) throw new Error(`Photo : ${error.message}`);
        url = supabaseBrowser.storage.from("produits").getPublicUrl(chemin).data.publicUrl;
      }

      const valeurs = {
        nom: nom.trim(),
        description: description.trim() || null,
        prix: Number(prix),
        prix_reduit: prixReduit ? Number(prixReduit) : null,
        ville: ville.trim() || null,
        plante_origine_libre: planteLibre.trim() || null,
        stock: suivreStock ? Number(stock || 0) : null,
        image_url: url,
      };
      const { data, error } = produit
        ? await supabaseBrowser.from("produit").update(valeurs).eq("id", produit.id).select("id").single()
        : await supabaseBrowser
            .from("produit")
            .insert({ ...valeurs, boutique_id: boutiqueId, statut: "publie" })
            .select("id")
            .single();
      if (error || !data) throw new Error(messageBase(error?.message));

      await supabaseBrowser.from("produit_taxon").delete().eq("produit_id", data.id);
      if (taxonIds.length > 0) {
        const { error: errTaxon } = await supabaseBrowser
          .from("produit_taxon")
          .insert(taxonIds.map((taxon_id) => ({ produit_id: data.id, taxon_id })));
        if (errTaxon) throw new Error(`Plantes : ${errTaxon.message}`);
      }
      onEnregistre();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err));
      setEnvoi(false);
    }
  };

  return (
    <Dialogue titre={produit ? "Modifier le produit" : "Nouveau produit"} onFermer={onFermer}>
      <form onSubmit={enregistrer} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Nom du produit</span>
          <input required minLength={2} maxLength={100} value={nom} onChange={(e) => setNom(e.target.value)} className={CHAMP} placeholder="Tisane de kinkéliba, 100 g" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Prix (FCFA)</span>
          <input
            required
            type="number"
            inputMode="numeric"
            min={100}
            max={5000000}
            step={1}
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            className={CHAMP}
          />
          <span className="mt-1 block text-xs text-neutral-500">
            Les frais du paiement mobile sont déduits de ce que tu reçois.
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Prix réduit (facultatif)</span>
            <input
              type="number"
              inputMode="numeric"
              min={100}
              max={prix ? Number(prix) - 1 : undefined}
              step={1}
              value={prixReduit}
              onChange={(e) => setPrixReduit(e.target.value)}
              className={CHAMP}
              placeholder="Ex. promotion"
            />
            <span className="mt-1 block text-xs text-neutral-500">Affiché à la place du prix, qui apparaît barré.</span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Ville</span>
            <input maxLength={80} value={ville} onChange={(e) => setVille(e.target.value)} className={CHAMP} placeholder="Où le produit est disponible" />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <textarea
            maxLength={2000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={CHAMP}
            placeholder="Composition, présentation (sachet, flacon…), comment elle se prépare traditionnellement, précautions."
          />
          <span className="mt-1 block text-xs text-neutral-500">
            Décris ce que c&apos;est et comment c&apos;est fait. Pas de promesse de guérison : elles sont refusées.
          </span>
        </label>
        {allegations.length > 0 && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200" role="alert">
            <p className="font-medium">À retirer avant d&apos;enregistrer :</p>
            <ul className="mt-1 list-disc pl-5">
              {allegations.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm">
          <label className="flex items-center gap-2 font-medium">
            <input type="checkbox" checked={suivreStock} onChange={(e) => setSuivreStock(e.target.checked)} />
            Suivre le stock
          </label>
          {suivreStock && (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={`${CHAMP} mt-2`}
              aria-label="Quantité en stock"
              placeholder="Quantité disponible"
            />
          )}
          <span className="mt-1 block text-xs text-neutral-500">
            {suivreStock ? "Le stock baisse à chaque vente payée ; à 0, le produit s'affiche « Épuisé »." : "Sans suivi, le produit reste toujours disponible."}
          </span>
        </div>

        <div className="text-sm">
          <span className="mb-1 block font-medium">Photo</span>
          {apercu && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={apercu} alt="" className="mb-2 aspect-[4/3] w-40 rounded-xl object-cover" />
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => choisirFichier(e.target.files?.[0] ?? null)} className="text-sm" />
          {apercu && (
            <button
              type="button"
              onClick={() => {
                setFichier(null);
                setImageUrl(null);
              }}
              className="ml-2 text-xs text-neutral-500 hover:underline"
            >
              Retirer la photo
            </button>
          )}
        </div>

        <div className="text-sm">
          <span className="mb-1 block font-medium">Plante d&apos;origine</span>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {taxonIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTaxonIds((t) => t.filter((x) => x !== id))}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs italic text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                aria-label={`Retirer ${plantes.find((p) => p.id === id)?.nom_scientifique ?? "cette plante"}`}
              >
                {plantes.find((p) => p.id === id)?.nom_scientifique ?? "…"} ✕
              </button>
            ))}
          </div>
          <input value={recherche} onChange={(e) => setRecherche(e.target.value)} className={CHAMP} placeholder="Chercher par nom scientifique (ex. Hibiscus)" />
          {plantesFiltrees.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
              {plantesFiltrees.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTaxonIds((t) => [...t, p.id]);
                      setRecherche("");
                    }}
                    className="w-full px-3 py-1.5 text-left italic hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  >
                    {p.nom_scientifique}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <span className="mt-1 block text-xs text-neutral-500">
            Choisie dans les fiches Lafi, l&apos;acheteur y trouve ce qui est documenté sur la plante.
          </span>
          <input
            maxLength={120}
            value={planteLibre}
            onChange={(e) => setPlanteLibre(e.target.value)}
            className={`${CHAMP} mt-2`}
            placeholder="Pas dans la liste ? Écris le nom local de la plante"
            aria-label="Plante d'origine, nom libre"
          />
        </div>

        {erreur && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{erreur}</p>}

        <button
          type="submit"
          disabled={envoi || allegations.length > 0}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {envoi ? "Enregistrement…" : produit ? "Enregistrer les modifications" : "Mettre en vente"}
        </button>
      </form>
    </Dialogue>
  );
}

// Traduit les refus de la base (contraintes de 0001_boutique.sql).
export function messageBase(message: string | undefined): string {
  if (!message) return "Enregistrement impossible.";
  if (message.includes("sans_allegation")) return "Le texte contient une promesse de guérison ou une allégation interdite.";
  if (message.includes("prix_reduit")) return "Le prix réduit doit être inférieur au prix.";
  if (message.includes("prix")) return "Prix invalide : entre 100 et 5 000 000 FCFA, sans centimes.";
  if (message.includes("boutique_slug_key")) return "Cette adresse de boutique est déjà prise : choisis-en une autre.";
  if (message.includes("telephone")) return "Numéro de téléphone invalide.";
  return message;
}
