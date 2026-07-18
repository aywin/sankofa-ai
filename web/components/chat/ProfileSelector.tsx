"use client";

export const PROFILES = [
  { id: "particulier", label: "Particulier" },
  { id: "tradipraticien", label: "Tradipraticien" },
  { id: "pro_sante", label: "Professionnel de santé" },
] as const;

export type Profil = (typeof PROFILES)[number]["id"];

export function ProfileSelector({
  value,
  onChange,
}: {
  value: Profil;
  onChange: (profil: Profil) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-wrap justify-center gap-1.5 px-4 pb-2">
      {PROFILES.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          aria-pressed={value === p.id}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            value === p.id
              ? "bg-emerald-600 text-white"
              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
