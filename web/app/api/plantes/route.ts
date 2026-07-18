import { supabaseServer } from "@/lib/supabase";
import type { Plante } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("plantes")
    .select("id, nom_local, nom_scientifique, description, precautions")
    .order("nom_local", { ascending: true })
    .returns<Plante[]>();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ plantes: data });
}
