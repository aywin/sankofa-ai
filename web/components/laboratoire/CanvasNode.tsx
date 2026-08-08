export type NodeState = "idle" | "active" | "done" | "alert";

const RING_BY_STATE: Record<NodeState, string> = {
  idle: "stroke-neutral-300 dark:stroke-neutral-700",
  active: "stroke-emerald-500 animate-pulse",
  done: "stroke-emerald-600",
  alert: "stroke-red-500",
};

const FILL_BY_STATE: Record<NodeState, string> = {
  idle: "fill-white dark:fill-neutral-900",
  active: "fill-emerald-50 dark:fill-emerald-950",
  done: "fill-emerald-600",
  alert: "fill-red-50 dark:fill-red-950",
};

const TEXT_BY_STATE: Record<NodeState, string> = {
  idle: "fill-neutral-400 dark:fill-neutral-500",
  active: "fill-emerald-700 dark:fill-emerald-300",
  done: "fill-white",
  alert: "fill-red-600",
};

// Un vrai nœud géométrique (lafi-best.md P7) — cercle relié par des
// connecteurs tracés, pas une carte dans une liste. Le libellé grand
// public vit sous le cercle ; le nom technique et le détail n'existent
// que dans le panneau qui s'ouvre au clic, en mode expert.
export function CanvasNode({
  x,
  y,
  numero,
  lignesLabel,
  state,
  onClick,
  clickable,
}: {
  x: number;
  y: number;
  numero: number;
  lignesLabel: string[];
  state: NodeState;
  onClick?: () => void;
  clickable?: boolean;
}) {
  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={clickable ? onClick : undefined}
      className={clickable ? "cursor-pointer" : ""}
    >
      <circle r={30} strokeWidth={3} className={`transition-colors duration-300 ${RING_BY_STATE[state]} ${FILL_BY_STATE[state]}`} />
      <text textAnchor="middle" dominantBaseline="central" className={`text-sm font-semibold transition-colors duration-300 ${TEXT_BY_STATE[state]}`}>
        {numero}
      </text>
      <text textAnchor="middle" y={52} className="fill-neutral-700 text-[12px] font-medium dark:fill-neutral-200">
        {lignesLabel.map((ligne, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : 14}>
            {ligne}
          </tspan>
        ))}
      </text>
    </g>
  );
}

// Connecteur tracé, avec un "remplissage" progressif via pathLength (une
// technique SVG standard qui marche quelle que soit la géométrie réelle
// du chemin — pas besoin de calculer sa longueur à la main).
export function CanvasEdge({ d, actif }: { d: string; actif: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={actif ? 0 : 1}
      className={`stroke-2 transition-[stroke-dashoffset] duration-500 ${
        actif ? "stroke-emerald-500" : "stroke-neutral-300 dark:stroke-neutral-700"
      }`}
    />
  );
}
