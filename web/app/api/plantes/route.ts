import { supabaseServer } from "@/lib/supabase";
import type { Taxon } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("taxon")
    .select("id, slug, nom_scientifique, description, precautions")
    .order("nom_scientifique", { ascending: true })
    .returns<Taxon[]>();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ plantes: data });
}
