import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="fr">
      <body className="bg-sand-50 text-neutral-900 antialiased dark:bg-sand-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
