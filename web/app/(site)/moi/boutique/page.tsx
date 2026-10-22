import { GestionBoutique } from "@/components/boutique/GestionBoutique";

export const metadata = { title: "Ma boutique — Lafi", robots: { index: false } };

// Première pièce de "Mon espace" (lafi-v5.md P4/P5) : les onglets de
// l'espace personnel viendront l'entourer.
export default function MaBoutiquePage() {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-8">
      <GestionBoutique />
    </main>
  );
}
