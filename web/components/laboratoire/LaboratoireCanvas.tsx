"use client";

import { useState } from "react";
import Link from "next/link";
import { CanvasNode, CanvasEdge, type NodeState } from "./CanvasNode";
import { UncalculatedNode } from "./UncalculatedNode";
import {
  computeForceAttestation,
  forceLabelGrandPublic,
  qualiteLabelGrandPublic,
  FORCE_LABELS,
  GRADE_LABELS,
} from "@/lib/synthese";
import type { LaboratoireData } from "@/lib/laboratoire";

const MODE_LABELS: Record<string, string> = {
  decoction: "Décoction",
  infusion: "Infusion",
  maceration: "Macération",
  poudre: "Poudre",
  cataplasme: "Cataplasme",
  application_directe: "Application directe",
  autre: "Autre préparation",
};

// Positions fixes — 6 nœuds toujours au même endroit, pas de calcul de
// mise en page dynamique (lafi-best.md P7 : "un vrai graphe... écris le
// canvas en SVG à la main").
const POS = {
  1: { x: 60, y: 130 },
  2: { x: 260, y: 55 },
  3: { x: 260, y: 205 },
  4: { x: 460, y: 130 },
  5: { x: 650, y: 130 },
  6: { x: 830, y: 130 },
} as const;

const EDGES: { from: keyof typeof POS; to: keyof typeof POS }[] = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
];

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const midX = (from.x + to.x) / 2;
  return `M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Phase = "idle" | "running" | "done";

export function LaboratoireCanvas({
  data,
  resultatInitial,
}: {
  data: LaboratoireData;
  // Chargé depuis un lien permanent (?execution=...) — affiche
  // directement le résultat déjà calculé, sans relancer l'animation ni
  // un nouvel appel au modèle (reproductibilité, lafi-best.md P9).
  resultatInitial?: { texte: string; origine: string; executionId: string } | null;
}) {
  const [mode, setMode] = useState<"simple" | "expert">("simple");
  const [phase, setPhase] = useState<Phase>(resultatInitial ? "done" : "idle");
  const [nodeStates, setNodeStates] = useState<Record<number, NodeState>>(
    resultatInitial
      ? { 1: "done", 2: "done", 3: "done", 4: "done", 5: "done", 6: data.contreIndicationForte ? "alert" : "done" }
      : { 1: "idle", 2: "idle", 3: "idle", 4: "idle", 5: "idle", 6: "idle" }
  );
  const [edgesDone, setEdgesDone] = useState<Set<number>>(resultatInitial ? new Set([0, 1, 2, 3, 4, 5]) : new Set());
  const [noteLibre, setNoteLibre] = useState("");
  const [resultat, setResultat] = useState<{ texte: string; origine: string; executionId: string } | null>(
    resultatInitial ?? null
  );
  const [expertNode, setExpertNode] = useState<number | null>(null);
  const [format, setFormat] = useState<"texte" | "pdf" | "word">("texte");

  const force = computeForceAttestation(data.stats, false);
  const preparationResume = `${MODE_LABELS[data.preparation.mode] ?? data.preparation.mode} de ${data.partie.nom}`;

  const lancer = async () => {
    setPhase("running");
    setResultat(null);
    setNodeStates({ 1: "done", 2: "idle", 3: "idle", 4: "idle", 5: "idle", 6: "idle" });
    setEdgesDone(new Set());

    await delay(300);
    setNodeStates((s) => ({ ...s, 2: "active", 3: "active" }));
    setEdgesDone((s) => new Set(s).add(0).add(1));

    await delay(600);
    setNodeStates((s) => ({ ...s, 2: "done", 3: "done", 4: "active" }));
    setEdgesDone((s) => new Set(s).add(2).add(3));

    await delay(600);
    setNodeStates((s) => ({ ...s, 4: "done", 5: "active" }));
    setEdgesDone((s) => new Set(s).add(4));

    try {
      const res = await fetch("/api/laboratoire/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: data.claimId, noteLibre: noteLibre || undefined }),
      });
      const json = await res.json();
      setResultat(json);
      setNodeStates((s) => ({ ...s, 5: "done", 6: data.contreIndicationForte ? "alert" : "done" }));
    } catch {
      setResultat({
        texte: "Une erreur est survenue pendant la génération. Réessaie dans un instant.",
        origine: "repli_deterministe",
        executionId: "",
      });
      setNodeStates((s) => ({ ...s, 5: "done", 6: "alert" }));
    }
    setEdgesDone((s) => new Set(s).add(5));
    setPhase("done");
  };

  const nodeDetail = (numero: number) => {
    switch (numero) {
      case 1:
        return {
          titre: "Sélection",
          technique: "Résolution taxonomique",
          entree: `"${data.nomPrincipal}" × "${data.indication.nom}"`,
          sortie: `${data.taxon.nomScientifique}${data.taxon.autorite ? ` ${data.taxon.autorite}` : ""} — ${data.indication.nom}`,
        };
      case 2:
        return {
          titre: "Ce que disent les tradipraticiens",
          technique: "Attestation traditionnelle",
          entree: `${data.taxon.nomScientifique} × ${data.indication.nom}`,
          sortie: `${FORCE_LABELS[force]} — ${data.stats.attestations_count} attestation${data.stats.attestations_count > 1 ? "s" : ""} comptée${data.stats.attestations_count > 1 ? "s" : ""}`,
        };
      case 3:
        return {
          titre: "Ce que dit la science",
          technique: "Littérature",
          entree: `${data.taxon.nomScientifique} × ${data.indication.nom}`,
          sortie: `${data.qualitePreuveScientifique ? GRADE_LABELS[data.qualitePreuveScientifique] : "non évaluée"} — ${data.etudes.length} étude${data.etudes.length > 1 ? "s" : ""}`,
        };
      case 4:
        return {
          titre: "Ce qui correspond",
          technique: "Croisement",
          entree: "Sorties des nœuds 2 et 3",
          sortie: `${forceLabelGrandPublic(force)} · ${qualiteLabelGrandPublic(data.qualitePreuveScientifique)} — jamais fusionnés en un seul mot`,
        };
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-1 rounded-xl border border-neutral-200 bg-white p-0.5 text-sm dark:border-neutral-700 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setMode("simple")}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${mode === "simple" ? "bg-emerald-600 text-white" : "text-neutral-500 dark:text-neutral-400"}`}
        >
          Mode simple
        </button>
        <button
          type="button"
          onClick={() => setMode("expert")}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${mode === "expert" ? "bg-emerald-600 text-white" : "text-neutral-500 dark:text-neutral-400"}`}
        >
          Mode expert
        </button>
      </div>

      {/* Bandeau sécurité — traverse tout le canvas, jamais un nœud parmi
          d'autres (lafi-best.md P7 : "le fait que le contrôle existe est
          un signal de confiance, il doit se voir"). */}
      <div
        className={`mb-3 rounded-xl px-4 py-2.5 text-center text-sm font-medium ${
          data.contreIndicationForte
            ? "bg-red-600 text-white"
            : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        }`}
      >
        {data.contreIndicationForte
          ? "⚠️ Contrôle sécurité — contre-indication signalée pour cette préparation"
          : "✓ Contrôle sécurité — aucune contre-indication forte enregistrée"}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200/70 bg-white p-2 dark:border-neutral-800/70 dark:bg-neutral-900/40">
        <svg viewBox="0 0 890 260" className="h-auto w-full min-w-[640px]">
          {EDGES.map((e, i) => (
            <CanvasEdge key={i} d={edgePath(POS[e.from], POS[e.to])} actif={edgesDone.has(i)} />
          ))}
          <CanvasNode x={POS[1].x} y={POS[1].y} numero={1} lignesLabel={["Sélection"]} state={nodeStates[1]} />
          <CanvasNode
            x={POS[2].x}
            y={POS[2].y}
            numero={2}
            lignesLabel={["Ce que disent", "les tradipraticiens"]}
            state={nodeStates[2]}
            clickable={mode === "expert"}
            onClick={() => setExpertNode(2)}
          />
          <CanvasNode
            x={POS[3].x}
            y={POS[3].y}
            numero={3}
            lignesLabel={["Ce que dit", "la science"]}
            state={nodeStates[3]}
            clickable={mode === "expert"}
            onClick={() => setExpertNode(3)}
          />
          <CanvasNode
            x={POS[4].x}
            y={POS[4].y}
            numero={4}
            lignesLabel={["Ce qui", "correspond"]}
            state={nodeStates[4]}
            clickable={mode === "expert"}
            onClick={() => setExpertNode(4)}
          />
          <CanvasNode x={POS[5].x} y={POS[5].y} numero={5} lignesLabel={["Analyse"]} state={nodeStates[5]} />
          <CanvasNode x={POS[6].x} y={POS[6].y} numero={6} lignesLabel={["Résultat"]} state={nodeStates[6]} />
        </svg>
      </div>

      {mode === "expert" && expertNode && nodeDetail(expertNode) && (
        <div className="mt-3 rounded-xl border border-neutral-200/70 bg-neutral-50/60 p-3 text-sm dark:border-neutral-800/70 dark:bg-neutral-900/40">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {nodeDetail(expertNode)!.titre} — nom technique : {nodeDetail(expertNode)!.technique}
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
            Entrée : {nodeDetail(expertNode)!.entree}
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">Sortie : {nodeDetail(expertNode)!.sortie}</p>
        </div>
      )}

      {mode === "expert" && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Nœuds complémentaires, hors canvas principal
          </p>
          {data.composes.length > 0 ? (
            <div className="rounded-xl border border-neutral-200/70 p-3 text-xs text-neutral-600 dark:border-neutral-800/70 dark:text-neutral-300">
              Profil phytochimique connu : {data.composes.map((c) => c.nom).join(", ")}
            </div>
          ) : (
            <UncalculatedNode numero="③" titre="Profil phytochimique" raison="Aucun composé chimique identifié n'est encore documenté pour cette plante." />
          )}
          <UncalculatedNode numero="④⑤" titre="Cinétique d'extraction / Filtre ADME" raison="Données d'extraction et de biodisponibilité absentes du modèle actuel." />
          <UncalculatedNode numero="⑦⑧" titre="Cartographie pathologie / Convergence réseau" raison="Pas encore de correspondance indication → voies biologiques dans le modèle de données." />
        </div>
      )}

      {phase === "idle" && (
        <div className="mt-4">
          <textarea
            value={noteLibre}
            onChange={(e) => setNoteLibre(e.target.value)}
            placeholder="Un détail à ajouter avant de lancer ? (optionnel)"
            rows={2}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={lancer}
            className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Lancer
          </button>
        </div>
      )}

      {phase === "running" && !resultat && (
        <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">Analyse en cours…</p>
      )}

      {resultat && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-200 bg-white p-5 dark:border-emerald-900 dark:bg-neutral-950">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Résultat
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">{resultat.texte}</p>

          {data.etudes.length > 0 && (
            <div className="mt-4 border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Justificatifs
              </p>
              <ul className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                {data.etudes.map((e) => (
                  <li key={e.id}>
                    {e.url ? (
                      <a href={e.url} target="_blank" rel="noreferrer" className="italic underline-offset-2 hover:underline">
                        {e.titre}
                      </a>
                    ) : (
                      <span className="italic">{e.titre}</span>
                    )}{" "}
                    <span className="not-italic">(titre original de l&apos;étude)</span>
                    {e.annee ? ` — ${e.annee}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Format :</span>
            {(["texte", "pdf", "word"] as const).map((f) => (
              <button
                key={f}
                type="button"
                disabled={f !== "texte"}
                onClick={() => setFormat(f)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  f === format ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-900"
                } ${f !== "texte" ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {f === "texte" ? "Texte" : f === "pdf" ? "PDF (bientôt)" : "Word (bientôt)"}
              </button>
            ))}
          </div>

          {resultat.executionId && (
            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              <Link href={`/laboratoire/${data.claimId}?execution=${resultat.executionId}`} className="hover:underline">
                Lien permanent vers ce résultat
              </Link>
            </p>
          )}

          <Link
            href={`/chat?q=${encodeURIComponent(`Parle-moi de ${data.nomPrincipal} pour ${data.indication.nom}`)}`}
            className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            En discuter avec Lafi
          </Link>
          <p className="mt-4">
            <button
              type="button"
              onClick={() => {
                setPhase("idle");
                setResultat(null);
                setNodeStates({ 1: "idle", 2: "idle", 3: "idle", 4: "idle", 5: "idle", 6: "idle" });
              }}
              className="text-xs text-neutral-400 hover:underline dark:text-neutral-500"
            >
              Relancer
            </button>
          </p>
        </div>
      )}

      {!data.estPilote && (
        <p className="mt-4 rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
          Couple issu du corpus documentaire initial — pas encore enrichi de vraies données de terrain ni d&apos;une
          évaluation de la qualité de preuve. Préparation : {preparationResume}.
        </p>
      )}
    </div>
  );
}
