"use client";

import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import { LafiMark, LeafIcon } from "./icons";
import { TriageBlock } from "./TriageBlock";
import type { TriageResultat } from "@/lib/triage";
import type { MatchClaimResult, Taxon } from "@/lib/types";

const EXEMPLES = [
  "J'ai de la fièvre et des frissons depuis 2 jours",
  "Comment soigner une plaie qui commence à s'infecter ?",
  "Je n'arrive pas à dormir depuis plusieurs nuits",
  "Quelle plante pour faire baisser la tension ?",
];

interface ToolPart {
  type: string;
  state?: string;
  output?: unknown;
}

interface ToolStep {
  key: string;
  label: string;
  done: boolean;
}

function stepForToolPart(part: ToolPart, index: number): ToolStep {
  const key = `${part.type}-${index}`;
  const isDone = part.state === "output-available";

  if (part.type === "tool-rechercher_par_symptome") {
    if (isDone) {
      const output = part.output as { resultats?: MatchClaimResult[] } | undefined;
      const count = output?.resultats?.length ?? 0;
      return {
        key,
        done: true,
        label:
          count > 0
            ? `${count} usage${count > 1 ? "s" : ""} traditionnel${count > 1 ? "s" : ""} trouvé${count > 1 ? "s" : ""}`
            : "Aucune correspondance trouvée dans le savoir traditionnel",
      };
    }
    return { key, done: false, label: "Consultation du savoir traditionnel…" };
  }

  if (part.type === "tool-obtenir_details_plante") {
    if (isDone) {
      const output = part.output as { plante?: Taxon | null } | undefined;
      return {
        key,
        done: true,
        label: output?.plante
          ? `Fiche de ${output.plante.nom_scientifique} consultée`
          : "Plante introuvable",
      };
    }
    return { key, done: false, label: "Vérification d'une plante…" };
  }

  return { key, done: isDone, label: isDone ? "Étape terminée" : "Étape en cours…" };
}

// Plantes proposées par une réponse — sauf en cas d'urgence : là, seul le
// bloc d'orientation compte, pas de remède.
export function plantesProposees(message: UIMessage): MatchClaimResult[] {
  if (message.role !== "assistant") return [];
  const triage = (message.parts.find((p) => p.type === "data-triage") as { data?: TriageResultat } | undefined)?.data;
  if (triage?.niveau === "urgence") return [];
  return collectPlantResults(message.parts);
}

function hasEmptySearch(parts: ToolPart[]): boolean {
  return parts.some((part) => {
    if (part.type !== "tool-rechercher_par_symptome" || part.state !== "output-available") return false;
    const output = part.output as { resultats?: MatchClaimResult[] } | undefined;
    return (output?.resultats?.length ?? 0) === 0;
  });
}

// Les usages arrivent de deux façons : la recherche faite par le serveur
// avant la génération (part "data-usages") et les relances par l'outil.
export function collectPlantResults(parts: UIMessage["parts"]): MatchClaimResult[] {
  const seen = new Set<string>();
  const results: MatchClaimResult[] = [];

  for (const part of parts as unknown as (ToolPart & { data?: unknown })[]) {
    let resultats: MatchClaimResult[] = [];
    if (part.type === "data-usages") {
      resultats = (part.data as { resultats?: MatchClaimResult[] } | undefined)?.resultats ?? [];
    } else if (part.type === "tool-rechercher_par_symptome" && part.state === "output-available") {
      resultats = (part.output as { resultats?: MatchClaimResult[] } | undefined)?.resultats ?? [];
    }
    for (const r of resultats) {
      if (!seen.has(r.claim_id)) {
        seen.add(r.claim_id);
        results.push(r);
      }
    }
  }

  return results;
}

function ToolSteps({ parts }: { parts: ToolPart[] }) {
  if (parts.length === 0) return null;
  const steps = parts.map(stepForToolPart);

  return (
    <div className="mb-2 space-y-1">
      {steps.map((step) => (
        <p
          key={step.key}
          className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              step.done ? "bg-emerald-500" : "animate-pulse bg-emerald-400"
            }`}
          />
          {step.label}
        </p>
      ))}
    </div>
  );
}

export function ChatMessages({
  messages,
  status,
  onExampleClick,
  onContribute,
  panneauId,
  onBasculerPanneau,
}: {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  onExampleClick: (text: string) => void;
  onContribute: () => void;
  // Réponse dont les plantes sont affichées dans le panneau (null = fermé).
  panneauId: string | null;
  onBasculerPanneau: (messageId: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-[880px] flex-col items-center justify-center gap-4 px-4 text-center">
        <LafiMark className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Décris un symptôme ou une maladie, ou envoie une photo.
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
            Comprendre les usages des plantes, leurs preuves et leurs précautions.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {EXEMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onExampleClick(ex)}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        // La réponse en train de s'écrire : sa carte n'apparaît qu'à la fin,
        // sinon elle s'affiche sous une phrase coupée et le texte la pousse.
        const enCours = index === messages.length - 1 && (status === "submitted" || status === "streaming");
        const textParts = message.parts.filter((p) => p.type === "text");
        const toolParts = message.parts.filter((p) =>
          p.type.startsWith("tool-")
        ) as unknown as ToolPart[];
        const imageParts = message.parts.filter(
          (p): p is Extract<typeof p, { type: "file" }> =>
            p.type === "file" && !!p.mediaType?.startsWith("image/")
        );
        const plantResults = isUser ? [] : plantesProposees(message);
        const noms = [...new Set(plantResults.map((u) => u.nom_principal))];
        const triage = isUser
          ? null
          : ((message.parts.find((p) => p.type === "data-triage") as { data?: TriageResultat } | undefined)?.data ?? null);
        const showContributeCta = !isUser && status === "ready" && hasEmptySearch(toolParts);

        return (
          <div
            key={message.id}
            className={`animate-message-in flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                isUser
                  ? "max-w-[85%] rounded-2xl bg-emerald-600 px-4 py-2.5 text-white"
                  : "w-full text-neutral-900 dark:text-neutral-100"
              }
            >
              {imageParts.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {imageParts.map((part, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={part.url}
                      alt={part.filename ?? "Photo envoyée"}
                      className="h-32 w-32 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}

              {triage && <TriageBlock triage={triage} />}

              {!isUser && <ToolSteps parts={toolParts} />}

              {showContributeCta && (
                <button
                  type="button"
                  onClick={onContribute}
                  className="mb-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950"
                >
                  ➕ Tu connais un remède pour ça ? Raconte-le à Lafi
                </button>
              )}

              {textParts.map((part, i) =>
                isUser ? (
                  <p key={i} className="whitespace-pre-wrap text-sm">
                    {part.text}
                  </p>
                ) : (
                  <div
                    key={i}
                    className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:mt-3 prose-headings:mb-1.5 prose-hr:my-4"
                  >
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div>
                )
              )}

              {noms.length > 0 && !enCours && (
                <button
                  type="button"
                  onClick={() => onBasculerPanneau(message.id)}
                  aria-expanded={panneauId === message.id}
                  className={`mt-3 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    panneauId === message.id
                      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50"
                      : "border-neutral-200 bg-white hover:border-emerald-300 dark:border-neutral-800 dark:bg-neutral-900"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    <LeafIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Sources : {noms.length} plante{noms.length > 1 ? "s" : ""} documentée{noms.length > 1 ? "s" : ""}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">{noms.join(", ")}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {panneauId === message.id ? "Fermer" : "Ouvrir"}
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {status === "submitted" && (
        <div className="flex justify-start">
          <p className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Lafi consulte les usages documentés…
          </p>
        </div>
      )}
    </div>
  );
}
