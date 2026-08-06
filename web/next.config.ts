import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Un package-lock.json parasite existe hors du repo (C:\Users\accent),
  // ce qui faisait deviner à Turbopack le mauvais workspace root et
  // cassait la résolution du module client (erreurs "Could not find the
  // module ... global-error.js" masquant les vraies erreurs de page).
  turbopack: {
    root: path.join(__dirname),
  },
  // La liste A-Z des plantes faisait doublon avec /decouverte (mêmes
  // plantes, sans les filtres ni le niveau de preuve) — /plants/[slug]
  // (la fiche) reste inchangée, seul l'index disparaît.
  async redirects() {
    return [{ source: "/plants", destination: "/decouverte", permanent: false }];
  },
};

export default nextConfig;
