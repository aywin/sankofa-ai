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

      {/* 1. Entrée directe — le moment "manifeste" : fond sombre, mais un
          dégradé chaud + deux halos de couleur plutôt qu'un noir plat
          (retour utilisateur : "on peut éviter le tout noir"). Le titre
          occupe toute la largeur du conteneur (pas la moitié d'une
          grille) pour tenir sur une seule ligne en desktop. Le graphe
          reste confiné à la colonne de droite, en dessous, et n'a plus
          le droit de déborder sous le texte — un chevauchement
          graphe/texte avait déjà cassé une version précédente de ce
          hero. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-ink-950 to-laterite-950 px-4 pb-28 pt-16 sm:pb-40 sm:pt-24">
        <div className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-laterite-600/45 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-emerald-500/35 blur-[110px]" />
        <div className="relative mx-auto max-w-[1100px]">
          <h1 className="text-center font-serif text-3xl font-semibold leading-tight text-sand-50 sm:text-left sm:text-4xl lg:whitespace-nowrap lg:text-[2rem]">
            Rendre le savoir <span className="text-laterite-400">traditionnel</span> accessible à tous.
          </h1>

          <div className="mt-10 grid items-center gap-12 sm:grid-cols-2">
            <div className="text-center sm:text-left">
              <p className="mx-auto max-w-md text-base text-sand-50/70 sm:mx-0">
                Des soins simples et efficaces par les plantes, croisés avec la science — enfin réunis au même
                endroit, alors qu&apos;il fallait autrefois les chercher ville par ville, guérisseur par guérisseur.
              </p>
              <div className="mt-9">
                <HeroSearch />
              </div>
            </div>
            <div className="relative hidden min-h-[380px] items-center justify-end sm:flex">
              <div className="pointer-events-none absolute inset-0 opacity-70">
                <KnowledgeGraph />
              </div>
              <div className="relative z-10">
                <HeroPreviewCard />
              </div>
            </div>
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
              Le raisonnement complet, nœud par nœud : d&apos;où vient la donnée, comment elle est pondérée, ce
              qu&apos;en dit la science et la tradition — jamais fondu en un seul chiffre.
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
