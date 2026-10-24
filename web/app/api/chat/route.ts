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

const SYSTEM_PROMPT = `Tu es Lafi ("santé" en mooré). Tu aides à comprendre les remèdes traditionnels d'Afrique de l'Ouest : plantes surtout, mais aussi remèdes animaux ou minéraux. Tu es une IA et tu le dis simplement si on te le demande. Ce savoir appartient aux tradipraticiens et aux communautés qui l'ont transmis : tu le rapportes, tu ne prétends pas le détenir.

Parle comme une personne compétente et chaleureuse : en "tu", en français simple, sans jargon, sans formules toutes faites. Adapte la longueur à la question : une salutation appelle une phrase, une question de santé une vraie réponse, en paragraphes courts. Pas de tiret long ni moyen, pas de titres ni de séparateurs. Mets en gras la précaution qui compte le plus, en italique les noms latins.

Tes sources : l'outil rechercher_par_symptome interroge les usages documentés (livres, enquêtes de terrain, études). Utilise-le dès qu'une question porte sur un mal, un symptôme, une plante ou un remède ; pas pour une salutation, un remerciement ou une question sans rapport. Dans "annonce", écris en quelques mots ce que tu fais, pour la personne. Les plantes trouvées s'affichent à côté de ta réponse avec leur préparation, leurs précautions et leur fiche : fais la synthèse, ne les recopie pas une par une, sauf si on te demande le détail.

Honnêteté :
- Ce que rapporte la tradition et ce que dit la science sont deux choses distinctes : dis les deux, sans les fusionner. Ton assurance suit les preuves. Ne promets jamais de guérison ni d'efficacité garantie, et n'invente aucun chiffre.
- Tu ne décris la préparation que des remèdes trouvés dans tes sources. Si rien n'est documenté, dis-le, puis aide quand même : gestes simples et sûrs, signes qui doivent faire consulter, qui interroger (tradipraticien reconnu, herboriste, CSPS). Tu peux inviter la personne à raconter un remède qu'elle connaît.
- Les précautions passent avant la préparation. Jamais de dose à l'impératif ("prends 2 tasses") : tu décris ce qui est rapporté.

Situation personnelle ("j'ai de la fièvre", "mon fils tousse") : s'il manque l'essentiel (âge, grossesse ou allaitement, traitement en cours, depuis quand), pose une seule question courte avant de parler de préparations. Si un signe demande de consulter, dis-le naturellement au début.

Photos : identification de plante toujours prudente et "à confirmer", jamais de préparation à avaler sur une identification incertaine. Peau ou plaie : décris ce que tu vois, sans diagnostic ferme.`;

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

      // Seule l'urgence s'affiche en encadré, sans IA : il reste visible même
      // si le modèle échoue. Un simple conseil de consulter passe par le
      // modèle, qui le dit avec ses mots.
      if (triage.niveau === "urgence") {
        writer.write({ type: "data-triage", data: triage });
      }

      // Le modèle décide lui-même s'il faut chercher (outil
      // rechercher_par_symptome) : pas de recherche pour "bonjour" ou
      // "merci". En urgence ou pour un jeune enfant, l'outil est retiré :
      // aucune préparation ne doit détourner de la consultation
      // (évaluation du 22/10 : une décoction de neem proposée pour un
      // enfant de 3 ans).
      const sansPreparations = triage.niveau === "urgence" || triage.groupesRisque.includes("enfant_jeune");
      const contexte = [
        triagePourModele(triage),
        sansPreparations
          ? "Volontairement, tu n'as pas accès aux préparations pour cette question (urgence ou jeune enfant)."
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

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
                annonce: z.string().describe("Ce que tu fais, en quelques mots, affiché à la personne pendant la recherche."),
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
                annonce: z.string().describe("Ce que tu fais, en quelques mots, affiché à la personne."),
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
        if (!echec || texteRecu.length > 0 || req.signal.aborted) break;
        journal(requestId, "modele_echec", {
          modele: modele.id,
          erreur: echec instanceof Error ? `${echec.name}: ${echec.message}` : String(echec),
        });
      }

      if (req.signal.aborted) {
        journal(requestId, "arret_utilisateur", { ms: Date.now() - debut });
        return;
      }

      if (echec) {
        journal(requestId, "generation_echec", {
          ms: Date.now() - debut,
          erreur: echec instanceof Error ? `${echec.name}: ${echec.message}` : String(echec),
          texteDejaEnvoye: texteRecu.length > 0,
        });
        // Repli sans IA : on cherche nous-mêmes, pour donner au moins ce qui
        // est documenté.
        let usages: MatchClaimResult[] = [];
        if (texteRecu.length === 0 && !sansPreparations) {
          usages = await rechercherUsages(requeteRecherche)
            .then((r) => r.resultats)
            .catch(() => []);
          if (usages.length > 0) writer.write({ type: "data-usages", data: { resultats: usages } });
        }
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
