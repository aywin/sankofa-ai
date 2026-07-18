import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lafi IA — Assistant plantes médicinales",
  description:
    "Chat IA sur les usages traditionnels des plantes médicinales africaines, ancré dans une base de données validée.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
