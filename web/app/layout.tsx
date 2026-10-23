import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

// Une seule famille pour tout le site : les titres se distinguent par la
// graisse et la taille. Auto-hébergée par next/font.
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lafi",
  description: "Comprendre les usages des plantes médicinales, leurs preuves et leurs précautions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={figtree.variable}>
      <body className="bg-sand-50 text-neutral-900 antialiased dark:bg-sand-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
