"use client";

import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import { PlantCard } from "./PlantCard";
import { LafiMark, LeafIcon } from "./icons";
import type { MatchUsageResult, Plante } from "@/lib/types";

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
      const output = part.output as { resultats?: MatchUsageResult[] } | undefined;
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
      const output = part.output as { plante?: Plante | null } | undefined;
      return {
        key,
        done: true,
        label: output?.plante
          ? `Fiche de ${output.plante.nom_local} consultée`
          : "Plante introuvable",
      };
    }
    return { key, done: false, label: "Vérification d'une plante…" };
  }

  return { key, done: isDone, label: isDone ? "Étape terminée" : "Étape en cours…" };
}

function collectPlantResults(parts: ToolPart[]): MatchUsageResult[] {
  const seen = new Set<string>();
  const results: MatchUsageResult[] = [];

  for (const part of parts) {
    if (part.type === "tool-rechercher_par_symptome" && part.state === "output-available") {
      const output = part.output as { resultats?: MatchUsageResult[] } | undefined;
      for (const r of output?.resultats ?? []) {
        if (!seen.has(r.usage_id)) {
          seen.add(r.usage_id);
          results.push(r);
        }
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
}: {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  onExampleClick: (text: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <LafiMark className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Décris un symptôme, une maladie — ou envoie une photo.
          </p>
          <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
            Se soigner naturellement et efficacement.
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const textParts = message.parts.filter((p) => p.type === "text");
        const toolParts = message.parts.filter((p) =>
          p.type.startsWith("tool-")
        ) as unknown as ToolPart[];
        const imageParts = message.parts.filter(
          (p): p is Extract<typeof p, { type: "file" }> =>
            p.type === "file" && !!p.mediaType?.startsWith("image/")
        );
        const plantResults = isUser ? [] : collectPlantResults(toolParts);

        return (
          <div
            key={message.id}
            className={`animate-message-in flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                isUser
                  ? "bg-emerald-600 text-white"
                  : "bg-transparent text-neutral-900 dark:text-neutral-100"
              }`}
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

              {!isUser && <ToolSteps parts={toolParts} />}

              {!isUser && plantResults.length > 0 && (
                <div className="mb-2 space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                    <LeafIcon className="h-3.5 w-3.5" />
                    Ce que dit le savoir traditionnel
                  </p>
                  {plantResults.map((usage) => (
                    <PlantCard key={usage.usage_id} usage={usage} />
                  ))}
                </div>
              )}

              {textParts.map((part, i) =>
                isUser ? (
                  <p key={i} className="whitespace-pre-wrap text-sm">
                    {part.text}
                  </p>
                ) : (
                  <div
                    key={i}
                    className="prose prose-sm prose-neutral dark:prose-invert max-w-none rounded-2xl bg-neutral-100 px-4 py-2.5 prose-p:my-1.5 prose-headings:mt-3 prose-headings:mb-1.5 dark:bg-neutral-900"
                  >
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}

      {status === "submitted" && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-neutral-100 px-4 py-2.5 dark:bg-neutral-900">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
}
