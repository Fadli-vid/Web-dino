'use client';

import { Bookmark, BookmarkCheck, Check, Eye, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Dinosaur } from '@/lib/types';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/cloudinary';

interface DinosaurCardProps {
  dinosaur: Dinosaur;
  isBookmarked?: boolean;
  isCompared?: boolean;
  isMaxCompare?: boolean;
  onToggleSave?: (id: string) => void;
  onQuickView?: (id: string) => void;
  onToggleCompare?: (dinosaur: Dinosaur) => void;
}

const dietStyles: Record<string, string> = {
  Carnivore: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  Herbivore: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Omnivore: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Piscivore: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  Insectivore: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
};

const periodStyles: Record<string, string> = {
  Triassic: 'border-amber-700/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Jurassic: 'border-emerald-700/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Cretaceous: 'border-sky-700/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

export function DinosaurCard({
  dinosaur,
  isBookmarked = false,
  isCompared = false,
  isMaxCompare = false,
  onToggleSave,
  onQuickView,
  onToggleCompare,
}: DinosaurCardProps) {
  const cardImage = getOptimizedImageUrl(dinosaur.image, {
    width: 800,
    quality: 'auto:good',
  });

  const hasActions = Boolean(onToggleSave || onQuickView || onToggleCompare);

  return (
    <Card className="group overflow-hidden h-full border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 gap-3.5 sm:gap-4 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      {/* Framed Image with rounded corners aligned flush with text content */}
      <Link
        href={`/species/${dinosaur.id}`}
        className="relative block w-full overflow-hidden rounded-xl border border-border/60 bg-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ aspectRatio: '4 / 3' }}
      >
        <Image
          src={cardImage}
          alt={dinosaur.imageAlt || dinosaur.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      </Link>

      {/* Content Area */}
      <div className="flex flex-col flex-1 justify-between gap-3.5 px-0.5">
        <div className="space-y-2.5">
          <div>
            <Link
              href={`/species/${dinosaur.id}`}
              className="block outline-none focus-visible:underline"
            >
              <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {dinosaur.name}
              </h3>
            </Link>
            <p className="text-xs italic text-muted-foreground line-clamp-1 mt-0.5">
              {dinosaur.scientificName}
            </p>
          </div>

          {/* Period & Diet (Left) + Action Icons (Right: visible on mobile, hover-only on desktop) */}
          <div className="flex items-center justify-between gap-2 min-h-[28px]">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium border ${
                  periodStyles[dinosaur.period] || 'border-border bg-background/80 text-foreground'
                }`}
              >
                {dinosaur.period}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  dietStyles[dinosaur.diet] || 'border-border bg-muted text-foreground'
                }`}
              >
                {dinosaur.diet}
              </span>
            </div>

            {hasActions && (
              <div className="flex items-center gap-1 shrink-0 transition-opacity duration-200 opacity-100 md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto">
                {onToggleSave && (
                  <button
                    type="button"
                    onClick={() => onToggleSave(dinosaur.id)}
                    className={`p-1.5 rounded-lg border shadow-xs transition-colors ${
                      isBookmarked
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background/90 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                    title={isBookmarked ? 'Saved in Field Notebook' : 'Save to Field Notebook'}
                    aria-label={
                      isBookmarked
                        ? `Remove ${dinosaur.name} from notebook`
                        : `Save ${dinosaur.name} to notebook`
                    }
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {onQuickView && (
                  <button
                    type="button"
                    onClick={() => onQuickView(dinosaur.id)}
                    className="p-1.5 rounded-lg border border-border/80 bg-background/90 text-muted-foreground hover:text-foreground hover:bg-muted/60 shadow-xs transition-colors"
                    title="Quick view specimen"
                    aria-label={`Quick view ${dinosaur.name}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}

                {onToggleCompare && (
                  <button
                    type="button"
                    disabled={isMaxCompare}
                    onClick={() => onToggleCompare(dinosaur)}
                    className={`p-1.5 rounded-lg border shadow-xs transition-colors ${
                      isCompared
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isMaxCompare
                        ? 'bg-muted/70 text-muted-foreground/50 border-border/60 cursor-not-allowed'
                        : 'bg-background/90 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                    title={
                      isCompared
                        ? 'Remove from compare'
                        : isMaxCompare
                        ? 'Maximum 3 specimens'
                        : 'Add to compare'
                    }
                    aria-label={
                      isCompared
                        ? `Remove ${dinosaur.name} from compare`
                        : `Add ${dinosaur.name} to compare`
                    }
                  >
                    {isCompared ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Scale className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <Link href={`/species/${dinosaur.id}`} className="block outline-none">
            <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
              {dinosaur.description}
            </p>
          </Link>
        </div>

        <Link
          href={`/species/${dinosaur.id}`}
          className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium outline-none"
        >
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              Length
            </span>
            <span className="font-semibold text-foreground">{dinosaur.length} m</span>
          </div>
          <div className="h-3 w-px bg-border/80" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              Weight
            </span>
            <span className="font-semibold text-foreground">
              {(dinosaur.weight / 1000).toFixed(1)} tons
            </span>
          </div>
        </Link>
      </div>
    </Card>
  );
}
