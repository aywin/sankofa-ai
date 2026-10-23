import crypto from "crypto";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { getTaxonByVernacularName } from "@/lib/taxon";
import { rechercherUsages, usagesPourModele } from "@/lib/retrieval";
import { evaluerTriage, triagePourModele, type TriageResultat } from "@/lib/triage";
import { composerRepli } from "@/lib/chatRepli";
import { MODELES } from "@/lib/modeles";
import type { MatchClaimResult } from "@/lib/types";

// Vercel : la génération avec un appel d'outil peut dépasser le délai par
// défaut d'une fonction. Le délai du modèle (GENERATION_TIMEOUT_MS) est
// plus court, pour que le repli documentaire ait le temps de partir.
export const maxDuration = 60;

const GENERATION_TIMEOUT_MS = 40_000;
const CHUNK_TIMEOUT_MS = 20_000;

// Bornes (lafi-v5.md P1.8) — ce que l'hébergement protège déjà est
// documenté dans docs/triage.md, section "Bornes".
const CORPS_MAX_OCTETS = 12_000_000;
const MESSAGES_MAX = 60;
const MESSAGES_ENVOYES_AU_MODELE = 20;
const IMAGES_MAX = 4;
const IMAGE_MAX_CARACTERES = 6_000_000; // data URL base64 ≈ 4,5 Mo d'image

// Calibrage du ton — ne pas envoyer ces exemples au modèle, ils servent de
// repère pour quiconque retouche SYSTEM_PROMPT :
//
// Mauvais : "En tant qu'assistant IA, je peux vous proposer quelques pistes
//   documentées sur les usages traditionnels..."
// Bon     : "Pour une fièvre avec des frissons, commence par un test palu au
//   CSPS. À côté de ça, au Plateau central, des tradipraticiens utilisent..."
//
// Mauvais : "Je porte le savoir tradipraticien depuis toujours."
// Bon     : "Je suis Lafi, une IA. Je m'appuie sur des usages recueillis
//   auprès de tradipraticiens et sur ce que la science en dit."
//
// Mauvais : "plusieurs plantes très efficaces"
// Bon     : "le bissap est la plus étudiée des trois — des essais montrent
//   une baisse modeste de la tension —, les deux autres le sont peu."
const SYSTEM_PROMPT = `Tu es Lafi. "Lafi" vient du mooré et veut dire "santé".

Qui tu es — sans détour :
- Tu es une IA. Tu t'appuies sur des usages de plantes médicinales recueillis
  auprès de tradipraticiens d'Afrique de l'Ouest, croisés avec ce que la
  littérature scientifique en dit. Si on te demande ce que tu es, tu le dis
  simplement, sans t'excuser et sans te réduire à "un simple outil".
- Tu TRANSMETS un savoir qui appartient à des praticiens ; tu ne prétends
  jamais l'incarner ni le détenir. Quand l'origine est connue, attribue-la
  ("des tradipraticiens du Plateau central préparent...", "c'est un usage
  rapporté par plusieurs traditions"). Quand une donnée est marquée
  "donnee_de_demonstration", ne la présente pas comme une collecte de terrain.

Comment tu parles :
- Direct, chaleureux, en "tu", français clair sans jargon, jamais
  infantilisant. Tu expliques, tu compares, tu mets en perspective.
- Écriture simple : phrases courtes. Jamais de tiret long (—) ni de tiret
  moyen (–) : une virgule, un deux-points ou un point. Pas d'italique, sauf
  pour un nom latin de plante. Le gras avec parcimonie.
- Ton assurance suit les preuves, jamais l'inverse. Un usage bien attesté mais
  peu étudié se dit comme tel ; une étude solide se dit comme telle. Mots
  interdits : "très efficace", "efficace à coup sûr", "guérit", "guérison",
  "miracle", "sans danger", "naturel donc sans risque".
- Les deux informations restent séparées : ce que rapportent les
  tradipraticiens, et ce que dit la science. Jamais un seul jugement fusionné,
  jamais de pourcentage ni de "X sur 10" — ces chiffres n'existent pas dans
  tes données, même si on insiste.
- Tu ne parles jamais de "base de données", de "résultats de recherche",
  d'"outil" ou de "données fournies" : tu expliques, comme quelqu'un qui a lu
  les sources.

Deux sortes de questions :
1. Question documentaire ("à quoi sert le kinkéliba ?", "le moringa contient
   quoi ?") : réponds directement.
2. Situation personnelle ("j'ai de la fièvre", "mon fils tousse") :
   - Si le triage ci-dessous signale quelque chose, commence par cette
     orientation, en une phrase naturelle.
   - S'il te manque l'âge, une grossesse ou un allaitement, un traitement en
     cours, ou depuis combien de temps ça dure, pose UNE seule question
     groupée et courte avant de parler de préparations. Si l'essentiel est
     déjà dit, ne redemande pas.
   - Ensuite seulement : les usages documentés, précautions AVANT
     préparations.

Forme de ta réponse :
- À côté de ta réponse, l'écran affiche déjà un panneau avec chaque plante
  des usages transmis : nom, préparation, précautions, niveau de preuve et
  lien vers sa fiche. Tu n'as donc PAS à les détailler une par une.
- Ta réponse est la synthèse : 3 à 6 phrases, en paragraphes courts. Ce que
  tu en retiens pour cette personne, laquelle est la mieux étudiée et
  laquelle ne l'est pas, la précaution qui compte le plus, et quoi faire
  ensuite (consulter, surveiller, ouvrir une fiche).
- Pas de titres, pas de section par plante, pas de liste de préparations,
  pas de séparateur "---". Un nom de plante se cite en passant.
- Si on te demande explicitement le détail d'une plante ou d'une
  préparation, alors seulement tu le développes.

Règles sur le contenu :
- Tu réponds toujours, naturellement, et tu ne mens jamais. Les usages
  documentés qu'on te transmet (ci-dessous, ou via l'outil
  "rechercher_par_symptome") sont tes sources : l'écran les affiche à côté
  de ta réponse, et ce sont les seuls remèdes dont tu décris la
  préparation.
- Quand tes sources ne couvrent pas la question, dis-le simplement ("je
  n'ai pas encore de remède documenté pour ça"), puis donne quand même ce
  qui aide : ce que tu sais de façon générale et sûre (gestes simples, signes
  qui doivent faire consulter), une piste (qui interroger : un
  tradipraticien reconnu, un herboriste, le CSPS), ou une plante souvent
  citée pour ce mal, en précisant clairement qu'elle n'est pas encore
  documentée ici et sans en donner la préparation. Tu peux aussi inviter la
  personne à raconter un remède qu'elle connaît.
- Jamais de posologie, dose ou fréquence à l'impératif ("prends 2 tasses par
  jour"). Tu peux décrire une pratique observée ("la préparation rapportée
  est une infusion de calices séchés").
- Une contre-indication ou une précaution connue est toujours dite, avant la
  préparation.
- Les usages transmis contiennent déjà préparation, précautions et niveau de
  preuve. L'outil "obtenir_details_plante" ne sert que si l'utilisateur
  demande explicitement plus de détails sur une plante (description,
  habitat…) : chaque appel retarde ta réponse.
- Hors santé et plantes : réponds normalement, puis recentre en une phrase.

Photos :
- Plante : identification prudente, toujours "à confirmer", jamais
  catégorique ; puis "rechercher_par_symptome" avec le nom identifié. Une
  identification incertaine ne mène jamais à une préparation à avaler.
- Peau, plaie, éruption : décris ce que tu observes, sans diagnostic ferme,
  puis "rechercher_par_symptome" avec cette description.
- Photo sans rapport : dis-le simplement.`;

const MOTS_INTERDITS = /tr[eè]s efficace|efficace [àa] coup s[uû]r|gu[ée]ri(t|son|r)\b|miracle|sans (aucun )?danger|\d+\s*%/i;

function journal(requestId: string, evenement: string, champs: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ scope: "chat", requestId, evenement, ...champs }));
}

function texteDe(message: UIMessage): string {
  return message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join(" ");
}

function verifierBornes(messages: unknown): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return "Conversation vide.";
  if (messages.length > MESSAGES_MAX) return "Conversation trop longue : commence une nouvelle conversation.";
  let images = 0;
  for (const m of messages as UIMessage[]) {
    for (const p of m.parts ?? []) {
      if (p.type === "file") {
        images += 1;
        if (typeof p.url === "string" && p.url.length > IMAGE_MAX_CARACTERES) return "Une image est trop lourde (4 Mo maximum).";
      }
    }
  }
  if (images > IMAGES_MAX) return `Trop d'images dans cette conversation (${IMAGES_MAX} maximum).`;
  return null;
}

function reponseRefusee(message: string, status: number) {
  return Response.json({ message }, { status });
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const debut = Date.now();

  const brut = await req.text();
  if (brut.length > CORPS_MAX_OCTETS) return reponseRefusee("Message trop volumineux.", 413);

  let messages: UIMessage[];
  try {
    ({ messages } = JSON.parse(brut) as { messages: UIMessage[] });
  } catch {
    return reponseRefusee("Requête illisible.", 400);
  }
  const refus = verifierBornes(messages);
  if (refus) return reponseRefusee(refus, 400);

  const messagesUtilisateur = messages.filter((m) => m.role === "user");
  const dernierTexte = texteDe(messagesUtilisateur.at(-1)!);
  // Le triage lit les 3 derniers messages : "il a 2 ans" envoyé après "mon
  // fils a de la fièvre" doit compter.
  const triage: TriageResultat = evaluerTriage(messagesUtilisateur.slice(-3).map(texteDe).join(" \n "));
  // Une relance courte ("et pour un enfant ?") se comprend avec la question
  // d'avant.
  const requeteRecherche =
    dernierTexte.length < 30 && messagesUtilisateur.length > 1
      ? `${texteDe(messagesUtilisateur.at(-2)!)} ${dernierTexte}`
      : dernierTexte;

  journal(requestId, "debut", { messages: messages.length, triage: triage.niveau });

  const stream = createUIMessageStream({
    onError: (error) => {
      journal(requestId, "erreur_flux", { erreur: String(error) });
      return "Lafi n'a pas pu répondre. Réessaie dans un instant.";
    },
    execute: async ({ writer }) => {
      writer.write({ type: "start" });

      if (triage.niveau !== "aucun") {
        writer.write({ type: "data-triage", data: triage });
      }

      // Recherche AVANT la génération (P1.2) : épargne un aller-retour du
      // modèle — le premier texte arrive en une seule étape au lieu de deux.
      // En urgence ou pour un jeune enfant, aucune fiche de préparation ne
      // s'affiche et le modèle n'en reçoit pas — ni directement, ni par
      // l'outil : rien ne doit détourner de la consultation (évaluation du
      // 22/10 : 5 fiches sous "mon bébé convulse", une décoction de neem
      // proposée pour un enfant de 3 ans).
      const sansPreparations = triage.niveau === "urgence" || triage.groupesRisque.includes("enfant_jeune");
      let usages: MatchClaimResult[] = [];
      if (!sansPreparations && requeteRecherche.trim().length > 0) {
        const t0 = Date.now();
        try {
          const recherche = await rechercherUsages(requeteRecherche);
          usages = recherche.resultats;
          journal(requestId, "recherche", { ms: Date.now() - t0, retenus: usages.length, ecartes: recherche.ecartes });
        } catch (error) {
          journal(requestId, "recherche_echec", { ms: Date.now() - t0, erreur: String(error) });
        }
      }
      if (usages.length > 0) {
        writer.write({ type: "data-usages", data: { resultats: usages } });
      }

      const contexte = [
        triagePourModele(triage),
        sansPreparations
          ? "Volontairement, aucun usage de plante n'est transmis pour cette question (urgence ou jeune enfant) : n'en cherche pas."
          : usages.length > 0
            ? `Usages documentés pertinents pour la dernière question :\n${JSON.stringify(usagesPourModele(usages), null, 1)}`
            : "Aucun usage documenté ne correspond clairement à la dernière question. Si elle porte sur un autre sujet que la précédente, tu peux appeler rechercher_par_symptome avec une reformulation.",
      ].join("\n\n");

      let echec: unknown = null;
      let texteRecu = "";
      let premierTexteMs: number | null = null;
      let etapes = 0;

      // Modèle principal, puis modèle de secours si le premier échoue avant
      // d'avoir écrit quoi que ce soit (modèle indisponible pour la clé,
      // quota…). Le texte documentaire sans IA reste le dernier recours.
      for (const modele of MODELES) {
        echec = null;
        const result = streamText({
          model: google(modele.id),
          system: `${SYSTEM_PROMPT}\n\n---\n${contexte}`,
          messages: await convertToModelMessages(messages.slice(-MESSAGES_ENVOYES_AU_MODELE)),
          stopWhen: stepCountIs(3),
          // Une seule nouvelle tentative : sur un quota dépassé (429, cause des
          // échecs de l'audit du 21/10), les 3 essais par défaut retardaient
          // le repli de 8 s pour rien ; une panne passagère (503) en profite.
          maxRetries: 1,
          activeTools: sansPreparations ? [] : undefined,
          timeout: { totalMs: GENERATION_TIMEOUT_MS, chunkMs: CHUNK_TIMEOUT_MS },
          // Gemini envoie le texte par gros blocs : on le redécoupe en mots,
          // espacés de 15 ms, pour une écriture régulière à l'écran.
          experimental_transform: smoothStream({ delayInMs: 15, chunking: "word" }),
          providerOptions: { google: { thinkingConfig: { thinkingLevel: modele.reflexion } } },
          abortSignal: req.signal,
          onStepEnd: () => {
            etapes += 1;
          },
          tools: {
            rechercher_par_symptome: tool({
              description:
                "Recherche les usages traditionnels documentés correspondant à une description de symptômes, de maladie ou à un nom de plante. À utiliser pour une relance sur un sujet différent de celui déjà couvert par les usages transmis.",
              inputSchema: z.object({
                description: z
                  .string()
                  .describe("Description des symptômes, de la maladie ou nom de plante, en français."),
              }),
              execute: async ({ description }) => {
                try {
                  const { resultats } = await rechercherUsages(description);
                  return { resultats, pour_toi: usagesPourModele(resultats) };
                } catch (error) {
                  journal(requestId, "outil_echec", { erreur: String(error) });
                  return { erreur: "Recherche indisponible", resultats: [] as MatchClaimResult[] };
                }
              },
            }),
            obtenir_details_plante: tool({
              description:
                "Récupère la fiche complète d'une plante (description, précautions) à partir de son nom local exact.",
              inputSchema: z.object({
                nom: z.string().describe("Nom local exact de la plante, tel qu'il apparaît dans les usages transmis."),
              }),
              execute: async ({ nom }) => {
                try {
                  return { plante: await getTaxonByVernacularName(nom) };
                } catch (error) {
                  return { erreur: error instanceof Error ? error.message : String(error), plante: null };
                }
              },
            }),
          },
        });

        const reader = toUIMessageStream({
          stream: result.stream,
          sendStart: false,
          sendFinish: false,
          onError: (error) => {
            echec = error;
            return "generation";
          },
        }).getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value.type === "error") {
              echec ??= value.errorText;
              continue;
            }
            if (value.type === "text-delta") {
              premierTexteMs ??= Date.now() - debut;
              texteRecu += value.delta;
            }
            writer.write(value);
          }
        } catch (error) {
          echec ??= error;
        }
        if (!echec || texteRecu.length > 0) break;
        journal(requestId, "modele_echec", {
          modele: modele.id,
          erreur: echec instanceof Error ? `${echec.name}: ${echec.message}` : String(echec),
        });
      }

      if (echec) {
        journal(requestId, "generation_echec", {
          ms: Date.now() - debut,
          erreur: echec instanceof Error ? `${echec.name}: ${echec.message}` : String(echec),
          texteDejaEnvoye: texteRecu.length > 0,
        });
        const id = `repli-${requestId}`;
        writer.write({ type: "text-start", id });
        writer.write({
          type: "text-delta",
          id,
          delta:
            texteRecu.length > 0
              ? "\n\n_La réponse a été interrompue. Renvoie ta question pour la suite._"
              : composerRepli(triage, usages),
        });
        writer.write({ type: "text-end", id });
      } else if (MOTS_INTERDITS.test(texteRecu)) {
        // Pas de censure a posteriori d'un texte déjà affiché : on mesure,
        // pour corriger le prompt. eval-chat.ts vérifie la même règle.
        journal(requestId, "mot_interdit", { extrait: texteRecu.match(MOTS_INTERDITS)?.[0] });
      }

      writer.write({ type: "finish" });
      journal(requestId, "fin", { ms: Date.now() - debut, premierTexteMs, etapes, repli: !!echec });
    },
  });

  return createUIMessageStreamResponse({ stream, headers: { "x-lafi-request-id": requestId } });
}
