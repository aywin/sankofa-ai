import Link from "next/link";
import { getLafiStats } from "@/lib/stats";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { HeroPhotos } from "@/components/landing/HeroPhotos";
import { StatsSection } from "@/components/landing/StatsSection";
import { PlantsPreview } from "@/components/landing/PlantsPreview";
import { IndicationsPreview } from "@/components/landing/IndicationsPreview";
import { HowWeValidateSection } from "@/components/landing/HowWeValidateSection";
import { LaboratoryPreview } from "@/components/landing/LaboratoryPreview";
import { ContributeSection } from "@/components/landing/ContributeSection";
import { WhatWeDontDoSection } from "@/components/landing/WhatWeDontDoSection";

export const metadata = { title: "Lafi · Le savoir des tradipraticiens, documenté et accessible" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1.5 text-center text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
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
      className={`flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800/70 dark:bg-neutral-900/60 ${className}`}
    >
      <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
      <div className="mt-4 flex-1">{children}</div>
      <Link href={href} className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        {cta}
      </Link>
    </div>
  );
}

export default async function LandingPage() {
  const stats = await getLafiStats();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      {/* 1. Entrée directe : la question au centre, de vraies photos de
          plantes à côté. */}
      <section className="mx-auto w-full max-w-[1100px] px-4 pb-12 pt-10 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h1 className="text-4xl font-bold leading-[1.1] text-neutral-900 sm:text-5xl dark:text-neutral-50">
              Rendre le savoir <span className="text-emerald-700 dark:text-emerald-400">traditionnel</span> accessible à
              tous.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-neutral-600 dark:text-neutral-300">
              Les usages des plantes recueillis auprès des tradipraticiens, croisés avec la science et réunis au même
              endroit. Avant, il fallait les chercher ville par ville, guérisseur par guérisseur.
            </p>
            <div className="mt-8">
              <HeroSearch />
            </div>
          </div>
          <div className="hidden h-[420px] sm:block">
            <HeroPhotos />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1100px] border-y border-neutral-200 px-4 py-6 dark:border-neutral-800">
        <StatsSection stats={stats} />
      </div>

      {/* 2. Explorer — grille bento : le laboratoire en pièce maîtresse,
          les deux portes d'entrée (plante / mal) autour. */}
      <section className="mx-auto w-full max-w-[1100px] px-4 pb-6 pt-16 sm:pt-20">
        <SectionTitle>Trois façons d&apos;y entrer</SectionTitle>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm text-neutral-600 dark:text-neutral-300">
          Par la plante, par le mal, ou en ouvrant le raisonnement complet. Tout mène au même savoir documenté.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 sm:grid-rows-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900 dark:bg-emerald-950/30 sm:col-span-2 sm:row-span-2">
            <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Le laboratoire
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Le raisonnement complet, nœud par nœud : d&apos;où vient la donnée, comment elle est pondérée, ce
              qu&apos;en disent la science et la tradition, sans jamais tout fondre en un seul chiffre.
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
