import { supabaseServer } from "@/lib/supabase";
import type { Maladie } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("maladies")
    .select("id, nom, symptomes, description")
    .order("nom", { ascending: true })
    .returns<Maladie[]>();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ maladies: data });
}
