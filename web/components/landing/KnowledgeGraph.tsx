import { supabaseServer } from "@/lib/supabase";

// Visuel signature du hero : le graphe plante↔indication réellement en
// base, pas une illustration de stock — "montrer la donnée, pas
// l'interface". Pensé pour vivre sur le fond encre du hero (§ identité
// visuelle) : vert émeraude clair pour les plantes, doré de latérite
// pour les indications, forts assez pour porter la section à eux seuls.

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
            strokeWidth={c.est_pilote ? 1.8 : 1}
            className={c.est_pilote ? "text-emerald-400/90" : "text-emerald-400/30"}
          />
        );
      })}

      {taxonPoints.map((p, i) => (
        <circle key={`t-${i}`} cx={p.x} cy={p.y} r={5} className="fill-emerald-400" />
      ))}

      {indicationRows.map((row, i) => {
        const p = indicationPoints[i];
        const labelAbove = p.y < center;
        return (
          <g key={row.id}>
            <circle cx={p.x} cy={p.y} r={7.5} className="fill-laterite-400" stroke="var(--color-ink-950)" strokeWidth={3} />
            <text
              x={p.x}
              y={labelAbove ? p.y - 14 : p.y + 24}
              textAnchor="middle"
              className="fill-sand-50 text-[15px] font-medium"
            >
              {row.nom}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
