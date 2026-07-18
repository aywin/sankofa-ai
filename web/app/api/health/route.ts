import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const { count, error } = await supabaseServer
    .from("maladies")
    .select("*", { count: "exact", head: true });

  if (error) {
    return Response.json(
      { status: "error", database: "unreachable", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    status: "ok",
    database: "connected",
    maladies_count: count,
  });
}
