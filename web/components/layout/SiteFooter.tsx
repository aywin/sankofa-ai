import Link from "next/link";
import { LafiMark } from "@/components/chat/icons";

// Footer étoffé (produit/ressources), sur fond encre — referme le cadre
// sombre ouvert par le hero, plutôt qu'une ligne de mentions perdue en
// bas de page.
export function SiteFooter() {
  return (
    <footer className="bg-ink-950 px-4 py-12 text-sand-50/80">
      <div className="mx-auto grid max-w-[1100px] gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <span className="flex items-center gap-1.5 text-lg font-semibold text-sand-50">
            <LafiMark className="h-5 w-5" />
            Lafi
          </span>
          <p className="mt-2 max-w-xs text-sm text-sand-50/60">
            On documente le savoir des tradipraticiens et on le rend accessible — croisé avec ce qu&apos;en dit la
            science, sans jamais les confondre.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sand-50/50">Produit</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/decouverte" className="hover:text-sand-50">
                Découverte
              </Link>
            </li>
            <li>
              <Link href="/laboratoire" className="hover:text-sand-50">
                Laboratoire
              </Link>
            </li>
            <li>
              <Link href="/chat" className="hover:text-sand-50">
                Parler à Lafi
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-sand-50/50">Ressources</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/maladies" className="hover:text-sand-50">
                Indications documentées
              </Link>
            </li>
            <li>
              <Link href="/decouverte?qualite=elevee" className="hover:text-sand-50">
                Preuves les mieux établies
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1100px] border-t border-sand-50/10 pt-6 text-xs text-sand-50/50">
        Lafi — information documentaire, pas un avis médical. Aucun élément de langage marchand : pas d&apos;achat,
        pas de promotion.
      </div>
    </footer>
  );
}
