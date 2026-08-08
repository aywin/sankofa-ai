"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CanvasNode, CanvasEdge, type NodeState } from "@/components/laboratoire/CanvasNode";
import type { SynergieData } from "@/lib/synergies";
import type { TaxonEligible } from "@/lib/synergies";

// Positions et connecteurs — deux profils en parallèle qui convergent
// vers un recoupement factuel, puis une hypothèse. Même mécanique
// visuelle que le Laboratoire (components/laboratoire/CanvasNode), mais
// un accent violet dédié pour ne jamais se confondre avec lui : ceci
// n'est jamais un usage attesté.
const POS = {
  1: { x: 70, y: 75 },
  2: { x: 70, y: 235 },
  3: { x: 300, y: 75 },
  4: { x: 300, y: 235 },
  5: { x: 520, y: 155 },
  6: { x: 730, y: 155 },
} as const;

const EDGES: { from: keyof typeof POS; to: keyof typeof POS }[] = [
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
];

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const midX = (from.x + to.x) / 2;
  return `M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Phase = "idle" | "running" | "done";
const NODE_IDLE: Record<number, NodeState> = { 1: "done", 2: "done", 3: "idle", 4: "idle", 5: "idle", 6: "idle" };

export function SynergiesCanvas({ initialData, taxa }: { initialData: SynergieData; taxa: TaxonEligible[] }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [taxonAId, setTaxonAId] = useState(initialData.taxonA.taxonId);
  const [taxonBId, setTaxonBId] = useState(initialData.taxonB.taxonId);

  const [phase, setPhase] = useState<Phase>("idle");
  const [nodeStates, setNodeStates] = useState<Record<number, NodeState>>(NODE_IDLE);
  const [edgesDone, setEdgesDone] = useState<Set<number>>(new Set());
  const [noteLibre, setNoteLibre] = useState("");
  const [resultat, setResultat] = useState<{ texte: string; origine: string; executionId: string } | null>(null);
  const [openNode, setOpenNode] = useState<number | null>(null);

  useEffect(() => {
    if (taxonAId === taxonBId || (taxonAId === data.taxonA.taxonId && taxonBId === data.taxonB.taxonId)) return;

    let annule = false;
    Promise.resolve()
      .then(() => setSelectionLoading(true))
      .then(() => fetch(`/api/synergies/data?taxonAId=${taxonAId}&taxonBId=${taxonBId}`))
      .then((res) => (res.ok ? res.json() : null))
      .then((json: SynergieData | null) => {
        if (annule || !json) return;
        setData(json);
        setPhase("idle");
        setResultat(null);
        setNodeStates(NODE_IDLE);
        setEdgesDone(new Set());
        setOpenNode(null);
        router.replace(`/synergies?a=${taxonAId}&b=${taxonBId}`, { scroll: false });
      })
      .finally(() => {
        if (!annule) setSelectionLoading(false);
      });

    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxonAId, taxonBId]);

  const optionsA = useMemo(() => taxa.filter((t) => t.id !== taxonBId), [taxa, taxonBId]);
  const optionsB = useMemo(() => taxa.filter((t) => t.id !== taxonAId), [taxa, taxonAId]);
  const nomA = taxa.find((t) => t.id === taxonAId)?.nomPrincipal ?? data.taxonA.nomPrincipal;
  const nomB = taxa.find((t) => t.id === taxonBId)?.nomPrincipal ?? data.taxonB.nomPrincipal;

  const lancer = async () => {
    setPhase("running");
    setResultat(null);
    setOpenNode(null);
    setNodeStates(NODE_IDLE);
    setEdgesDone(new Set());

    await delay(300);
    setNodeStates((s) => ({ ...s, 3: "active", 4: "active" }));
    setEdgesDone((s) => new Set(s).add(0).add(1));

    await delay(500);
    setNodeStates((s) => ({ ...s, 3: "done", 4: "done", 5: "active" }));
    setEdgesDone((s) => new Set(s).add(2).add(3));

    await delay(400);
    setNodeStates((s) => ({ ...s, 5: "done", 6: "active" }));
    setEdgesDone((s) => new Set(s).add(4));

    try {
      const res = await fetch("/api/synergies/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxonAId, taxonBId, noteLibre: noteLibre || undefined }),
      });
      const json = await res.json();
      setResultat(json);
      setNodeStates((s) => ({ ...s, 6: "done" }));
    } catch {
      setResultat({
        texte: "Une erreur est survenue pendant la génération. Réessaie dans un instant.",
        origine: "repli_deterministe",
        executionId: "",
      });
      setNodeStates((s) => ({ ...s, 6: "alert" }));
    }
    setPhase("done");
  };

  const nodeDetail = (numero: number) => {
    switch (numero) {
      case 3:
        return {
          titre: `Profil chimique — ${data.taxonA.nomPrincipal}`,
          entree: data.taxonA.nomScientifique,
          sortie: data.taxonA.composes.length > 0 ? data.taxonA.composes.map((c) => c.nom).join(", ") : "Aucun composé documenté",
        };
      case 4:
        return {
          titre: `Profil chimique — ${data.taxonB.nomPrincipal}`,
          entree: data.taxonB.nomScientifique,
          sortie: data.taxonB.composes.length > 0 ? data.taxonB.composes.map((c) => c.nom).join(", ") : "Aucun composé documenté",
        };
      case 5:
        return {
          titre: "Recoupement — calcul factuel, pas une sortie du modèle",
          entree: "Sorties des nœuds 3 et 4",
          sortie:
            data.ciblesCommunes.length > 0
              ? `Cible(s) commune(s) : ${data.ciblesCommunes.join(", ")}`
              : "Aucune cible moléculaire commune identifiée entre les deux profils connus.",
        };
      case 6:
        return {
          titre: "Hypothèse IA — validée avant affichage",
          entree: "Sortie du nœud 5, plus la note libre éventuelle",
          sortie: resultat ? "Texte généré et validé (aucune affirmation d'efficacité, jamais de dose)" : "En attente du lancement",
        };
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-4 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white">
        🧪 Espace expérimental — Lafi croise des profils chimiques déjà documentés et formule une hypothèse.{" "}
        <strong>Ce n&apos;est jamais un usage attesté ni un remède recommandé.</strong>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/70 bg-white p-2 dark:border-neutral-800/70 dark:bg-neutral-900/40">
            <svg viewBox="0 0 850 320" className="h-auto w-full min-w-[640px]">
              {EDGES.map((e, i) => (
                <CanvasEdge key={i} d={edgePath(POS[e.from], POS[e.to])} actif={edgesDone.has(i)} />
              ))}
              <CanvasNode
                x={POS[1].x}
                y={POS[1].y}
                numero={1}
                shape="pill"
                pillCaption="Plante A"
                pillValue={nomA}
                state={nodeStates[1]}
                clickable
                onClick={() => setOpenNode(openNode === 1 ? null : 1)}
              />
              <CanvasNode
                x={POS[2].x}
                y={POS[2].y}
                numero={2}
                shape="pill"
                pillCaption="Plante B"
                pillValue={nomB}
                state={nodeStates[2]}
                clickable
                onClick={() => setOpenNode(openNode === 2 ? null : 2)}
              />
              <CanvasNode
                x={POS[3].x}
                y={POS[3].y}
                numero={3}
                lignesLabel={["Profil", "chimique A"]}
                state={nodeStates[3]}
                clickable
                onClick={() => setOpenNode(openNode === 3 ? null : 3)}
              />
              <CanvasNode
                x={POS[4].x}
                y={POS[4].y}
                numero={4}
                lignesLabel={["Profil", "chimique B"]}
                state={nodeStates[4]}
                clickable
                onClick={() => setOpenNode(openNode === 4 ? null : 4)}
              />
              <CanvasNode
                x={POS[5].x}
                y={POS[5].y}
                numero={5}
                shape="diamond"
                lignesLabel={["Recoupe-", "ment"]}
                state={nodeStates[5]}
                clickable
                onClick={() => setOpenNode(openNode === 5 ? null : 5)}
              />
              <CanvasNode
                x={POS[6].x}
                y={POS[6].y}
                numero={6}
                lignesLabel={["Hypothèse IA"]}
                state={nodeStates[6]}
                clickable
                onClick={() => setOpenNode(openNode === 6 ? null : 6)}
              />
            </svg>
          </div>

          {selectionLoading && (
            <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">Mise à jour de la paire sélectionnée…</p>
          )}

          {openNode === 1 && (
            <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-900 dark:bg-violet-950/30">
              <label className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-400">Choisir la plante A</label>
              <select
                value={taxonAId}
                onChange={(e) => setTaxonAId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-400 dark:border-neutral-700 dark:bg-neutral-900"
              >
                {optionsA.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nomPrincipal}
                  </option>
                ))}
              </select>
            </div>
          )}

          {openNode === 2 && (
            <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-900 dark:bg-violet-950/30">
              <label className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-400">Choisir la plante B</label>
              <select
                value={taxonBId}
                onChange={(e) => setTaxonBId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-400 dark:border-neutral-700 dark:bg-neutral-900"
              >
                {optionsB.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nomPrincipal}
                  </option>
                ))}
              </select>
            </div>
          )}

          {openNode && openNode >= 3 && nodeDetail(openNode) && (
            <div className="mt-3 rounded-xl border border-neutral-200/70 bg-neutral-50/60 p-3 text-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{nodeDetail(openNode)!.titre}</p>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">Entrée : {nodeDetail(openNode)!.entree}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">Sortie : {nodeDetail(openNode)!.sortie}</p>
            </div>
          )}

          {phase === "idle" && (
            <div className="mt-4">
              <textarea
                value={noteLibre}
                onChange={(e) => setNoteLibre(e.target.value)}
                placeholder="Un détail à ajouter avant de lancer ? (optionnel)"
                rows={2}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                type="button"
                onClick={lancer}
                disabled={selectionLoading}
                className="mt-2 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Croiser ces deux profils
              </button>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-20">
          <div className="rounded-2xl border-2 border-violet-200 bg-white p-5 dark:border-violet-900 dark:bg-neutral-950">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Hypothèse</p>

            {phase === "idle" && !resultat && (
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                En attente du lancement — choisis éventuellement une autre plante ci-contre, puis clique sur « Croiser ces deux profils ».
              </p>
            )}

            {phase === "running" && !resultat && (
              <p className="mt-2 animate-pulse text-sm text-neutral-500 dark:text-neutral-400">Croisement en cours…</p>
            )}

            {resultat && (
              <>
                <p className="mt-2 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
                  Piste de recherche non vérifiée — pas un usage attesté.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">{resultat.texte}</p>

                <div className="mt-4 border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Recoupement factuel</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    {data.ciblesCommunes.length > 0
                      ? `Cible(s) commune(s) déjà documentée(s) : ${data.ciblesCommunes.join(", ")}.`
                      : "Aucune cible moléculaire commune identifiée entre les deux profils connus."}
                  </p>
                </div>

                <p className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPhase("idle");
                      setResultat(null);
                      setNodeStates(NODE_IDLE);
                      setEdgesDone(new Set());
                    }}
                    className="text-xs text-neutral-400 hover:underline dark:text-neutral-500"
                  >
                    Relancer
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
