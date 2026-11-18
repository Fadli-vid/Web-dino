'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Footprints, Ruler, Scale, Sparkles } from 'lucide-react';
import { AnalyticsSpecimen, buildAnalyticsKPIs, formatWeightHuman } from '@/lib/paleo/analytics';
import { BiomassScatterChart } from './biomass-scatter-chart';
import { DietEraChart } from './diet-era-chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PaleoAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allDinosaurs: AnalyticsSpecimen[];
  filteredDinosaurs: AnalyticsSpecimen[];
}

export function PaleoAnalyticsDialog({
  open,
  onOpenChange,
  allDinosaurs,
  filteredDinosaurs,
}: PaleoAnalyticsDialogProps) {
  const isSubset =
    filteredDinosaurs.length > 0 && filteredDinosaurs.length < allDinosaurs.length;
  const [scope, setScope] = useState<'filtered' | 'all'>('all');

  const activeSpecimens =
    scope === 'filtered' && isSubset ? filteredDinosaurs : allDinosaurs;

  const kpis = useMemo(
    () => buildAnalyticsKPIs(activeSpecimens),
    [activeSpecimens]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-[95vw] sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6">
        <DialogHeader className="text-left border-b border-border/60 pb-3.5 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pr-7">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-[var(--font-display)] text-lg sm:text-xl">
                  Paleobiology Data Analytics
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Quantitative macroevolutionary trends across body size, trophic ecology, and fossil geography.
                </DialogDescription>
              </div>
            </div>

            {isSubset && (
              <div className="inline-flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setScope('filtered')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                    scope === 'filtered'
                      ? 'bg-background text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Filtered ({filteredDinosaurs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                    scope === 'all'
                      ? 'bg-background text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Full Archive ({allDinosaurs.length})
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Quantitative Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Ruler className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">Mean Length</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-foreground">
              {kpis.avgLength} m
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              Longest: {kpis.longestSpecimen?.name || '-'} ({kpis.longestSpecimen?.length ?? 0} m)
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Scale className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">Peak Biomass</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-foreground">
              {kpis.heaviestSpecimen ? formatWeightHuman(kpis.heaviestSpecimen.weight) : '-'}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              {kpis.heaviestSpecimen?.name || '-'}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">Dominant Guild</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-foreground truncate">
              {kpis.dominantDiet}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              Across {kpis.total} species
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <Footprints className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">Locomotion Split</span>
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-foreground whitespace-nowrap pt-0.5">
              {kpis.bipedalCount}B · {kpis.quadrupedalCount}Q · {kpis.facultativeCount}F
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              Bipedal / Quadrupedal / Facultative
            </div>
          </div>
        </div>

        {/* Interactive Charts Tabs */}
        <Tabs defaultValue="biomass" className="pt-2">
          <TabsList className="grid grid-cols-2 w-full sm:w-fit">
            <TabsTrigger value="biomass" className="text-xs sm:px-4">
              Allometry (Length × Mass)
            </TabsTrigger>
            <TabsTrigger value="ecology" className="text-xs sm:px-4">
              Ecology & Geography
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biomass" className="mt-4 rounded-xl border border-border/70 bg-muted/15 p-3 sm:p-4">
            <BiomassScatterChart
              specimens={activeSpecimens}
              onNavigate={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="ecology" className="mt-4">
            <DietEraChart specimens={activeSpecimens} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
