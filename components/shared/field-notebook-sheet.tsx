'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bookmark,
  Check,
  Copy,
  ExternalLink,
  Scale,
  Trash2,
  X,
} from 'lucide-react';
import { useFieldNotebook } from '@/hooks/use-field-notebook';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { buildNotebookExportText } from '@/lib/citations';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SpecimenCompareDialog } from '@/components/landingpage/specimen-compare-dialog';

export function FieldNotebookSheet() {
  const {
    savedIds,
    isHydrated,
    removeSave,
    clearNotebook,
    isNotebookOpen,
    setIsNotebookOpen,
    setIsCommandOpen,
    summaries,
    ensureSummariesLoaded,
  } = useFieldNotebook();

  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<'markdown' | 'bibtex' | null>(null);

  useEffect(() => {
    if (isNotebookOpen) {
      void ensureSummariesLoaded();
    }
  }, [isNotebookOpen, ensureSummariesLoaded]);

  useEffect(() => {
    setSelectedCompareIds((prev) => prev.filter((id) => savedIds.includes(id)));
  }, [savedIds]);

  const savedSpecimens = useMemo(() => {
    if (!isHydrated || savedIds.length === 0) return [];
    const byId = new Map(summaries.map((item) => [item.id, item]));
    return savedIds
      .map((id) => byId.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [isHydrated, savedIds, summaries]);

  const compareDinosaurs = useMemo(() => {
    const selectedSet = new Set(selectedCompareIds);
    return savedSpecimens.filter((item) => selectedSet.has(item.id));
  }, [savedSpecimens, selectedCompareIds]);

  const toggleCompareSelection = (id: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleCopyExport = async (format: 'markdown' | 'bibtex') => {
    if (savedSpecimens.length === 0 || typeof window === 'undefined') return;
    const text = buildNotebookExportText(savedSpecimens, window.location.origin, format);
    await navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <>
      <Sheet open={isNotebookOpen} onOpenChange={setIsNotebookOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col p-0 bg-card/95 backdrop-blur-xl border-border/80"
        >
          <SheetHeader className="p-5 border-b border-border/60 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="font-[var(--font-display)] text-lg">
                  Field Notebook
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Saved paleontology specimens for research, study, and side-by-side comparison.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedSpecimens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border/70 flex items-center justify-center text-muted-foreground">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-[var(--font-display)] font-bold text-sm text-foreground">
                    Your Field Notebook is empty
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    Save specimens from the catalog or detail dossiers to build your personal study list and export citations.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsNotebookOpen(false);
                    setIsCommandOpen(true);
                  }}
                  className="rounded-xl text-xs"
                >
                  Search Archive (Ctrl+K)
                </Button>
              </div>
            ) : (
              savedSpecimens.map((dino) => {
                const isSelected = selectedCompareIds.includes(dino.id);
                const ageText =
                  dino.myaStart !== undefined && dino.myaEnd !== undefined
                    ? `${dino.myaStart}–${dino.myaEnd} Ma`
                    : dino.period;

                return (
                  <div
                    key={dino.id}
                    className={`rounded-xl border p-3 transition-colors flex items-center gap-3 ${
                      isSelected
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border/70 bg-background/60 hover:bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCompareSelection(dino.id)}
                      aria-label={`Select ${dino.name} for comparison`}
                      className="shrink-0"
                    />

                    <Link
                      href={`/species/${dino.id}`}
                      onClick={() => setIsNotebookOpen(false)}
                      className="relative w-14 h-12 rounded-lg overflow-hidden border border-border/60 bg-muted/40 shrink-0"
                    >
                      <Image
                        src={getOptimizedImageUrl(dino.image, { width: 240, quality: 'auto:good' })}
                        alt={dino.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/species/${dino.id}`}
                        onClick={() => setIsNotebookOpen(false)}
                        className="font-[var(--font-display)] font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{dino.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                      </Link>
                      <p className="text-[11px] italic text-muted-foreground truncate">
                        {dino.scientificName}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                        {dino.subPeriod || dino.period} ({ageText}) · {dino.diet}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSave(dino.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      aria-label={`Remove ${dino.name} from notebook`}
                      title="Remove from notebook"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {savedSpecimens.length > 0 && (
            <div className="p-4 border-t border-border/60 bg-muted/20 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>{savedSpecimens.length} saved specimens</span>
                <span>Compare selected: {selectedCompareIds.length}/3</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={compareDinosaurs.length < 2}
                  onClick={() => setIsCompareOpen(true)}
                  className="col-span-2 rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>
                    {compareDinosaurs.length < 2
                      ? 'Check 2–3 Specimens to Compare'
                      : `Compare Selected (${compareDinosaurs.length})`}
                  </span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCopyExport('markdown')}
                  className="rounded-xl text-xs flex items-center gap-1.5"
                >
                  {copiedFormat === 'markdown' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span>Copied Notes</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Notes</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void handleCopyExport('bibtex')}
                  className="rounded-xl text-xs flex items-center gap-1.5"
                >
                  {copiedFormat === 'bibtex' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span>Copied BibTeX</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy BibTeX</span>
                    </>
                  )}
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearNotebook}
                className="w-full rounded-xl text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Field Notebook</span>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <SpecimenCompareDialog
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
        compareDinosaurs={compareDinosaurs}
      />
    </>
  );
}
