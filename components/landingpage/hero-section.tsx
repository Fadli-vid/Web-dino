'use client';

import { useRef, useState } from 'react';
import { Play, Pause, Film } from 'lucide-react';
import { SearchBar } from '@/components/dinosaur/search-bar';
import { getOptimizedVideoUrl } from '@/lib/cloudinary';

const HERO_VIDEO_SRC = getOptimizedVideoUrl(
  'https://res.cloudinary.com/dhx7maf56/video/upload/v1792228140/gemini_generated_video_bd55a90e_mqdlrq.mp4',
  { width: 1920, quality: 'auto:good', audioCodec: 'none' }
);

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
    <section className="relative overflow-hidden border-b border-border/60 min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] flex items-center">
      {/* 10s Loop Dinosaur Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/hero-specimen.jpg"
          className="w-full h-full object-cover scale-[1.01] transition-transform duration-700"
        >
          <source
            src={HERO_VIDEO_SRC}
            type="video/mp4"
          />
        </video>

        {/* Ambient Gradient Overlays for Seamless Theme Integration & Text Contrast */}
        {/* Mobile & Desktop: 20% lighter ambient scrim so dinosaur video action is clearly visible while text stays sharp */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/72 via-background/65 to-background/78 md:bg-gradient-to-r md:from-background/80 md:via-background/75 md:via-38% md:to-transparent pointer-events-none" />

        {/* Top subtle seam blend from header */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />

        {/* Bottom smooth blend into specimen ledger */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/65 via-background/15 to-transparent pointer-events-none" />

        {/* Subtle radial warmth / museum lighting accent */}
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_15%_25%,oklch(0.42_0.13_150/0.06),transparent_65%)] pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 w-full">
        <div className="grid items-center gap-6 lg:gap-8 lg:grid-cols-12">
          {/* Main Editorial & Search Column */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <h1 className="font-[var(--font-display)] text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.12] sm:leading-[1.08] text-balance">
              Explore Prehistoric Fossils & Ancient Fauna
            </h1>

            <p className="text-xs sm:text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Comprehensive catalog of global dinosaur specimens spanning the Triassic, Jurassic, and Cretaceous eras with verified taxonomy, skeletal metrics, and fossil records.
            </p>

            {/* Quick Search */}
            <div className="pt-1 max-w-xl">
              <SearchBar
                onSearch={onSearch}
                onClear={() => onSearch('')}
                initialValue={initialSearch}
                placeholder="Search specimens, eras, diet..."
                debounceMs={1500}
              />
            </div>

            {/* Mobile: Unified Sleek Glassmorphic Pill Strip */}
            <div className="sm:hidden pt-1">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border/80 bg-card/85 backdrop-blur-md shadow-xs text-xs font-mono">
                <span className="font-semibold text-foreground">{totalSpecies} Species</span>
                <span className="text-border/80">·</span>
                <span className="text-muted-foreground">3 Eras</span>
                <span className="text-border/80">·</span>
                <span className="text-muted-foreground">Full Taxonomy</span>
              </div>
            </div>

            {/* Tablet & Desktop: 3-Card Specimen Counter Strip */}
            <div className="hidden sm:grid pt-2 grid-cols-3 gap-3 max-w-lg">
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
