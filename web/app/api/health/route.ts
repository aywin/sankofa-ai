import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabaseServer } from "@/lib/supabase";
import { embedQuery } from "@/lib/embedding";
import { MODELES } from "@/lib/modeles";

// /api/health            -> base seule (léger, pour une sonde fréquente)
// /api/health?complet=1  -> base + embedding + génération, chacun mesuré
//   séparément : l'audit du 21/10 avait une base au vert pendant que le
//   chat échouait. Coûte une requête au quota Gemini : pas pour une sonde
//   toutes les minutes.
async function mesurer(etape: () => Promise<unknown>) {
  const debut = Date.now();
  try {
    await etape();
    return { ok: true, ms: Date.now() - debut };
  } catch (error) {
    return { ok: false, ms: Date.now() - debut, erreur: error instanceof Error ? error.message.slice(0, 300) : String(error) };
  }
}

export async function GET(req: Request) {
  const complet = new URL(req.url).searchParams.get("complet") === "1";

  const { count, error } = await supabaseServer
    .from("indication")
    .select("*", { count: "exact", head: true });

  if (error) {
    return Response.json(
      { status: "error", database: "unreachable", message: error.message },
      { status: 500 }
    );
  }

  if (!complet) {
    return Response.json({ status: "ok", database: "connected", maladies_count: count });
  }

  const embedding = await mesurer(() => embedQuery("fièvre"));
  // Chaque modèle du chat, avec le même réglage que le chat.
  const generation: Record<string, Awaited<ReturnType<typeof mesurer>>> = {};
  for (const m of MODELES) {
    generation[m.id] = await mesurer(() =>
      generateText({
        model: google(m.id),
        prompt: "Réponds seulement : ok",
        maxRetries: 0,
        providerOptions: { google: { thinkingConfig: { thinkingLevel: m.reflexion } } },
      })
    );
  }
  const ok = embedding.ok && Object.values(generation).some((g) => g.ok);

  return Response.json(
    { status: ok ? "ok" : "degraded", database: "connected", maladies_count: count, embedding, generation },
    { status: ok ? 200 : 503 }
  );
}
