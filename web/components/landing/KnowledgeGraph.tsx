import { supabaseServer } from "@/lib/supabase";

// Visuel signature du hero : le graphe plante↔indication réellement en
// base, pas une illustration de stock — "montrer la donnée, pas
// l'interface". Rendu comme un vrai bandeau visuel à part entière (pas
// un filigrane derrière le texte) : c'est ce qui le rend lisible plutôt
// que décoratif.

interface Point {
  x: number;
  y: number;
}

function pointsOnCircle(n: number, radius: number, cx: number, cy: number, startAngle = -90): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = ((startAngle + (360 / n) * i) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

export async function KnowledgeGraph() {
  const [{ data: taxons }, { data: indications }, { data: claims }] = await Promise.all([
    supabaseServer.from("taxon").select("id"),
    supabaseServer.from("indication").select("id, nom"),
    supabaseServer.from("claim").select("taxon_id, indication_id, est_pilote"),
  ]);

  const taxonIds = (taxons ?? []).map((t) => t.id);
  const indicationRows = indications ?? [];
  if (taxonIds.length === 0 || indicationRows.length === 0) return null;

  const size = 640;
  const center = size / 2;
  const taxonPoints = pointsOnCircle(taxonIds.length, 270, center, center);
  const indicationPoints = pointsOnCircle(indicationRows.length, 130, center, center);

  const taxonIndex = new Map(taxonIds.map((id, i) => [id, taxonPoints[i]]));
  const indicationIndex = new Map(indicationRows.map((row, i) => [row.id, indicationPoints[i]]));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full overflow-visible">
      <title>Graphe des usages traditionnels documentés par Lafi (plantes et indications réelles)</title>
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
            strokeWidth={c.est_pilote ? 1.6 : 0.9}
            className={c.est_pilote ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-emerald-600/35 dark:text-emerald-400/35"}
          />
        );
      })}

      {taxonPoints.map((p, i) => (
        <circle key={`t-${i}`} cx={p.x} cy={p.y} r={4.5} className="fill-emerald-700 dark:fill-emerald-400" />
      ))}

      {indicationRows.map((row, i) => {
        const p = indicationPoints[i];
        const labelAbove = p.y < center;
        return (
          <g key={row.id}>
            <circle cx={p.x} cy={p.y} r={7} className="fill-amber-500" stroke="var(--color-sand-50)" strokeWidth={3} />
            <text
              x={p.x}
              y={labelAbove ? p.y - 14 : p.y + 22}
              textAnchor="middle"
              className="fill-neutral-700 text-[15px] font-medium dark:fill-neutral-200"
            >
              {row.nom}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
