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
};

export default nextConfig;
