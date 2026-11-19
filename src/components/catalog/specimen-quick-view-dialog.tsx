'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock,
  Footprints,
  Ruler,
  Scale,
} from 'lucide-react';
import { Dinosaur } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { useFieldNotebook } from '@/hooks/use-field-notebook';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SpecimenQuickViewDialogProps {
  dinosaur: Dinosaur | null;
  onClose: () => void;
}

export function SpecimenQuickViewDialog({
  dinosaur,
  onClose,
}: SpecimenQuickViewDialogProps) {
  const { isSaved, isHydrated, toggleSave } = useFieldNotebook();
  const saved = Boolean(dinosaur && isHydrated && isSaved(dinosaur.id));

  return (
    <Dialog
      open={Boolean(dinosaur)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {dinosaur && (
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-[95vw] sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8">
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.2fr_1fr] lg:gap-8 items-start">
            {/* Specimen Visual */}
            <div className="relative aspect-[4/3] md:aspect-[16/11] lg:aspect-[16/10] rounded-2xl overflow-hidden border border-border/70 bg-muted/40 shadow-sm">
              <Image
                src={getOptimizedImageUrl(dinosaur.image, { width: 1200, quality: 'auto:good' })}
                alt={dinosaur.imageAlt || dinosaur.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none md:hidden" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-background/85 backdrop-blur-md border border-border/60 text-[10px] font-mono uppercase tracking-wider text-muted-foreground shadow-xs">
                  #{dinosaur.id.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Specimen Dossier Snapshot */}
            <div className="flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <DialogHeader className="text-left space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold bg-primary/10 text-primary border border-primary/20">
                      {dinosaur.period}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border/60 bg-muted/40">
                      {dinosaur.diet}
                    </span>
                    {dinosaur.subPeriod && (
                      <span className="text-[11px] font-mono text-muted-foreground">
                        · {dinosaur.subPeriod}
                      </span>
                    )}
                  </div>

                  <DialogTitle className="font-[var(--font-display)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                    {dinosaur.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm italic font-serif text-muted-foreground">
                    {dinosaur.scientificName}
                  </DialogDescription>
                </DialogHeader>

                <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed line-clamp-5">
                  {dinosaur.description}
                </p>

                {/* 4-Stat Metric Strip Consistent with Analytics Dialog */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                  <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <Ruler className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Body Length</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold font-mono text-foreground">
                      {dinosaur.length} m
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <Scale className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Estimated Mass</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold font-mono text-foreground">
                      {(dinosaur.weight / 1000).toFixed(1)} tons
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Temporal Range</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold font-mono text-foreground">
                      {dinosaur.myaStart !== undefined && dinosaur.myaEnd !== undefined
                        ? `${dinosaur.myaStart}–${dinosaur.myaEnd} Ma`
                        : dinosaur.period}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/25 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <Footprints className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Locomotion</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold font-mono text-foreground truncate">
                      {dinosaur.locomotion || 'Terrestrial'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60">
                <Button
                  asChild
                  className="flex-1 rounded-xl text-xs sm:text-sm h-10 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 font-medium"
                >
                  <Link href={`/species/${dinosaur.id}`}>
                    <span>View Full Dossier</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant={saved ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSave(dinosaur.id)}
                  className={`rounded-xl text-xs sm:text-sm h-10 px-3.5 flex items-center gap-2 ${
                    saved ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  title={saved ? 'Remove from Field Notebook' : 'Save to Field Notebook'}
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-xl text-xs sm:text-sm h-10 px-4">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
