"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  computeForceAttestation,
  explainSyntheseStatus,
  FORCE_LABELS,
  GRADE_LABELS,
} from "@/lib/synthese";
import type { LaboratoireData } from "@/lib/laboratoire";
import { PipelineNode, PipelineArrow } from "./PipelineNode";
import { UncalculatedNode } from "./UncalculatedNode";
import { UncomputedNodesStrip } from "./UncomputedNodesStrip";
import { OutputPanel } from "./OutputPanel";

const MODE_LABELS: Record<string, string> = {
  decoction: "Décoction",
  infusion: "Infusion",
  maceration: "Macération",
  poudre: "Poudre",
  cataplasme: "Cataplasme",
  application_directe: "Application directe",
  autre: "Autre préparation",
};

// Mode simple (§5 du brief) : entrée, traversée, sortie, toujours le
// vrai résultat calculé sur les données réelles — pas de bouton, pas de
// paramètre. Mode expert : le graphe complet, y compris les nœuds
// absents nommés un par un, et surtout la manipulabilité — "changer un
// paramètre en direct et voir le résultat se recalculer" (§5, "le seul
// élément non négociable de la page"). Avec les données actuelles, le
// seul paramètre honnêtement manipulable est l'inclusion ou non d'un
// nœud de preuve dans l'agrégation (② Attestation, ⑨ Littérature) — on
// ne simule pas une pharmacocinétique qu'on n'a pas les données pour
// calculer.
export function LaboratoirePipeline({ data }: { data: LaboratoireData }) {
  const [mode, setMode] = useState<"simple" | "expert">("simple");
  const [inclureAttestation, setInclureAttestation] = useState(true);
  const [inclureLitterature, setInclureLitterature] = useState(true);

  const forceReelle = computeForceAttestation(data.stats, false);
  const force = mode === "expert" && !inclureAttestation ? "non_renseignee" : forceReelle;
  const qualite = mode === "expert" && !inclureLitterature ? null : data.qualitePreuveScientifique;

  const { statut, raisonnement } = useMemo(
    () => explainSyntheseStatus(qualite, force, data.contreIndicationForte, data.divergenceNote),
    [qualite, force, data.contreIndicationForte, data.divergenceNote]
  );

  const raisonnementAffiche = [
    ...(mode === "expert" && !inclureAttestation ? ["Nœud ② exclu manuellement de l'agrégation."] : []),
    ...(mode === "expert" && !inclureLitterature ? ["Nœud ⑨ exclu manuellement de l'agrégation."] : []),
    ...raisonnement,
  ];

  const composeAvecCible = data.composes.find((c) => c.cibles.length > 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-1 rounded-xl border border-neutral-200 bg-white p-0.5 text-sm dark:border-neutral-700 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setMode("simple")}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            mode === "simple" ? "bg-emerald-600 text-white" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Mode simple
        </button>
        <button
          type="button"
          onClick={() => setMode("expert")}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            mode === "expert" ? "bg-emerald-600 text-white" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Mode expert
        </button>
      </div>

      <div className="space-y-1">
        <PipelineNode
          numero="①"
          titre="Résolution taxonomique"
          entree={`"${data.nomPrincipal}" (nom recherché)`}
          sortie={`${data.taxon.nomScientifique}${data.taxon.autorite ? ` ${data.taxon.autorite}` : ""}${
            data.taxon.famille ? ` — ${data.taxon.famille}` : ""
          }`}
        >
          {data.autresNoms.length > 0 && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Autres noms connus : {data.autresNoms.map((n) => `${n.libelle} (${n.langue})`).join(", ")}
            </p>
          )}
        </PipelineNode>
        <PipelineArrow />

        <PipelineNode
          numero="②"
          titre="Attestation traditionnelle"
          entree={`${data.taxon.nomScientifique} × ${data.indication.nom}`}
          sortie={
            mode === "expert" && !inclureAttestation
              ? "Exclu — traité comme non renseigné"
              : `${FORCE_LABELS[forceReelle]} — ${data.stats.attestations_count} attestation${data.stats.attestations_count > 1 ? "s" : ""}, ${data.stats.lignees_distinctes} tradition${data.stats.lignees_distinctes > 1 ? "s" : ""} indépendante${data.stats.lignees_distinctes > 1 ? "s" : ""}`
          }
          toggle={
            mode === "expert"
              ? { enabled: inclureAttestation, onToggle: () => setInclureAttestation((v) => !v), label: "Inclure" }
              : undefined
          }
        >
          {data.attestations.length > 0 ? (
            <ul className="space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {data.attestations.map((a) => (
                <li key={a.id}>
                  {[a.region, a.langue].filter(Boolean).join(", ") || "Origine non précisée"}
                  {a.contributeur?.preferenceAttribution === "nommement" && a.contributeur.nomAffichage
                    ? ` — ${a.contributeur.nomAffichage}`
                    : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-neutral-400 dark:text-neutral-500">
              Aucune attestation traditionnelle enregistrée pour l&apos;instant.
            </p>
          )}
        </PipelineNode>
        <PipelineArrow />

        {mode === "simple" ? (
          <>
            <UncomputedNodesStrip />
            <PipelineArrow />
          </>
        ) : (
          <>
            {data.composes.length > 0 ? (
              <PipelineNode
                numero="③"
                titre="Profil phytochimique"
                entree={`${data.taxon.nomScientifique}, partie : ${data.partie.nom}`}
                sortie={`${data.composes.length} composé${data.composes.length > 1 ? "s" : ""} identifié${data.composes.length > 1 ? "s" : ""}`}
              >
                <ul className="space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {data.composes.map((c) => (
                    <li key={c.id}>
                      {c.nom}
                      {c.methode_identification ? ` — ${c.methode_identification}` : ""}
                    </li>
                  ))}
                </ul>
              </PipelineNode>
            ) : (
              <UncalculatedNode
                numero="③"
                titre="Profil phytochimique"
                raison="Aucun composé chimique identifié n'est encore documenté pour cette plante dans la base."
              />
            )}
            <PipelineArrow />

            <UncalculatedNode
              numero="④"
              titre="Cinétique d'extraction"
              raison="Modèle physique à données rares (PINN) — aucune donnée expérimentale d'extraction (solvant/durée/température → fraction extraite) en base."
            />
            <PipelineArrow />

            <UncalculatedNode
              numero="⑤"
              titre="Filtre ADME"
              raison="Dépend du nœud ④ : biodisponibilité, perméabilité, demi-vie non calculables sans profil d'extraction."
            />
            <PipelineArrow />

            {composeAvecCible ? (
              <PipelineNode
                numero="⑥"
                titre="Cibles moléculaires"
                entree={composeAvecCible.nom}
                sortie={`${composeAvecCible.cibles.length} cible${composeAvecCible.cibles.length > 1 ? "s" : ""} documentée${composeAvecCible.cibles.length > 1 ? "s" : ""}`}
              >
                <ul className="space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {composeAvecCible.cibles.map((c) => (
                    <li key={c.id}>
                      {c.proteine}
                      {c.affinite ? ` (${c.affinite})` : ""}
                    </li>
                  ))}
                </ul>
              </PipelineNode>
            ) : (
              <UncalculatedNode
                numero="⑥"
                titre="Cibles moléculaires"
                raison="Aucune cible biologique documentée pour les composés connus de cette plante."
              />
            )}
            <PipelineArrow />

            <UncalculatedNode
              numero="⑦"
              titre="Cartographie pathologie"
              raison="Le modèle de données actuel n'a pas encore de correspondance indication → voies biologiques."
            />
            <PipelineArrow />

            <UncalculatedNode
              numero="⑧"
              titre="Convergence réseau"
              raison="Dépend des nœuds ⑥ et ⑦ — non calculable tant qu'ils ne sont pas peuplés pour ce couple."
            />
            <PipelineArrow />
          </>
        )}

        <PipelineNode
          numero="⑨"
          titre="Littérature"
          entree={`${data.taxon.nomScientifique} × ${data.indication.nom}`}
          sortie={
            mode === "expert" && !inclureLitterature
              ? "Exclu — traité comme non évalué"
              : `Qualité GRADE : ${data.qualitePreuveScientifique ? GRADE_LABELS[data.qualitePreuveScientifique] : "non évaluée"} — ${data.etudes.length} étude${data.etudes.length > 1 ? "s" : ""}`
          }
          toggle={
            mode === "expert"
              ? { enabled: inclureLitterature, onToggle: () => setInclureLitterature((v) => !v), label: "Inclure" }
              : undefined
          }
        />
        <PipelineArrow />

        <PipelineNode
          numero="⑪"
          titre="Contrôle sécurité"
          entree={`${data.taxon.nomScientifique}, préparation : ${MODE_LABELS[data.preparation.mode] ?? data.preparation.mode}`}
          sortie={
            data.contreIndicationForte
              ? "Contre-indication détectée — bloque la sortie"
              : "Aucune contre-indication forte enregistrée"
          }
        >
          {mode === "expert" && (
            <p className="mb-1.5 text-xs italic text-neutral-400 dark:text-neutral-500">
              Non manipulable — la sortie de ce nœud prime toujours sur le reste (§8 du brief).
            </p>
          )}
          {(data.precautions || data.preparation.precautionsSpecifiques) && (
            <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              {[data.precautions, data.preparation.precautionsSpecifiques].filter(Boolean).join(" ")}
            </p>
          )}
        </PipelineNode>
        <PipelineArrow />

        <OutputPanel
          statut={statut}
          raisonnement={raisonnementAffiche}
          etudes={mode === "expert" && !inclureLitterature ? [] : data.etudes}
          attestationsCount={mode === "expert" && !inclureAttestation ? 0 : data.stats.attestations_count}
          chatHref={`/chat?q=${encodeURIComponent(`Parle-moi de ${data.nomPrincipal} pour ${data.indication.nom}`)}`}
        />
      </div>

      {mode === "expert" && (
        <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
          <Link href={`/laboratoire/${data.claimId}`} className="hover:underline">
            Réinitialiser la simulation
          </Link>
        </p>
      )}
    </div>
  );
}
