"use client";

import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";
import { LafiMark, LeafIcon } from "./icons";
import { TriageBlock } from "./TriageBlock";
import type { TriageResultat } from "@/lib/triage";
import type { MatchClaimResult } from "@/lib/types";

const EXEMPLES = [
  "J'ai de la fièvre et des frissons depuis 2 jours",
  "Comment soigner une plaie qui commence à s'infecter ?",
  "Je n'arrive pas à dormir depuis plusieurs nuits",
  "Quelle plante pour faire baisser la tension ?",
];

interface ToolPart {
  type: string;
  state?: string;
  input?: { annonce?: string };
  output?: unknown;
}

// Plantes proposées par une réponse — sauf en cas d'urgence : là, seul le
// bloc d'orientation compte, pas de remède.
export function plantesProposees(message: UIMessage): MatchClaimResult[] {
  if (message.role !== "assistant") return [];
  const triage = (message.parts.find((p) => p.type === "data-triage") as { data?: TriageResultat } | undefined)?.data;
  if (triage?.niveau === "urgence") return [];
  return collectPlantResults(message.parts);
}

// Les usages arrivent par l'outil du modèle, ou par le repli sans IA
// (part "data-usages").
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

// Ce que fait le modèle, avec ses propres mots (champ "annonce" des
// outils), en gris discret.
function ToolSteps({ parts }: { parts: ToolPart[] }) {
  if (parts.length === 0) return null;

  return (
    <div className="mb-3 space-y-1">
      {parts.map((part, i) => {
        const fini = part.state === "output-available" || part.state === "output-error";
        return (
          <p key={`${part.type}-${i}`} className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            {!fini && <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />}
            {part.input?.annonce}
          </p>
        );
      })}
    </div>
  );
}

export function ChatMessages({
  messages,
  status,
  onExampleClick,
  panneauId,
  onBasculerPanneau,
}: {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  onExampleClick: (text: string) => void;
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

              {textParts.map((part, i) =>
                isUser ? (
                  <p key={i} className="whitespace-pre-wrap text-sm">
                    {part.text}
                  </p>
                ) : (
                  <div
                    key={i}
                    className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed text-neutral-900 prose-p:my-2.5 prose-p:text-neutral-900 prose-li:text-neutral-900 prose-strong:font-semibold prose-strong:text-neutral-900 prose-em:text-neutral-700 prose-a:font-medium prose-a:text-emerald-700 prose-a:underline-offset-2 dark:text-neutral-100 dark:prose-p:text-neutral-100 dark:prose-li:text-neutral-100 dark:prose-strong:text-white dark:prose-em:text-neutral-300 dark:prose-a:text-emerald-400"
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
                  className={`mt-3 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    panneauId === message.id
                      ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                      : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  }`}
                >
                  <LeafIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="shrink-0 font-medium text-neutral-700 dark:text-neutral-200">
                    {noms.length} source{noms.length > 1 ? "s" : ""}
                  </span>
                  <span className="truncate text-neutral-500">{noms.join(", ")}</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {status === "submitted" && (
        <span aria-label="Lafi réfléchit" className="inline-block h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
      )}
    </div>
  );
}
