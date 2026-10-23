import Link from "next/link";

// En-tête commun aux pages Remèdes et Tradipraticiens : deux portes vers
// les mêmes boutiques — par le remède, ou par la personne.
export function EnteteMarche({ actif }: { actif: "remedes" | "tradipraticiens" }) {
  const onglet = (cle: typeof actif, href: string, libelle: string) => (
    <Link
      href={href}
      aria-current={actif === cle ? "page" : undefined}
      className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
        actif === cle
          ? "border-emerald-600 text-emerald-800 dark:text-emerald-300"
          : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      }`}
    >
      {libelle}
    </Link>
  );

  return (
    <header>
      <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl dark:text-neutral-100">
        {actif === "remedes" ? "Remèdes" : "Tradipraticiens"}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
        Préparations vendues par des tradipraticiens, sous leur responsabilité. Pour savoir ce qui est documenté sur une
        plante, ouvre sa fiche dans{" "}
        <Link href="/decouverte" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Plantes
        </Link>
        .
      </p>
      <nav aria-label="Remèdes et tradipraticiens" className="mt-5 flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {onglet("remedes", "/remedes", "Remèdes")}
        {onglet("tradipraticiens", "/tradipraticiens", "Tradipraticiens")}
      </nav>
    </header>
  );
}
