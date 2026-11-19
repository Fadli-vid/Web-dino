'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, SearchX } from 'lucide-react';
import { Dinosaur } from '@/lib/types';
import { DinosaurCard } from '@/components/catalog/dinosaur-card';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { useFieldNotebook } from '@/hooks/use-field-notebook';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

interface SpecimenGalleryProps {
  dinosaurs: Dinosaur[];
  viewMode: 'grid' | 'list';
  compareIds: string[];
  onToggleCompare: (dinosaur: Dinosaur) => void;
  onQuickView: (dinosaurId: string) => void;
  onResetFilters: () => void;
}

export function SpecimenGallery({
  dinosaurs,
  viewMode,
  compareIds,
  onToggleCompare,
  onQuickView,
  onResetFilters,
}: SpecimenGalleryProps) {
  const compareSet = new Set(compareIds);
  const { isSaved, isHydrated, toggleSave } = useFieldNotebook();

  if (dinosaurs.length === 0) {
    return (
      <Empty className="border border-border/80 bg-card/60 rounded-2xl p-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX className="w-5 h-5 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle className="font-[var(--font-display)] text-lg text-foreground">
            No specimens found
          </EmptyTitle>
          <EmptyDescription className="text-xs">
            Adjust your filter criteria or try a different search keyword.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="rounded-xl text-xs"
          >
            Reset All Filters
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {dinosaurs.map((dinosaur) => {
          const isCompared = compareSet.has(dinosaur.id);
          const isMaxCompare = compareIds.length >= 3 && !isCompared;
          const isBookmarked = isHydrated && isSaved(dinosaur.id);

          return (
            <DinosaurCard
              key={dinosaur.id}
              dinosaur={dinosaur}
              isBookmarked={isBookmarked}
              isCompared={isCompared}
              isMaxCompare={isMaxCompare}
              onToggleSave={toggleSave}
              onQuickView={onQuickView}
              onToggleCompare={onToggleCompare}
            />
          );
        })}
      </div>
    );
  }

  /* List / Ledger Mode */
  return (
    <div className="space-y-3">
      {dinosaurs.map((dinosaur) => {
        const isCompared = compareSet.has(dinosaur.id);
        const isMaxCompare = compareIds.length >= 3 && !isCompared;
        const isBookmarked = isHydrated && isSaved(dinosaur.id);

        return (
          <div
            key={dinosaur.id}
            className="rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-4 transition-all hover:border-primary/40 hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-24 h-16 aspect-[3/2] rounded-xl overflow-hidden bg-muted/40 shrink-0 border border-border/60">
                <Image
                  src={getOptimizedImageUrl(dinosaur.image, { width: 300, quality: 'auto:good' })}
                  alt={dinosaur.imageAlt || dinosaur.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/species/${dinosaur.id}`}
                    className="font-[var(--font-display)] font-bold text-base text-foreground hover:text-primary transition-colors"
                  >
                    {dinosaur.name}
                  </Link>
                  <span className="text-xs italic text-muted-foreground hidden md:inline">
                    ({dinosaur.scientificName})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80 font-medium">
                    {dinosaur.period}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80 font-medium">
                    {dinosaur.diet}
                  </span>
                  <span className="font-mono">
                    L: {dinosaur.length}m | W: {(dinosaur.weight / 1000).toFixed(1)}t
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant={isBookmarked ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleSave(dinosaur.id)}
                className={`rounded-xl text-xs px-2.5 ${
                  isBookmarked ? 'bg-primary text-primary-foreground' : ''
                }`}
                title={isBookmarked ? 'Saved in Field Notebook' : 'Save to Field Notebook'}
                aria-label={isBookmarked ? `Remove ${dinosaur.name} from notebook` : `Save ${dinosaur.name} to notebook`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-3.5 h-3.5" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuickView(dinosaur.id)}
                className="rounded-xl text-xs"
              >
                Quick View
              </Button>
              <Button
                variant={isCompared ? 'default' : 'outline'}
                size="sm"
                disabled={isMaxCompare}
                onClick={() => onToggleCompare(dinosaur)}
                className={`rounded-xl text-xs ${
                  isCompared ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {isCompared ? 'Selected' : 'Compare'}
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href={`/species/${dinosaur.id}`}>Details</Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
