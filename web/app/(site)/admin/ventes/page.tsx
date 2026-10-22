import { AdminVentes } from "@/components/boutique/AdminVentes";

export const metadata = { title: "Ventes — administration Lafi", robots: { index: false } };

export default function AdminVentesPage() {
  return (
    <main className="mx-auto max-w-[1000px] px-4 py-8">
      <AdminVentes />
    </main>
  );
}
