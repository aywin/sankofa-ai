import { AppShell } from "@/components/app/AppShell";

// Toute l'application (hors accueil) vit dans la même coquille : barre
// latérale globale sur ordinateur, menu + barre du bas sur téléphone.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
