"use client";

import { useState } from "react";
import { ContributeModal } from "@/components/chat/ContributeModal";
import { PlusIcon } from "@/components/chat/icons";

export function ContributeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
      >
        <PlusIcon />
        Tu connais un remède qui manque ici ? Signale-le
      </button>
      {open && <ContributeModal onClose={() => setOpen(false)} />}
    </>
  );
}
