import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createClient } from "@supabase/supabase-js";
import { embedDocument } from "../lib/embedding";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env.local."
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: claims, error } = await supabase
    .from("claim")
    .select(
      "id, contenu_pour_recherche, taxon(nom_scientifique), indication(nom)"
    )
    .is("embedding", null);

  if (error) {
    throw new Error(`Impossible de récupérer les claims : ${error.message}`);
  }

  if (!claims || claims.length === 0) {
    console.log("Rien à faire : tous les claims ont déjà un embedding.");
    return;
  }

  console.log(`${claims.length} claim(s) à traiter.`);

  let done = 0;
  let failed = 0;

  for (const claim of claims) {
    const taxon = (claim as unknown as { taxon: { nom_scientifique: string } | null }).taxon;
    const indication = (claim as unknown as { indication: { nom: string } | null }).indication;
    const label = `${taxon?.nom_scientifique ?? "?"} → ${indication?.nom ?? "?"}`;

    try {
      const embedding = await generateWithRetry(claim.contenu_pour_recherche);

      const { error: updateError } = await supabase
        .from("claim")
        .update({ embedding })
        .eq("id", claim.id);

      if (updateError) throw new Error(updateError.message);

      done += 1;
      console.log(`✓ ${label}`);
    } catch (err) {
      failed += 1;
      console.error(`✗ ${label} —`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nTerminé : ${done} réussi(s), ${failed} échoué(s).`);
}

async function generateWithRetry(text: string, attempt = 1): Promise<number[]> {
  try {
    return await embedDocument(text);
  } catch (err) {
    if (attempt >= 2) throw err;
    console.warn(`  retry après échec (tentative ${attempt})...`);
    return generateWithRetry(text, attempt + 1);
  }
}

main().catch((err) => {
  console.error("Échec du script :", err);
  process.exit(1);
});
