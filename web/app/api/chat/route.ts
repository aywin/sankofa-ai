import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";
import { embedQuery } from "@/lib/embedding";
import type { MatchUsageResult, Plante } from "@/lib/types";

const SYSTEM_PROMPT = `Tu es l'assistant de Lafi IA, une plateforme qui documente l'usage traditionnel de plantes médicinales africaines.

Règles impératives :
- Avant de recommander une plante pour un symptôme ou une maladie, tu dois TOUJOURS appeler l'outil "rechercher_par_symptome". Ne réponds jamais de mémoire sur ce sujet.
- Tu ne dois jamais inventer une plante, une préparation, une posologie ou un usage qui n'apparaît pas dans les résultats retournés par les outils.
- Si "rechercher_par_symptome" ne retourne aucun résultat pertinent, dis-le clairement plutôt que d'improviser.
- Tu peux appeler "obtenir_details_plante" pour donner plus de détails (précautions notamment) sur une plante déjà trouvée.
- Mentionne toujours le niveau de preuve (traditionnel / scientifique / les_deux) de chaque recommandation.
- Termine toujours ta réponse par un rappel que ceci ne remplace pas un avis médical professionnel.
- Réponds en français, dans un langage clair et accessible, sans jargon inutile.
- Si la question posée n'a rien à voir avec la santé ou les plantes médicinales, réponds normalement sans utiliser les outils et précise que la plateforme est centrée sur ce sujet.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-3.5-flash"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      rechercher_par_symptome: tool({
        description:
          "Recherche sémantique (par similarité, pas par mot-clé) des usages traditionnels de plantes correspondant à une description de symptômes ou de maladie.",
        inputSchema: z.object({
          description: z
            .string()
            .describe(
              "Description des symptômes ou de la maladie, en français, telle que formulée ou reformulée à partir de la demande de l'utilisateur."
            ),
        }),
        execute: async ({ description }) => {
          const queryEmbedding = await embedQuery(description);

          // Envoyé en JSON stringifié (text) et casté en vector() côté SQL :
          // PostgREST ne lie pas toujours correctement un paramètre RPC de
          // type extension (vector) — voir supabase/schema.sql.
          const { data, error } = await supabaseServer.rpc("match_usages", {
            query_embedding: JSON.stringify(queryEmbedding),
            match_count: 5,
            match_threshold: 0.3,
          });

          if (error) {
            return { erreur: error.message, resultats: [] };
          }

          return { resultats: (data ?? []) as MatchUsageResult[] };
        },
      }),
      obtenir_details_plante: tool({
        description:
          "Récupère la fiche complète d'une plante (description, précautions) à partir de son nom local exact.",
        inputSchema: z.object({
          nom: z
            .string()
            .describe(
              "Nom local exact de la plante, tel que retourné par rechercher_par_symptome (champ plante_nom)."
            ),
        }),
        execute: async ({ nom }) => {
          const { data, error } = await supabaseServer
            .from("plantes")
            .select("id, nom_local, nom_scientifique, description, precautions")
            .eq("nom_local", nom)
            .maybeSingle<Plante>();

          if (error) {
            return { erreur: error.message, plante: null };
          }

          return { plante: data };
        },
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
