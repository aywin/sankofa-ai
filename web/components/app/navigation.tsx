// Les quatre entrées de Lafi — mêmes libellés partout : barre latérale,
// barre du bas sur téléphone, en-tête de l'accueil.

function Icone({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

export const ICONES = {
  lafi: (c?: string) => <Icone className={c} d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  plantes: (c?: string) => <Icone className={c} d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Zm0 0 7-7" />,
  remedes: (c?: string) => <Icone className={c} d="M8 3h8M9 3v3l-3 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9l-3-4V3M6 13h12" />,
  tradipraticiens: (c?: string) => <Icone className={c} d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0" />,
  moi: (c?: string) => <Icone className={c} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c1-4 4-6 8-6s7 2 8 6" />,
  plus: (c?: string) => <Icone className={c} d="M12 5v14M5 12h14" />,
  menu: (c?: string) => <Icone className={c} d="M4 6h16M4 12h16M4 18h16" />,
  replier: (c?: string) => <Icone className={c} d="M4 4h16v16H4zM9 4v16" />,
  corbeille: (c?: string) => <Icone className={c} d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
};

export type CleNavigation = "lafi" | "plantes" | "remedes" | "tradipraticiens";

export const NAVIGATION: { cle: CleNavigation; href: string; libelle: string; prefixes: string[] }[] = [
  { cle: "lafi", href: "/chat", libelle: "Parler à Lafi", prefixes: ["/chat"] },
  { cle: "plantes", href: "/decouverte", libelle: "Plantes", prefixes: ["/decouverte", "/plants", "/maladies", "/laboratoire", "/synergies"] },
  { cle: "remedes", href: "/remedes", libelle: "Remèdes", prefixes: ["/remedes"] },
  { cle: "tradipraticiens", href: "/tradipraticiens", libelle: "Tradipraticiens", prefixes: ["/tradipraticiens", "/b/"] },
];

export function estActif(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`));
}
