// Modèles du chat, dans l'ordre d'essai. Mesuré le 24/10/2026 sur une même
// question : 3.6 Flash en réflexion par défaut (moyenne) donnait le premier
// mot en 6,6 s et 1 228 jetons facturés ; 3.8 Flash en réflexion basse,
// 2,4 s et 132 jetons. La réflexion basse suffit : le triage et la
// sélection des usages sont faits avant l'appel. Le second modèle sert de
// secours si le premier n'est pas disponible pour la clé de l'environnement.
export const MODELES = [
  { id: "gemini-3.8-flash", reflexion: "low" as const },
  { id: "gemini-3.6-flash", reflexion: "low" as const },
];
