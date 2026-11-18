'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GitBranch, Scale, Sparkles } from 'lucide-react';
import { Dinosaur, DinosaurSummary } from '@/lib/types';
import {
  getSmartRecommendations,
  RecommendationBadge,
} from '@/lib/recommendations';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpecimenCompareDialog } from '@/components/landingpage/specimen-compare-dialog';

interface RelatedSpecimensProps {
  currentDinosaur: Dinosaur;
  allSummaries: DinosaurSummary[];
}

const badgeStyles: Record<RecommendationBadge, string> = {
  'Predator–Prey Coeval':
    'border-amber-500/35 bg-amber-500/12 text-amber-700 dark:text-amber-300',
  'Coeval Neighbor':
    'border-emerald-500/35 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  'Close Relative':
    'border-primary/35 bg-primary/12 text-primary',
  'Era Contemporary':
    'border-teal-500/35 bg-teal-500/12 text-teal-700 dark:text-teal-300',
  'Taxonomic Kin':
    'border-border bg-muted text-muted-foreground',
};

export function RelatedSpecimens({
  currentDinosaur,
  allSummaries,
}: RelatedSpecimensProps) {
  const [compareTarget, setCompareTarget] = useState<DinosaurSummary | null>(null);

  const recommendations = useMemo(
    () => getSmartRecommendations(currentDinosaur, allSummaries, 4),
    [currentDinosaur, allSummaries]
  );

  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-5 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-primary shrink-0" />
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-bold text-foreground">
              Coeval Fauna & Taxonomic Relatives
            </h2>
            <p className="text-xs text-muted-foreground">
              Smart recommendations ranked by geological time overlap, fossil provenance, and evolutionary kinship.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map(({ specimen, badge, reason }) => {
          const myaLabel =
            specimen.myaStart !== undefined && specimen.myaEnd !== undefined
              ? `${specimen.myaStart}–${specimen.myaEnd} Ma`
              : specimen.period;

          return (
            <Card
              key={specimen.id}
              className="overflow-hidden border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-md group"
            >
              <div>
                <Link
                  href={`/species/${specimen.id}`}
                  className="block relative aspect-[16/10] w-full overflow-hidden bg-muted/40"
                >
                  <Image
                    src={getOptimizedImageUrl(specimen.image, {
                      width: 600,
                      quality: 'auto:good',
                    })}
                    alt={specimen.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                  <span
                    className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md ${badgeStyles[badge]}`}
                  >
                    <Sparkles className="w-2.5 h-2.5 shrink-0" />
                    {badge}
                  </span>
                </Link>

                <div className="p-4 space-y-2">
                  <div>
                    <Link
                      href={`/species/${specimen.id}`}
                      className="font-[var(--font-display)] font-bold text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {specimen.name}
                    </Link>
                    <p className="text-[11px] italic text-muted-foreground line-clamp-1">
                      {specimen.scientificName}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground">
                    {myaLabel} · {specimen.diet} · {specimen.length}m
                  </div>

                  <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-2">
                    {reason}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl text-xs h-8"
                >
                  <Link
                    href={`/species/${specimen.id}`}
                    className="flex items-center justify-center gap-1"
                  >
                    <span>Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCompareTarget(specimen)}
                  className="rounded-xl text-xs h-8 bg-primary/12 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/25 flex items-center gap-1"
                  title={`Compare ${currentDinosaur.name} with ${specimen.name}`}
                >
                  <Scale className="w-3 h-3" />
                  <span>Compare</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <SpecimenCompareDialog
        open={Boolean(compareTarget)}
        onOpenChange={(open) => {
          if (!open) setCompareTarget(null);
        }}
        compareDinosaurs={
          compareTarget ? [currentDinosaur, compareTarget] : [currentDinosaur]
        }
      />
    </section>
  );
}
