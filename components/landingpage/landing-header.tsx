'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeaderProps {
  totalSpecies: number;
}

export function LandingHeader({ totalSpecies }: LandingHeaderProps) {
  const handleScrollToLedger = () => {
    const element = document.getElementById('specimen-ledger');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group outline-none">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-[var(--font-display)] text-lg font-bold tracking-tight text-foreground">
              WIKIDINO
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest text-muted-foreground/80">
              Paleontology Archive
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md border border-border/60 bg-muted/40 text-xs font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{totalSpecies} Documented Specimens</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border/80 text-xs"
            onClick={handleScrollToLedger}
          >
            Explore Archive
          </Button>
        </div>
      </div>
    </header>
  );
}
