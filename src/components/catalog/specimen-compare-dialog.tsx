'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  BrainCircuit,
  Database,
  Loader2,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Dinosaur, DinosaurSummary } from '@/lib/types';
import { AiLanguage, EncounterCompareResponse } from '@/lib/ai/prompt-builder';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SpecimenCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compareDinosaurs: Array<Dinosaur | DinosaurSummary>;
}

interface CompareAiResult {
  data: EncounterCompareResponse;
  cached: boolean;
  modelUsed?: string;
}

export function SpecimenCompareDialog({
  open,
  onOpenChange,
  compareDinosaurs,
}: SpecimenCompareDialogProps) {
  const [lang, setLang] = useState<AiLanguage>('en');
  const [aiLoading, setAiLoading] = useState(false);

  const canonicalIds = [...compareDinosaurs]
    .map((d) => d.id)
    .sort((a, b) => a.localeCompare(b))
    .join(',');

  const encounterKey = `${canonicalIds}:${lang}`;
  const [aiState, setAiState] = useState<{
    key: string;
    result: CompareAiResult | null;
    error: string | null;
  }>({
    key: encounterKey,
    result: null,
    error: null,
  });

  const aiResult = aiState.key === encounterKey ? aiState.result : null;
  const aiError = aiState.key === encounterKey ? aiState.error : null;

  const handleRunEncounterAnalysis = async () => {
    if (aiLoading || compareDinosaurs.length < 2) return;
    const requestKey = encounterKey;
    setAiState({ key: requestKey, result: null, error: null });

    const storageKey = `wikidino:ai:cmp:${canonicalIds}:${lang}`;
    if (typeof window !== 'undefined') {
      try {
        const cachedRaw = window.sessionStorage.getItem(storageKey);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as CompareAiResult;
          setAiState({ key: requestKey, result: { ...parsed, cached: true }, error: null });
          return;
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/compare-encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speciesIds: compareDinosaurs.map((d) => d.id),
          lang,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setAiState({
          key: requestKey,
          result: null,
          error:
            payload?.message ||
            'AI comparison is temporarily unavailable. Please try again shortly.',
        });
        return;
      }

      const finalResult: CompareAiResult = {
        data: payload.data,
        cached: Boolean(payload.cached),
        modelUsed: payload.modelUsed,
      };
      setAiState({ key: requestKey, result: finalResult, error: null });

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(storageKey, JSON.stringify(finalResult));
        } catch {
          // Ignore storage quota limits
        }
      }
    } catch {
      setAiState({
        key: requestKey,
        result: null,
        error:
          lang === 'id'
            ? 'Gagal terhubung ke server AI.'
            : 'Unable to reach AI comparison endpoint.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-[95vw] sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-7">
        <DialogHeader className="text-left border-b border-border/60 pb-3.5 space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-foreground">
                Specimen Comparison Matrix
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Side-by-side morphological, temporal, and taxonomic parameters of selected specimens ({compareDinosaurs.length} specimens).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-x-auto py-3">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead>
              <tr className="border-b border-border/60">
                <th className="py-3 px-3.5 sm:px-4 font-semibold text-muted-foreground text-xs sm:text-sm w-36 sm:w-44 shrink-0">
                  Attribute
                </th>
                {compareDinosaurs.map((dino) => (
                  <th key={dino.id} className="py-3 px-3.5 sm:px-4 font-bold text-foreground text-sm sm:text-base min-w-[170px] sm:min-w-[200px]">
                    {dino.name}
                    <span className="block text-[11px] font-normal italic font-serif text-muted-foreground">
                      {dino.scientificName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="py-3 px-3.5 sm:px-4 font-medium text-muted-foreground">Visual</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`img-${dino.id}`} className="py-3 px-3.5 sm:px-4">
                    <div className="relative w-28 sm:w-36 lg:w-44 h-20 sm:h-24 lg:h-28 rounded-xl overflow-hidden border border-border/60 bg-muted/40 shadow-xs">
                      <Image
                        src={getOptimizedImageUrl(dino.image, { width: 500, quality: 'auto:good' })}
                        alt={dino.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3.5 sm:px-4 font-medium text-muted-foreground">Era / Period</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`p-${dino.id}`} className="py-3 px-3.5 sm:px-4 font-medium text-foreground">
                    <div>{dino.subPeriod || dino.period}</div>
                    {dino.myaStart !== undefined && dino.myaEnd !== undefined && (
                      <span className="block text-[11px] font-mono text-muted-foreground">
                        {dino.myaStart}–{dino.myaEnd} Ma
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3.5 sm:px-4 font-medium text-muted-foreground">Diet</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`d-${dino.id}`} className="py-3 px-3.5 sm:px-4 font-medium text-foreground">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 border border-border/50">
                      {dino.diet}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3.5 sm:px-4 font-medium text-muted-foreground">Body Length</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`l-${dino.id}`} className="py-3 px-3.5 sm:px-4 font-mono font-medium text-foreground">
                    {dino.length} m
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3.5 sm:px-4 font-medium text-muted-foreground">Estimated Weight</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`w-${dino.id}`} className="py-3 px-3.5 sm:px-4 font-mono font-medium text-foreground">
                    {(dino.weight / 1000).toFixed(1)} tons
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3.5 sm:px-4 font-medium text-muted-foreground">Fossil Location</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`loc-${dino.id}`} className="py-3 px-3.5 sm:px-4 text-muted-foreground">
                    {dino.locationFound || 'Archive record'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3.5 sm:px-4 font-medium text-muted-foreground">Action</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`act-${dino.id}`} className="py-3 px-3.5 sm:px-4">
                    <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8 px-3.5 hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Link href={`/species/${dino.id}`}>View Details</Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* AI Paleo-Encounter Simulator (Quota-Optimized Canonical Cache) */}
        {compareDinosaurs.length >= 2 && (
          <div className="border-t border-border/60 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] font-bold text-sm sm:text-base text-foreground">
                    AI Paleo-Encounter & Biomechanical Analysis
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Verifies true historical overlap and contrasts evolutionary biomechanics. Cached globally in TiDB.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors ${
                      lang === 'en'
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('id')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors ${
                      lang === 'id'
                        ? 'bg-background text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ID
                  </button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  disabled={aiLoading}
                  onClick={() => void handleRunEncounterAnalysis()}
                  className="h-8 rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 px-3"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{aiLoading ? 'Analyzing...' : 'Run AI Paleo-Analysis'}</span>
                </Button>
              </div>
            </div>

            {aiError && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {aiResult && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${
                      aiResult.data.coexistedInHistory
                        ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {aiResult.data.coexistedInHistory
                      ? 'Historically Coexisted (Overlap Verified)'
                      : 'Separated by Geologic Time or Continent'}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <Database className="w-3 h-3 text-primary" />
                    {aiResult.cached
                      ? `Cached · 0 Gemini tokens${aiResult.modelUsed ? ` (${aiResult.modelUsed})` : ''}`
                      : `Live · ${aiResult.modelUsed || 'Gemini Flash'}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5 sm:p-4 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                      Time & Geography Check
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {aiResult.data.temporalOverlap}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5 sm:p-4 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                      Biomechanics
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {aiResult.data.biomechanicsComparison}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/25 p-3.5 sm:p-4 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                      Ecological Verdict
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {aiResult.data.ecologicalVerdict}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
