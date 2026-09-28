'use client';

import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/dinosaur/search-bar';

interface HeroSectionProps {
  totalSpecies: number;
  onSearch: (query: string) => void;
  initialSearch?: string;
}

export function HeroSection({
  totalSpecies,
  onSearch,
  initialSearch = '',
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(1000px_400px_at_15%_10%,oklch(0.42_0.13_150/0.08),transparent),radial-gradient(800px_400px_at_85%_20%,oklch(0.70_0.15_65/0.08),transparent)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              Explore Prehistoric Fossils & Ancient Fauna
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Comprehensive catalog of global dinosaur specimens spanning the Triassic, Jurassic, and Cretaceous eras with verified taxonomy and fossil records.
            </p>

            {/* Quick Search */}
            <div className="pt-2 max-w-xl">
              <SearchBar
                onSearch={onSearch}
                onClear={() => onSearch('')}
                initialValue={initialSearch}
                debounceMs={1500}
              />
            </div>

            {/* Quick Specimen Counter Strip */}
            <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg">
              <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3">
                <div className="text-[10px] uppercase font-mono text-muted-foreground">Fossil Collection</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{totalSpecies} Species</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3">
                <div className="text-[10px] uppercase font-mono text-muted-foreground">Temporal Range</div>
                <div className="text-xl font-bold text-foreground mt-0.5">3 Eras</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3">
                <div className="text-[10px] uppercase font-mono text-muted-foreground">Classification</div>
                <div className="text-xl font-bold text-foreground mt-0.5">Full Taxonomy</div>
              </div>
            </div>
          </div>

          {/* Right Visual Feature */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-card/90 shadow-2xl">
              <div className="relative aspect-[4/3] w-full bg-muted/40">
                <Image
                  src="/hero-specimen.jpg"
                  alt="Museum Paleontology Dinosaur Fossil Specimen"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Museum Specimen Plaque */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-background/90 backdrop-blur-md border border-border/80 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                      Featured Specimen
                    </div>
                    <div className="font-[var(--font-display)] font-bold text-sm text-foreground">
                      Theropoda & Carnosauria
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                    Museum Grade
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
