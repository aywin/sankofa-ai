import { supabaseServer } from "@/lib/supabase";
import type { Indication } from "@/lib/types";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("indication")
    .select("id, nom, symptomes, description")
    .order("nom", { ascending: true })
    .returns<Indication[]>();

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ maladies: data });
}
