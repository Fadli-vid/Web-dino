'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Film } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border/60 min-h-[480px] lg:min-h-[540px] flex items-center">
      {/* 10s Loop Dinosaur Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-specimen.jpg"
          className="w-full h-full object-cover scale-[1.01] transition-transform duration-700"
        >
          <source src="/asset/loop-dino.webm" type="video/webm" />
        </video>

        {/* Ambient Gradient Overlays for Seamless Theme Integration & Text Contrast */}
        {/* Left-to-right scrim (solid on text side for readability, completely transparent on the right to reveal the video clearly) */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 via-42% to-transparent pointer-events-none" />

        {/* Top subtle seam blend from header */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />

        {/* Bottom smooth blend into geological strata bar */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />

        {/* Subtle radial warmth / museum lighting accent focused on the left */}
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_15%_25%,oklch(0.42_0.13_150/0.06),transparent_65%)] pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          {/* Main Editorial & Search Column */}
          <div className="lg:col-span-8 space-y-6">
            <h1 className="font-[var(--font-display)] text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08] text-balance">
              Explore Prehistoric Fossils & Ancient Fauna
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Comprehensive catalog of global dinosaur specimens spanning the Triassic, Jurassic, and Cretaceous eras with verified taxonomy, skeletal metrics, and fossil records.
            </p>

            {/* Quick Search */}
            <div className="pt-1 max-w-xl">
              <SearchBar
                onSearch={onSearch}
                onClear={() => onSearch('')}
                initialValue={initialSearch}
                debounceMs={1500}
              />
            </div>

            {/* Quick Specimen Counter Strip */}
            <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg">
              <div className="rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-3 shadow-xs">
                <div className="text-[10px] uppercase font-mono text-muted-foreground">Fossil Collection</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{totalSpecies} Species</div>
              </div>
              <div className="rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-3 shadow-xs">
                <div className="text-[10px] uppercase font-mono text-muted-foreground">Temporal Range</div>
                <div className="text-xl font-bold text-foreground mt-0.5">3 Eras</div>
              </div>
              <div className="rounded-xl border border-border/80 bg-card/80 backdrop-blur-md p-3 shadow-xs">
                <div className="text-[10px] uppercase font-mono text-muted-foreground">Classification</div>
                <div className="text-xl font-bold text-foreground mt-0.5">Full Taxonomy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
