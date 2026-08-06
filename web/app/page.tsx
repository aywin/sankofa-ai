import Link from "next/link";
import { getLafiStats } from "@/lib/stats";
import { LeafIcon } from "@/components/chat/icons";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { KnowledgeGraph } from "@/components/landing/KnowledgeGraph";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { StatsSection } from "@/components/landing/StatsSection";
import { PlantsPreview } from "@/components/landing/PlantsPreview";
import { IndicationsPreview } from "@/components/landing/IndicationsPreview";
import { HowWeValidateSection } from "@/components/landing/HowWeValidateSection";
import { LaboratoryPreview } from "@/components/landing/LaboratoryPreview";
import { ContributeSection } from "@/components/landing/ContributeSection";
import { WhatWeDontDoSection } from "@/components/landing/WhatWeDontDoSection";

export const metadata = { title: "Lafi — Le savoir des tradipraticiens, documenté et accessible" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-center font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
      {children}
    </h2>
  );
}

export default async function LandingPage() {
  const stats = await getLafiStats();

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      {/* 1. Entrée directe — le moment "manifeste" : fond encre profond,
          serif, le graphe comme preuve visuelle plutôt que décor. */}
      <section className="relative overflow-hidden bg-ink-950 px-4 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90">
          <div className="h-[420px] w-[420px] sm:h-[620px] sm:w-[620px]">
            <KnowledgeGraph />
          </div>
        </div>
        <div className="relative">
          <h1 className="mx-auto max-w-2xl font-serif text-4xl font-semibold leading-tight text-sand-50 sm:text-5xl">
            On documente le savoir des tradipraticiens. On le rend{" "}
            <span className="text-laterite-400">accessible</span> à tous.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-sand-50/80">
            Des soins simples et efficaces par les plantes, croisés avec la science — enfin réunis au même
            endroit, alors qu&apos;il fallait autrefois les chercher ville par ville, guérisseur par guérisseur.
          </p>
          <div className="mt-9">
            <HeroSearch />
          </div>
        </div>
      </section>

      <p className="bg-ink-900 px-4 py-2.5 text-center text-xs text-sand-50/70">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle" /> plantes documentées
        &nbsp;·&nbsp;
        <span className="inline-block h-2 w-2 rounded-full bg-laterite-400 align-middle" /> indications
        &nbsp;·&nbsp; traits pleins : couples pilotes enrichis de vraies données
      </p>

      {/* 2. Les chiffres */}
      <section className="mx-auto max-w-[880px] px-4 py-10">
        <StatsSection stats={stats} />
      </section>

      {/* 3. Explorer par la plante */}
      <section className="mx-auto max-w-[1100px] px-4 py-10">
        <SectionTitle>Explorer par la plante</SectionTitle>
        <PlantsPreview />
        <div className="mt-4 text-center">
          <Link href="/decouverte" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
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
        <p className="mx-auto mb-4 max-w-md text-center text-sm text-neutral-600 dark:text-neutral-300">
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

      <footer className="mx-auto flex max-w-[1100px] items-center justify-center gap-1.5 px-4 py-8 text-xs text-neutral-500 dark:text-neutral-400">
        <LeafIcon className="h-3.5 w-3.5" />
        Lafi — information documentaire, pas un avis médical.
      </footer>
    </div>
  );
}
