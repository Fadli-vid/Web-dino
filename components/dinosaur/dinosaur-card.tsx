'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Dinosaur } from '@/lib/types';
import Image from 'next/image';

interface DinosaurCardProps {
  dinosaur: Dinosaur;
}

const dietStyles: Record<string, string> = {
  Carnivore: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  Herbivore: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Omnivore: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

const periodStyles: Record<string, string> = {
  Triassic: 'border-amber-700/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Jurassic: 'border-emerald-700/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Cretaceous: 'border-teal-700/30 bg-teal-500/10 text-teal-700 dark:text-teal-300',
};

export function DinosaurCard({ dinosaur }: DinosaurCardProps) {
  return (
    <Link
      href={`/species/${dinosaur.id}`}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
    >
      <Card className="overflow-hidden h-full border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 flex flex-col">
        <div
          className="relative w-full overflow-hidden bg-muted/40"
          style={{ aspectRatio: '4 / 3' }}
        >
          <Image
            src={dinosaur.image}
            alt={dinosaur.imageAlt || dinosaur.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium border backdrop-blur-md ${periodStyles[dinosaur.period] || 'border-border bg-background/80 text-foreground'}`}>
              {dinosaur.period}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-[var(--font-display)] text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {dinosaur.name}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${dietStyles[dinosaur.diet] || 'border-border bg-muted text-foreground'}`}>
                {dinosaur.diet}
              </span>
            </div>
            <p className="text-xs italic text-muted-foreground line-clamp-1 mt-0.5">
              {dinosaur.scientificName}
            </p>
            <p className="text-xs text-muted-foreground/90 line-clamp-2 mt-3 leading-relaxed">
              {dinosaur.description}
            </p>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Length</span>
              <span className="font-semibold text-foreground">{dinosaur.length} m</span>
            </div>
            <div className="h-3 w-px bg-border/80" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Weight</span>
              <span className="font-semibold text-foreground">{(dinosaur.weight / 1000).toFixed(1)} tons</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
