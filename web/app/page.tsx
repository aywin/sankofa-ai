import Link from "next/link";
import { getLafiStats } from "@/lib/stats";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { KnowledgeGraph } from "@/components/landing/KnowledgeGraph";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { HeroPreviewCard } from "@/components/landing/HeroPreviewCard";
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
    <h2 className="mb-1.5 text-center font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
      {children}
    </h2>
  );
}

function BentoTile({
  title,
  description,
  cta,
  href,
  className = "",
  children,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-neutral-200/70 bg-white p-5 dark:border-neutral-800/70 dark:bg-neutral-900/60 ${className}`}
    >
      <p className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
      <div className="mt-4 flex-1">{children}</div>
      <Link
        href={href}
        className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        {cta} →
      </Link>
    </div>
  );
}

export default async function LandingPage() {
  const stats = await getLafiStats();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      {/* 1. Entrée directe — le moment "manifeste" : fond encre profond,
          deux colonnes (texte + carte produit flottante), le graphe en
          toile de fond. */}
      <section className="relative overflow-hidden bg-ink-950 px-4 pb-28 pt-16 sm:pb-40 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70 sm:justify-start sm:pl-0">
          <div className="h-[420px] w-[420px] sm:h-[640px] sm:w-[640px]">
            <KnowledgeGraph />
          </div>
        </div>
        <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 sm:grid-cols-2">
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-4xl font-semibold leading-tight text-sand-50 sm:text-5xl">
              On documente le savoir des tradipraticiens. On le rend{" "}
              <span className="text-laterite-400">accessible</span> à tous.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base text-sand-50/80 sm:mx-0">
              Des soins simples et efficaces par les plantes, croisés avec la science — enfin réunis au même
              endroit, alors qu&apos;il fallait autrefois les chercher ville par ville, guérisseur par guérisseur.
            </p>
            <div className="mt-9">
              <HeroSearch />
            </div>
          </div>
          <div className="hidden justify-end sm:flex">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* Bandeau de stats flottant, à cheval sur le hero et la section
          suivante — la preuve chiffrée, pas juste une promesse. */}
      <div className="relative z-10 mx-auto -mt-14 w-full max-w-[880px] px-4 sm:-mt-16">
        <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-2xl shadow-black/20 dark:border-neutral-800/70 dark:bg-neutral-900 sm:p-6">
          <StatsSection stats={stats} />
        </div>
      </div>

      {/* 2. Explorer — grille bento : le laboratoire en pièce maîtresse,
          les deux portes d'entrée (plante / mal) autour. */}
      <section className="mx-auto w-full max-w-[1100px] px-4 pb-6 pt-16 sm:pt-20">
        <SectionTitle>Un seul écosystème, trois façons d&apos;y entrer</SectionTitle>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm text-neutral-600 dark:text-neutral-300">
          Par la plante, par le mal, ou en ouvrant le raisonnement complet — tout mène au même savoir documenté.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 sm:grid-rows-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900 dark:bg-emerald-950/30 sm:col-span-2 sm:row-span-2">
            <p className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Le laboratoire
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Chaque recommandation s&apos;ouvre : d&apos;où vient la donnée, comment elle est pondérée, ce qui
              n&apos;est pas encore calculé.
            </p>
            <div className="mt-5">
              <LaboratoryPreview />
            </div>
          </div>

          <BentoTile
            title="Explorer par la plante"
            description="Les plantes documentées, avec leur niveau de preuve réel."
            cta="Voir toutes les plantes"
            href="/decouverte"
          >
            <PlantsPreview limit={4} />
          </BentoTile>

          <BentoTile
            title="Explorer par le mal"
            description="Les indications effectivement couvertes aujourd'hui."
            cta="Parcourir par indication"
            href="/decouverte"
          >
            <IndicationsPreview />
          </BentoTile>
        </div>
      </section>

      {/* 3. Comment on valide */}
      <section className="mx-auto max-w-[1100px] px-4 py-16">
        <SectionTitle>Comment on valide</SectionTitle>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm text-neutral-600 dark:text-neutral-300">
          La méthode qui rend tout le reste possible.
        </p>
        <HowWeValidateSection />
      </section>

      {/* 4. Contribuer + 5. Garde-fous, côte à côte pour casser le
          défilement en accordéon vertical. */}
      <section className="mx-auto grid max-w-[1100px] gap-8 px-4 py-16 sm:grid-cols-2">
        <div>
          <SectionTitle>Contribuer et être reconnu</SectionTitle>
          <div className="mt-5">
            <ContributeSection />
          </div>
        </div>
        <div>
          <SectionTitle>Ce que Lafi ne fait pas</SectionTitle>
          <div className="mt-5">
            <WhatWeDontDoSection />
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <SiteFooter />
    </div>
  );
}
