'use client';

import { Clock, Compass, Footprints, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dinosaur } from '@/lib/types';
import {
  getFallbackMyaRange,
  MESOZOIC_MAX_MA,
  MESOZOIC_MIN_MA,
} from '@/hooks/use-dinosaur-filters';

interface ChronoTimelineBarProps {
  dinosaur: Dinosaur;
}

const TOTAL_SPAN = MESOZOIC_MAX_MA - MESOZOIC_MIN_MA; // 186 Ma

function getGeologicContext(subPeriod?: string, period?: string): string {
  const key = (subPeriod || period || '').toLowerCase();
  if (key.includes('triassic')) {
    return 'Age of early dinosaurs on the unified supercontinent Pangaea, preceding the End-Triassic extinction (201.3 Ma).';
  }
  if (key.includes('early jurassic')) {
    return 'Early Jurassic ecosystems following the Tr-J extinction as Pangaea began rifting apart.';
  }
  if (key.includes('middle jurassic')) {
    return 'Middle Jurassic radiation of early large theropods, megalosaurids, and long-necked sauropods.';
  }
  if (key.includes('late jurassic')) {
    return 'Peak age of gigantic sauropods, stegosaurs, and iconic Morrison & Shaximiao predators.';
  }
  if (key.includes('early cretaceous')) {
    return 'Rise of flowering plants (angiosperms), diverse feathered maniraptorans, and spinosaurids.';
  }
  return 'Terminal Cretaceous terrestrial ecosystems culminating just before the 66.0 Ma K-Pg asteroid impact.';
}

export function ChronoTimelineBar({ dinosaur }: ChronoTimelineBarProps) {
  const [fallbackEnd, fallbackStart] = getFallbackMyaRange(dinosaur.period);
  const startMa = dinosaur.myaStart ?? fallbackStart;
  const endMa = dinosaur.myaEnd ?? fallbackEnd;
  const older = Math.min(MESOZOIC_MAX_MA, Math.max(startMa, endMa));
  const younger = Math.max(MESOZOIC_MIN_MA, Math.min(startMa, endMa));

  const leftPct = ((MESOZOIC_MAX_MA - older) / TOTAL_SPAN) * 100;
  const rightPct = ((MESOZOIC_MAX_MA - younger) / TOTAL_SPAN) * 100;
  const markerWidthPct = Math.max(2.5, rightPct - leftPct);
  const adjustedLeftPct = Math.min(leftPct, 100 - markerWidthPct);

  const eraLabel = dinosaur.subPeriod || dinosaur.period;
  const contextText = getGeologicContext(dinosaur.subPeriod, dinosaur.period);

  return (
    <Card className="p-5 sm:p-6 border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-foreground">
              Chrono-Stratigraphic Timeline
            </h2>
            <p className="text-xs text-muted-foreground">
              Temporal placement across the Mesozoic Era (252–66 Million Years Ago)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30 text-primary font-mono font-semibold">
            {eraLabel} · {older}–{younger} Ma
          </span>
        </div>
      </div>

      {/* Visual Mesozoic Proportional Scale */}
      <div className="space-y-2.5">
        <div className="relative h-9 w-full rounded-xl overflow-hidden border border-border/80 bg-muted/30 flex">
          {/* Triassic 252 - 201.3 Ma (27.26%) */}
          <div
            className="h-full border-r-2 border-amber-600/35 bg-amber-500/24 dark:bg-amber-500/26 flex items-center justify-center text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-950 dark:text-amber-200"
            style={{ width: '27.26%' }}
          >
            <span className="hidden sm:inline">Triassic</span>
            <span className="sm:hidden">Tr</span>
          </div>
          {/* Jurassic 201.3 - 145.0 Ma (30.27%) */}
          <div
            className="h-full border-r-2 border-emerald-600/35 bg-emerald-500/24 dark:bg-emerald-500/26 flex items-center justify-center text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-950 dark:text-emerald-200"
            style={{ width: '30.27%' }}
          >
            <span className="hidden sm:inline">Jurassic</span>
            <span className="sm:hidden">J</span>
          </div>
          {/* Cretaceous 145.0 - 66.0 Ma (42.47%) */}
          <div
            className="h-full bg-sky-500/24 dark:bg-sky-500/26 flex items-center justify-center text-[10px] font-mono font-semibold uppercase tracking-wider text-sky-950 dark:text-sky-200"
            style={{ width: '42.47%' }}
          >
            <span className="hidden sm:inline">Cretaceous</span>
            <span className="sm:hidden">K</span>
          </div>

          {/* Highlighted Species Existence Span */}
          <div
            className="absolute inset-y-1 rounded-lg bg-primary border-2 border-background shadow-md ring-1 ring-primary/40 transition-all"
            style={{
              left: `${adjustedLeftPct}%`,
              width: `${markerWidthPct}%`,
            }}
            title={`${dinosaur.name}: ${older}–${younger} Ma`}
          />
        </div>

        {/* Boundary Markers */}
        <div className="relative flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>252 Ma (P-T)</span>
          <span className="hidden sm:inline">201.3 Ma (Tr-J)</span>
          <span className="hidden sm:inline">145.0 Ma (J-K)</span>
          <span>66.0 Ma (K-Pg Impact)</span>
        </div>
      </div>

      {/* Paleobiology & Provenance Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="rounded-xl border border-border/60 bg-muted/25 px-3.5 py-2.5 flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
              Epoch / Stage
            </span>
            <span className="text-xs font-semibold text-foreground truncate block">
              {eraLabel}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/25 px-3.5 py-2.5 flex items-center gap-2.5">
          <Footprints className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
              Locomotion
            </span>
            <span className="text-xs font-semibold text-foreground truncate block">
              {dinosaur.locomotion || 'Verified Archive'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/25 px-3.5 py-2.5 flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
              Paleo-Region
            </span>
            <span className="text-xs font-semibold text-foreground truncate block">
              {dinosaur.continent || dinosaur.locationFound}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {contextText}
      </p>
    </Card>
  );
}
