"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";

export { CHAMP } from "./styles";

// Feuille montante sur mobile, fenêtre centrée sur grand écran ; Échap et
// clic à l'extérieur ferment.
export function Dialogue({ titre, onFermer, children }: { titre: string; onFermer: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onFermer]);

  // Portail vers <body> : ouverte depuis l'en-tête (backdrop-blur), une
  // fenêtre "fixed" serait positionnée par rapport à l'en-tête, pas à
  // l'écran — elle s'affichait coupée en haut de page.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={titre}>
      <button type="button" aria-label="Fermer" onClick={onFermer} className="absolute inset-0 bg-black/40" />
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-sand-50 p-5 shadow-xl sm:max-w-md sm:rounded-3xl dark:bg-sand-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{titre}</h2>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
