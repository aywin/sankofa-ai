import { supabaseServer } from "@/lib/supabase";

// Visuel signature du hero : le graphe plante↔indication réellement en
// base, pas une illustration de stock. Décision prise tôt dans la
// conception de la landing : "chaque page dit qu'on est un labo, pas une
// startup" passe par ce genre de détail — montrer la donnée, pas
// l'interface.

interface Node {
  x: number;
  y: number;
}

function pointsOnCircle(n: number, radius: number, cx: number, cy: number, startAngle = -90): Node[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = ((startAngle + (360 / n) * i) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

export async function KnowledgeGraph() {
  const [{ data: taxons }, { data: indications }, { data: claims }] = await Promise.all([
    supabaseServer.from("taxon").select("id"),
    supabaseServer.from("indication").select("id"),
    supabaseServer.from("claim").select("taxon_id, indication_id, est_pilote"),
  ]);

  const taxonIds = (taxons ?? []).map((t) => t.id);
  const indicationIds = (indications ?? []).map((i) => i.id);
  if (taxonIds.length === 0 || indicationIds.length === 0) return null;

  const size = 560;
  const center = size / 2;
  const taxonPoints = pointsOnCircle(taxonIds.length, 250, center, center);
  const indicationPoints = pointsOnCircle(indicationIds.length, 120, center, center);

  const taxonIndex = new Map(taxonIds.map((id, i) => [id, taxonPoints[i]]));
  const indicationIndex = new Map(indicationIds.map((id, i) => [id, indicationPoints[i]]));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden>
      {(claims ?? []).map((c, i) => {
        const from = taxonIndex.get(c.taxon_id);
        const to = indicationIndex.get(c.indication_id);
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="currentColor"
            strokeWidth={c.est_pilote ? 1.1 : 0.5}
            className={c.est_pilote ? "text-emerald-500/60" : "text-emerald-500/20"}
          />
        );
      })}
      {indicationPoints.map((p, i) => (
        <circle key={`i-${i}`} cx={p.x} cy={p.y} r={5} className="fill-amber-500" />
      ))}
      {taxonPoints.map((p, i) => (
        <circle key={`t-${i}`} cx={p.x} cy={p.y} r={3.5} className="fill-emerald-600 dark:fill-emerald-400" />
      ))}
    </svg>
  );
}
