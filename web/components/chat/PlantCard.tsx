"use client";

import { useState } from "react";
import { LeafIcon } from "./icons";
import type { MatchUsageResult } from "@/lib/types";

const NIVEAU_STYLES: Record<string, string> = {
  traditionnel:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  les_deux: "bg-emerald-600 text-white",
  scientifique:
    "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
};

const NIVEAU_LABELS: Record<string, string> = {
  traditionnel: "Traditionnel",
  les_deux: "Traditionnel + scientifique",
  scientifique: "Scientifique",
};

export function PlantCard({ usage }: { usage: MatchUsageResult }) {
  const [open, setOpen] = useState(false);
  const niveauClass = NIVEAU_STYLES[usage.niveau_de_preuve] ?? NIVEAU_STYLES.traditionnel;
  const niveauLabel = NIVEAU_LABELS[usage.niveau_de_preuve] ?? usage.niveau_de_preuve;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <LeafIcon className="h-4 w-4 shrink-0" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {usage.plante_nom}
          </span>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${niveauClass}`}>
          {niveauLabel}
        </span>
      </div>

      <dl className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        <div>
          <dt className="inline font-medium text-neutral-500 dark:text-neutral-400">
            Préparation :{" "}
          </dt>
          <dd className="inline">{usage.preparation}</dd>
        </div>
        {usage.posologie && (
          <div>
            <dt className="inline font-medium text-neutral-500 dark:text-neutral-400">
              Posologie :{" "}
            </dt>
            <dd className="inline">{usage.posologie}</dd>
          </div>
        )}
      </dl>

      {usage.plante_precautions && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-neutral-400 underline-offset-2 hover:text-neutral-600 hover:underline dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            {open ? "Masquer les précautions" : "Voir les précautions"}
          </button>
          <div
            className={`grid transition-all duration-200 ease-out ${
              open ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <p className="overflow-hidden text-xs text-neutral-500 dark:text-neutral-400">
              {usage.plante_precautions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
