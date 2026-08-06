import Link from "next/link";
import { getLafiStats } from "@/lib/stats";
import { LafiMark, LeafIcon } from "@/components/chat/icons";
import { KnowledgeGraph } from "@/components/landing/KnowledgeGraph";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { StatsSection } from "@/components/landing/StatsSection";
import { PlantsPreview } from "@/components/landing/PlantsPreview";
import { IndicationsPreview } from "@/components/landing/IndicationsPreview";
import { HowWeValidateSection } from "@/components/landing/HowWeValidateSection";
import { LaboratoryPreview } from "@/components/landing/LaboratoryPreview";
import { ContributeSection } from "@/components/landing/ContributeSection";
import { WhatWeDontDoSection } from "@/components/landing/WhatWeDontDoSection";

export const metadata = { title: "Lafi — Le savoir thérapeutique africain, rendu calculable" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-center text-lg font-semibold text-neutral-900 dark:text-neutral-100">{children}</h2>
  );
}

export default async function LandingPage() {
  const stats = await getLafiStats();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4">
        <span className="flex items-center gap-1.5 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          <LafiMark className="h-5 w-5" />
          Lafi
        </span>
        <nav className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <Link href="/decouverte" className="hover:text-neutral-800 dark:hover:text-neutral-200">
            Découverte
          </Link>
          <Link href="/laboratoire" className="hover:text-neutral-800 dark:hover:text-neutral-200">
            Laboratoire
          </Link>
          <Link
            href="/chat"
            className="rounded-xl bg-emerald-600 px-3 py-1.5 font-medium text-white transition hover:bg-emerald-700"
          >
            Parler à Lafi
          </Link>
        </nav>
      </header>

      {/* 1. Entrée directe */}
      <section className="relative overflow-hidden px-4 py-16 text-center sm:py-24">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40 dark:opacity-30">
          <div className="h-[560px] w-[560px] text-emerald-700 dark:text-emerald-400">
            <KnowledgeGraph />
          </div>
        </div>
        <div className="relative">
          <h1 className="mx-auto max-w-2xl text-3xl font-semibold text-neutral-900 sm:text-4xl dark:text-neutral-100">
            Le savoir thérapeutique africain n&apos;a jamais été calculable. On le rend calculable.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-600 dark:text-neutral-300">
            Lafi croise les usages traditionnels des plantes médicinales africaines avec ce qu&apos;en dit la
            science — sans jamais fusionner les deux en un seul chiffre.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* 2. Les chiffres */}
      <section className="mx-auto max-w-[880px] px-4 py-10">
        <StatsSection stats={stats} />
      </section>

      {/* 3. Explorer par la plante */}
      <section className="mx-auto max-w-[1100px] px-4 py-10">
        <SectionTitle>Explorer par la plante</SectionTitle>
        <PlantsPreview />
        <div className="mt-4 text-center">
          <Link href="/decouverte" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
            Voir toutes les plantes →
          </Link>
        </div>
      </section>

      {/* 4. Explorer par le mal */}
      <section className="mx-auto max-w-[880px] px-4 py-10">
        <SectionTitle>Explorer par le mal</SectionTitle>
        <IndicationsPreview />
      </section>

      {/* 5. Comment on valide */}
      <section className="mx-auto max-w-[1100px] px-4 py-10">
        <SectionTitle>Comment on valide</SectionTitle>
        <HowWeValidateSection />
      </section>

      {/* 6. Le laboratoire */}
      <section className="mx-auto max-w-[720px] px-4 py-10">
        <SectionTitle>Le laboratoire</SectionTitle>
        <p className="mx-auto mb-4 max-w-md text-center text-sm text-neutral-500 dark:text-neutral-400">
          Chaque recommandation peut s&apos;ouvrir : d&apos;où vient la donnée, comment elle est pondérée, ce qui
          n&apos;est pas encore calculé.
        </p>
        <LaboratoryPreview />
      </section>

      {/* 7. Contribuer et être reconnu */}
      <section className="mx-auto max-w-[880px] px-4 py-10">
        <SectionTitle>Contribuer et être reconnu</SectionTitle>
        <ContributeSection />
      </section>

      {/* 8. Ce que Lafi IA ne fait pas */}
      <section className="mx-auto max-w-[880px] px-4 py-10">
        <SectionTitle>Ce que Lafi ne fait pas</SectionTitle>
        <WhatWeDontDoSection />
      </section>

      <footer className="mx-auto flex max-w-[1100px] items-center justify-center gap-1.5 px-4 py-8 text-xs text-neutral-400 dark:text-neutral-500">
        <LeafIcon className="h-3.5 w-3.5" />
        Lafi — information documentaire, pas un avis médical.
      </footer>
    </div>
  );
}
