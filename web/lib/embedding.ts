import { google } from "@ai-sdk/google";
import { embed } from "ai";

// gemini-embedding-001 produit 3072 dimensions par défaut ; on la réduit à
// 768 pour matcher la colonne `vector(768)` du schéma Supabase.
const EMBEDDING_DIMENSIONS = 768;

const embeddingModel = google.embedding("gemini-embedding-001");

export async function embedDocument(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
  });
  return embedding;
}

export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_QUERY",
      },
    },
  });
  return embedding;
}
