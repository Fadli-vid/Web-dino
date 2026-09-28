'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dinosaur } from '@/lib/types';
import Image from 'next/image';
import {
  ArrowLeft,
  BookOpen,
  Dna,
  Fingerprint,
  Pickaxe,
  Ruler,
  Scale,
  PersonStanding,
  MapPin,
  GitMerge,
  Share2,
  Check,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

interface DinosaurDetailProps {
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

export function DinosaurDetail({ dinosaur }: DinosaurDetailProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scaleRatio = (dinosaur.length / 1.8).toFixed(1);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Dossier Sub-Nav & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Link href="/" className="hover:text-foreground transition-colors">
            Archive
          </Link>
          <span>/</span>
          <span>Specimens</span>
          <span>/</span>
          <span className="text-foreground font-semibold font-[var(--font-display)]">
            {dinosaur.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-xl border-border/80 text-xs flex items-center gap-1.5 h-8 bg-card/60 hover:bg-card"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Share Dossier</span>
              </>
            )}
          </Button>

          <Button asChild variant="outline" size="sm" className="rounded-xl border-border/80 text-xs h-8 bg-card/60 hover:bg-card">
            <Link href="/" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Back to Archive</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Specimen Dossier (Asymmetric 12-Col Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Specimen Photograph & Catalog Plaque */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="overflow-hidden border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-lg relative group">
            <div className="relative w-full aspect-[4/3] bg-muted/40 overflow-hidden">
              <Image
                src={dinosaur.image}
                alt={dinosaur.imageAlt || dinosaur.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Top Period & Diet Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border backdrop-blur-md ${
                    periodStyles[dinosaur.period] || 'border-border bg-background/80 text-foreground'
                  }`}
                >
                  {dinosaur.period}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border backdrop-blur-md ${
                    dietStyles[dinosaur.diet] || 'border-border bg-muted text-foreground'
                  }`}
                >
                  {dinosaur.diet}
                </span>
              </div>

              {/* Bottom Catalog Plaque */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-background/90 backdrop-blur-md border border-border/80 flex items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                    Catalog Record
                  </div>
                  <div className="font-[var(--font-display)] font-bold text-sm text-foreground">
                    #{dinosaur.id.toUpperCase()} : {dinosaur.taxonomy?.order || 'Dinosauria'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                    Verified Specimen
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Specimen Title & Biometric Matrix */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {dinosaur.name}
            </h1>
            <p className="text-base sm:text-lg italic text-muted-foreground">
              {dinosaur.scientificName}
            </p>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground/90 leading-relaxed">
            {dinosaur.description}
          </p>

          {/* Key Biometrics 4-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
            {/* Length */}
            <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                  Body Length
                </span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {dinosaur.length} m
                </span>
              </div>
            </div>

            {/* Weight */}
            <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                  Estimated Weight
                </span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {(dinosaur.weight / 1000).toFixed(1)} tons
                </span>
              </div>
            </div>

            {/* Discovery Year */}
            <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                  Discovered Year
                </span>
                <span className="text-lg font-bold font-mono text-foreground">
                  {dinosaur.discovered}
                </span>
              </div>
            </div>

            {/* Fossils Recovered */}
            <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Pickaxe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                  Fossils Recovered
                </span>
                <span className="text-sm font-semibold text-foreground line-clamp-1 mt-0.5">
                  {dinosaur.fossils}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Scale Comparison */}
      <Card className="p-6 sm:p-8 border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <PersonStanding className="h-5 w-5 text-primary" />
            <h2 className="font-[var(--font-display)] text-xl font-bold text-foreground">
              Biometric Scale Comparison
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Scale Index: {scaleRatio}x adult human height (1.8m)
          </span>
        </div>

        {dinosaur.sizeComparisonUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/60 bg-muted/30 flex items-center justify-center">
            <Image
              src={dinosaur.sizeComparisonUrl}
              alt={`Scale comparison of ${dinosaur.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-muted/25 rounded-xl border border-border/60 aspect-video min-h-[260px]">
            <div className="flex items-end justify-center gap-12 sm:gap-24 w-full mt-4">
              {/* Human figure representation */}
              <div className="flex flex-col items-center">
                <div className="h-[46px] border-l-2 border-primary/60 border-dashed mb-2 flex items-center justify-center relative">
                  <span className="absolute -left-12 text-xs font-mono font-bold text-primary">
                    1.8 m
                  </span>
                </div>
                <PersonStanding className="h-16 w-16 text-muted-foreground/80" />
                <span className="text-xs font-medium text-muted-foreground mt-2">
                  Adult Human
                </span>
              </div>

              {/* Dinosaur figure representation */}
              <div className="flex flex-col items-center">
                <div className="h-[92px] border-l-2 border-primary/60 border-dashed mb-2 flex items-center justify-center relative">
                  <span className="absolute -right-14 text-xs font-mono font-bold text-primary">
                    {dinosaur.length} m
                  </span>
                </div>
                <div className="w-36 h-20 sm:w-56 sm:h-28 bg-primary/15 border-2 border-primary/40 rounded-t-3xl rounded-bl-3xl shadow-inner flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-[var(--font-display)] font-extrabold text-primary text-base sm:text-xl tracking-wider uppercase">
                    {dinosaur.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {dinosaur.length}m body length
                  </span>
                </div>
                <span className="text-xs font-medium text-foreground mt-2 font-mono">
                  {dinosaur.name} (Adult)
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-8 text-center max-w-md">
              Proportional dimension metric relative to an average adult human (1.8m).
            </p>
          </div>
        )}
      </Card>

      {/* 2-Column Grid: Taxonomy & Morphological Traits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Taxonomy Ledger */}
        <Card className="p-6 sm:p-7 border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <Dna className="h-5 w-5 text-primary" />
            <h2 className="font-[var(--font-display)] text-lg font-bold text-foreground">
              Taxonomic Classification
            </h2>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            {Object.entries(dinosaur.taxonomy || {}).map(([rank, taxon]) => (
              <div key={rank} className="py-2.5 flex items-center justify-between gap-4">
                <span className="font-mono text-muted-foreground uppercase tracking-wider text-[11px]">
                  {rank}
                </span>
                <span className="font-semibold text-foreground text-right">
                  {taxon}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Morphological Characteristics */}
        <Card className="p-6 sm:p-7 border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <Fingerprint className="h-5 w-5 text-primary" />
            <h2 className="font-[var(--font-display)] text-lg font-bold text-foreground">
              Morphological Characteristics
            </h2>
          </div>

          <div className="space-y-2.5">
            {(dinosaur.characteristics || []).map((trait, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed"
              >
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-foreground font-medium">{trait}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Phylogenetic & Evolutionary Lineage */}
      <Card className="p-6 sm:p-8 border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <GitMerge className="h-5 w-5 text-primary" />
          <h2 className="font-[var(--font-display)] text-xl font-bold text-foreground">
            Evolutionary Lineage & Clade
          </h2>
        </div>

        {dinosaur.evolutionaryTreeUrl ? (
          <div className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden border border-border/60 bg-muted/30">
            <Image
              src={dinosaur.evolutionaryTreeUrl}
              alt={`Evolutionary tree for ${dinosaur.name}`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-full py-10 px-4 bg-muted/20 rounded-xl border border-border/60 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="px-4 py-1.5 rounded-md border border-border/80 bg-card text-xs font-mono text-muted-foreground shadow-xs">
                Clade: Dinosauria
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="px-4 py-1.5 rounded-md border border-border/80 bg-card text-xs font-mono text-muted-foreground shadow-xs">
                Order: {dinosaur.taxonomy?.order || 'Unknown Order'}
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="px-4 py-1.5 rounded-md border border-border/80 bg-card text-xs font-mono text-muted-foreground shadow-xs">
                Family: {dinosaur.taxonomy?.family || 'Theropoda'}
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="px-6 py-2.5 rounded-xl border border-primary/50 bg-primary/15 text-primary font-[var(--font-display)] font-bold text-base shadow-sm">
                Genus: {dinosaur.name}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-8 text-center max-w-md">
              Taxonomic lineage diagram showing evolutionary descent within the clade Dinosauria.
            </p>
          </div>
        )}
      </Card>

      {/* Fossil Discovery & Field Provenance */}
      <Card className="p-6 sm:p-8 border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-[var(--font-display)] text-xl font-bold text-foreground">
            Geographic Provenance & Excavation Site
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Primary Excavation Site
            </span>
            <p className="text-base font-bold text-foreground">
              {dinosaur.locationFound || 'Global Archive Record'}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Discovery Year
            </span>
            <p className="text-base font-bold text-foreground">
              {dinosaur.discovered}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Specimen Material Found
            </span>
            <p className="text-base font-bold text-foreground">
              {dinosaur.fossils}
            </p>
          </div>
        </div>

        {dinosaur.habitatMapUrl ? (
          <div className="relative w-full h-[280px] sm:h-[360px] rounded-xl overflow-hidden border border-border/60 bg-muted/30">
            <Image
              src={dinosaur.habitatMapUrl}
              alt={`Habitat map for ${dinosaur.name}`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-[var(--font-display)] font-bold text-sm text-foreground">
              Provenance Record: {dinosaur.locationFound}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Fossil stratum excavated from regional formations dated to the {dinosaur.period} geological era.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
