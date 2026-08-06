import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

// Serif (Fraunces) pour les moments manifeste, grotesque (Inter) pour le
// reste — voir le commentaire dans globals.css. Chargées ici via
// next/font pour être auto-hébergées (pas de requête vers Google Fonts
// au runtime).
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lafi",
  description: "Se soigner naturellement et efficacement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-sand-50 text-neutral-900 antialiased dark:bg-sand-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
