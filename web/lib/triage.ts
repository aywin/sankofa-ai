// Triage déterministe (lafi-v5.md P1.4) — la sécurité ne dépend jamais du
// seul texte du modèle. Ce module tourne avant toute génération, sans IA :
// si le fournisseur est en panne, le bloc d'orientation s'affiche quand
// même. Le modèle reçoit aussi son résultat, pour que son texte reste
// cohérent avec le bloc.
//
// La liste des signes est À VALIDER par un professionnel de santé
// connaissant le contexte local — voir docs/triage.md. Elle est
// volontairement large : un faux positif coûte une phrase de prudence,
// un faux négatif peut coûter beaucoup plus.

export type NiveauTriage = "urgence" | "consulter" | "aucun";

export type GroupeRisque = "enfant_jeune" | "grossesse" | "allaitement" | "personne_agee" | "traitement_en_cours";

export interface TriageResultat {
  niveau: NiveauTriage;
  titre: string;
  // Une phrase par signe repéré, formulée comme le conseil de quelqu'un
  // qui s'y connaît — jamais comme une clause juridique.
  conseils: string[];
  groupesRisque: GroupeRisque[];
}

interface Regle {
  niveau: Exclude<NiveauTriage, "aucun">;
  motif: RegExp;
  conseil: string;
}

// Texte normalisé : minuscules, sans accents, apostrophes unifiées — les
// motifs ci-dessous sont écrits sur cette forme.
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’`]/g, "'");
}

const REGLES: Regle[] = [
  {
    niveau: "urgence",
    motif: /convuls|crise d'epilep|il tremble de partout et ne repond/,
    conseil: "Des convulsions demandent une prise en charge immédiate : va au centre de santé ou à l'hôpital le plus proche maintenant.",
  },
  {
    niveau: "urgence",
    // "confus" seul se déclenche sur "je suis confuse sur la préparation" :
    // on exige une confusion décrite comme un état.
    motif: /perte de connaissance|evanoui|inconscient|ne se reveille (pas|plus)|tres somnolent|(est|devient|semble|parait) (tres )?confus|confusion|delire|ne reconnait plus/,
    conseil: "Une perte de connaissance, une confusion ou une somnolence inhabituelle sont des signes graves : direction le centre de santé tout de suite.",
  },
  {
    niveau: "urgence",
    motif: /(difficulte|mal|du mal) a respirer|respire (mal|difficilement|vite)|essouffl|etouff|manque d'air/,
    conseil: "Une difficulté à respirer ne se soigne pas à la maison : va au centre de santé sans attendre.",
  },
  {
    niveau: "urgence",
    motif: /douleur (a|dans|de) la poitrine|douleur thoracique|serre(ment)? (a|dans) la poitrine|mal au coeur qui serre/,
    conseil: "Une douleur dans la poitrine peut venir du cœur : rends-toi aux urgences maintenant.",
  },
  {
    niveau: "urgence",
    motif: /vomi[rt]? du sang|crache du sang|sang dans les (selles|urines|vomi)|selles noires|saigne beaucoup|hemorragi|saignement abondant/,
    conseil: "Un saignement important ou du sang dans les selles, les urines ou les vomissements demande une consultation immédiate.",
  },
  {
    niveau: "urgence",
    motif: /nuque raide|raideur (de|a) la nuque|ne peut pas plier le cou/,
    conseil: "Une fièvre avec la nuque raide peut signaler une méningite : va au centre de santé immédiatement.",
  },
  {
    niveau: "urgence",
    motif: /paralys|bouche de travers|visage (qui )?tombe|ne (peut|arrive) plus (a )?parler|bras (qui ne bouge|inerte)/,
    conseil: "Une paralysie soudaine ou une difficulté brutale à parler peut être un AVC : chaque minute compte, va aux urgences.",
  },
  {
    niveau: "urgence",
    motif: /morsure de serpent|mordu par un serpent|piqure de scorpion/,
    conseil: "Après une morsure de serpent ou une piqûre de scorpion, va au centre de santé immédiatement. Aucune plante ne remplace un sérum.",
  },
  {
    niveau: "urgence",
    motif: /empoisonn|intoxiqu|a (avale|bu) (du|de la|de l')(petrole|javel|insecticide|produit)/,
    conseil: "En cas d'intoxication possible, va au centre de santé tout de suite, si possible avec l'emballage du produit.",
  },
  {
    niveau: "urgence",
    motif: /ne (boit|mange|tete) plus|vomit tout|n'urine plus|yeux creux|tres deshydrat/,
    conseil: "Quelqu'un qui ne garde plus rien, ne boit plus ou n'urine plus se déshydrate dangereusement : centre de santé maintenant.",
  },
  {
    niveau: "consulter",
    motif: /fievre|chaud au corps|corps (est )?chaud|palu|paludisme|frisson/,
    conseil: "Avec de la fièvre ou des frissons, fais d'abord un test de dépistage rapide du paludisme (TDR) au CSPS : c'est rapide, peu coûteux, et ça change tout pour la suite.",
  },
  {
    niveau: "consulter",
    motif: /depuis (plus de )?(3|4|5|6|7|trois|quatre|cinq|six|sept|plusieurs) jours|depuis (une|deux|1|2) semaine|depuis un mois|ca ne passe pas/,
    conseil: "Quand ça dure depuis plusieurs jours sans s'améliorer, il vaut mieux faire vérifier au centre de santé.",
  },
  {
    niveau: "consulter",
    motif: /pus|plaie (qui )?(gonfle|sent|devient rouge|chaude)|trainee rouge|ligne rouge/,
    conseil: "Une plaie qui gonfle, chauffe, sent mauvais ou laisse du pus est infectée : fais-la voir, surtout si une traînée rouge remonte ou si la fièvre apparaît.",
  },
  {
    niveau: "consulter",
    motif: /douleur (tres forte|intense|insupportable)|tres mal au ventre|mal de ventre (tres fort|intense)/,
    conseil: "Une douleur très forte mérite un avis au centre de santé avant d'essayer quoi que ce soit.",
  },
  {
    niveau: "consulter",
    motif: /jaunisse|yeux jaunes|peau jaune|urines (tres )?foncees/,
    conseil: "Des yeux ou une peau qui jaunissent peuvent venir du foie : fais-toi examiner, et évite d'ajouter des préparations sans avis.",
  },
  {
    niveau: "consulter",
    // La durée ("depuis plusieurs jours") est couverte par la règle générale.
    motif: /diarrhee (avec du sang|sanglante)|sang dans la diarrhee/,
    conseil: "Une diarrhée qui dure ou qui contient du sang doit être vue au centre de santé ; en attendant, bois des solutions de réhydratation (SRO).",
  },
];

const ENFANT = /bebe|nourrisson|nouveau-ne|mon (petit|fils|enfant)|ma (petite|fille)|enfant|(\b[1-9]|1[0-9]|2[0-3]) mois\b/;
const AGE_ANS = /\b(\d{1,3}) ?ans\b/g;
const GROSSESSE = /enceinte|grossesse|j'attends un bebe/;
const ALLAITEMENT = /allaite|allaitement/;
const TRAITEMENT = /je prends (un |des |du )?(traitement|medicament|comprime)|sous traitement|traitement (pour|contre) la tension|antihypertenseur|anticoagulant|insuline|metformine|antiretro/;

function detecterGroupes(texte: string): GroupeRisque[] {
  const groupes = new Set<GroupeRisque>();
  // "enceinte de 5 mois" décrit la grossesse, pas un nourrisson de 5 mois.
  const t = texte.replace(/enceinte de \d+ mois|grossesse de \d+ mois|\d+ mois de grossesse/g, "enceinte");
  for (const m of t.matchAll(AGE_ANS)) {
    const age = Number(m[1]);
    if (age <= 5) groupes.add("enfant_jeune");
    if (age >= 65 && age < 120) groupes.add("personne_agee");
  }
  if (ENFANT.test(t)) groupes.add("enfant_jeune");
  if (GROSSESSE.test(t)) groupes.add("grossesse");
  if (ALLAITEMENT.test(t)) groupes.add("allaitement");
  if (TRAITEMENT.test(t)) groupes.add("traitement_en_cours");
  return [...groupes];
}

// `texteUtilisateur` : les derniers messages de l'utilisateur, concaténés
// — un "il a 2 ans" envoyé après "mon fils a de la fièvre" doit compter.
export function evaluerTriage(texteUtilisateur: string): TriageResultat {
  const t = normaliser(texteUtilisateur);
  const groupesRisque = detecterGroupes(t);
  const declenchees = REGLES.filter((r) => r.motif.test(t));
  const conseils = declenchees.map((r) => r.conseil);
  let niveau: NiveauTriage = declenchees.some((r) => r.niveau === "urgence")
    ? "urgence"
    : declenchees.length > 0
      ? "consulter"
      : "aucun";

  const fievre = /fievre|chaud au corps|corps (est )?chaud|frisson|palu/.test(t);

  // Escalades par groupe à risque (PCIME/OMS : chez l'enfant de moins de
  // 5 ans en zone d'endémie palustre, toute fièvre se teste vite).
  if (groupesRisque.includes("enfant_jeune") && fievre) {
    niveau = niveau === "urgence" ? "urgence" : "consulter";
    conseils.unshift("Chez un jeune enfant, une fièvre doit être vue au centre de santé le jour même : le paludisme peut s'aggraver très vite à cet âge.");
  }
  if (groupesRisque.includes("grossesse")) {
    if (/saign|douleur|fievre|maux de tete (fort|violent)|gonfle|ne sent plus (le|son) bebe/.test(t)) {
      niveau = "urgence";
      conseils.unshift("Pendant la grossesse, un saignement, une douleur, de la fièvre ou de forts maux de tête demandent une consultation sans attendre.");
    } else if (niveau === "aucun") {
      niveau = "consulter";
      conseils.push("Pendant la grossesse, beaucoup de plantes sont déconseillées : parles-en à la sage-femme ou au centre de santé avant d'en prendre.");
    }
  }
  if (groupesRisque.includes("traitement_en_cours")) {
    conseils.push("Si tu prends déjà un traitement, certaines plantes peuvent en renforcer ou en réduire l'effet : demande au centre de santé avant de les associer.");
    if (niveau === "aucun") niveau = "consulter";
  }

  const titre =
    niveau === "urgence"
      ? "Va au centre de santé maintenant"
      : niveau === "consulter"
        ? "À faire vérifier au centre de santé"
        : "";

  return { niveau, titre, conseils: [...new Set(conseils)], groupesRisque };
}

// Résumé destiné au modèle : seule l'urgence s'affiche en encadré, le
// reste, c'est le modèle qui le dit.
export function triagePourModele(r: TriageResultat): string {
  if (r.niveau === "aucun" && r.groupesRisque.length === 0) {
    return "Triage automatique : aucun signe d'alerte repéré dans les mots de l'utilisateur (ce qui ne prouve pas l'absence de gravité).";
  }
  return [
    r.niveau === "urgence"
      ? `Triage automatique : urgence. L'écran affiche DÉJÀ au-dessus de ta réponse un encadré "${r.titre}" : ${r.conseils.join(" ")} Commence par confirmer cette orientation en une phrase, sans dramatiser et sans recopier l'encadré. Ne propose AUCUNE préparation à la place d'une consultation.`
      : r.conseils.length > 0
        ? `Triage automatique (repéré sur des mots-clés) : ${r.conseils.join(" ")} Si la personne décrit sa propre situation ou celle d'un proche, dis-le avec tes mots au début de ta réponse, en une ou deux phrases. Si c'est une question générale sur un remède, glisse-le seulement s'il est utile.`
        : "",
    r.groupesRisque.length > 0 ? `Groupes à risque repérés : ${r.groupesRisque.join(", ")}.` : "",
    // Les usages documentés décrivent des pratiques chez l'adulte : les
    // présenter pour un enfant de 3 ans revient à suggérer une dose
    // pédiatrique qu'aucune source ne donne (évaluation du 22/10).
    r.groupesRisque.includes("enfant_jeune")
      ? "Il s'agit d'un jeune enfant : ne présente AUCUNE préparation à lui donner. Dis que les usages documentés concernent des adultes et que, chez un enfant de cet âge, toute plante se décide avec le centre de santé. Tu peux dire ce qui aide en attendant (le faire boire, le découvrir s'il a chaud)."
      : "",
    r.groupesRisque.includes("grossesse") || r.groupesRisque.includes("allaitement")
      ? "Grossesse ou allaitement : mentionne d'abord les précautions connues, et ne présente aucune préparation comme adaptée sans avis de la sage-femme."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
