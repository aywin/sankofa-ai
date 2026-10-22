import { Espace } from "@/components/compte/Espace";

export const metadata = { title: "Mon espace — Lafi", robots: { index: false } };

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-8">
      <Espace>{children}</Espace>
    </main>
  );
}
