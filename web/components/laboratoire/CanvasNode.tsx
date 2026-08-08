export type NodeState = "idle" | "active" | "done" | "alert";
export type NodeShape = "circle" | "pill" | "diamond";

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

// Pill toujours en fond blanc/latérite — c'est un contrôle de sélection,
// pas une étape qui "s'exécute", donc il ne suit pas le cycle idle/actif
// des autres nœuds : soit au repos, soit sélectionné (mis en avant).
const PILL_RING: Record<"repos" | "ouvert", string> = {
  repos: "stroke-laterite-400 dark:stroke-laterite-500",
  ouvert: "stroke-laterite-500",
};
const PILL_FILL: Record<"repos" | "ouvert", string> = {
  repos: "fill-white dark:fill-neutral-900",
  ouvert: "fill-laterite-50 dark:fill-laterite-950",
};

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

// Trois formes distinctes (lafi-best.md P7 + retour utilisateur : "si les
// nœuds pouvaient ne pas avoir la même forme") — le cercle pour les
// étapes qui s'exécutent, la pilule pour les contrôles de sélection
// (plante/indication, cliquables en permanence), le losange pour le
// point de croisement où deux flux se rejoignent.
export function CanvasNode(
  props: {
    x: number;
    y: number;
    numero: number;
    state: NodeState;
    onClick?: () => void;
    clickable?: boolean;
  } & (
    | { shape?: "circle" | "diamond"; lignesLabel: string[]; pillCaption?: undefined; pillValue?: undefined }
    | { shape: "pill"; pillCaption: string; pillValue: string; lignesLabel?: undefined }
  )
) {
  const { x, y, numero, state, onClick, clickable } = props;

  if (props.shape === "pill") {
    const ouvert = state === "active";
    return (
      <g
        transform={`translate(${x},${y})`}
        onClick={clickable ? onClick : undefined}
        className={clickable ? "cursor-pointer" : ""}
      >
        <rect
          x={-58}
          y={-22}
          width={116}
          height={44}
          rx={22}
          strokeWidth={2.5}
          className={`transition-colors duration-200 ${PILL_RING[ouvert ? "ouvert" : "repos"]} ${PILL_FILL[ouvert ? "ouvert" : "repos"]}`}
        />
        <text textAnchor="middle" y={-5} className="fill-laterite-600 text-[9px] font-semibold uppercase tracking-wide dark:fill-laterite-400">
          {props.pillCaption}
        </text>
        <text textAnchor="middle" y={12} className="fill-neutral-800 text-[13px] font-semibold dark:fill-neutral-100">
          {truncate(props.pillValue, 14)} ▾
        </text>
      </g>
    );
  }

  const shape = props.shape ?? "circle";
  const lignesLabel = props.lignesLabel;

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={clickable ? onClick : undefined}
      className={clickable ? "cursor-pointer" : ""}
    >
      {shape === "diamond" ? (
        <g transform="rotate(45)">
          <rect
            x={-24}
            y={-24}
            width={48}
            height={48}
            rx={8}
            strokeWidth={3}
            className={`transition-colors duration-300 ${RING_BY_STATE[state]} ${FILL_BY_STATE[state]}`}
          />
        </g>
      ) : (
        <circle r={30} strokeWidth={3} className={`transition-colors duration-300 ${RING_BY_STATE[state]} ${FILL_BY_STATE[state]}`} />
      )}
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
