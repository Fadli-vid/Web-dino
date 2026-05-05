'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dinosaur } from '@/lib/types';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Dna, Fingerprint, Pickaxe, Ruler, Scale } from 'lucide-react';
import Link from 'next/link';

interface DinosaurDetailProps {
  dinosaur: Dinosaur;
}

const periodColors: Record<string, string> = {
  Triassic: 'bg-blue-900/20 text-blue-400',
  Jurassic: 'bg-purple-900/20 text-purple-400',
  Cretaceous: 'bg-orange-900/20 text-orange-400',
};

const dietColors: Record<string, string> = {
  Carnivore: 'bg-red-900/20 text-red-400',
  Herbivore: 'bg-green-900/20 text-green-400',
  Omnivore: 'bg-yellow-900/20 text-yellow-400',
};

export function DinosaurDetail({ dinosaur }: DinosaurDetailProps) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium bg-muted/50 hover:bg-muted px-5 py-2.5 rounded-full w-fit shadow-sm border border-border/50 backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Expedition
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-border/80 border-b-4 border-b-primary/20 rounded-3xl bg-card/80 backdrop-blur-md shadow-lg h-full flex flex-col">
            <div className="relative w-full h-[400px] lg:h-[500px] bg-muted/30">
              <Image
                src={dinosaur.image}
                alt={dinosaur.imageAlt}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </Card>
        </div>

        {/* Quick Info */}
        <Card className="p-6 lg:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm h-fit space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{dinosaur.name}</h1>
            <p className="text-muted-foreground italic mt-2 text-lg">{dinosaur.scientificName}</p>
          </div>

          <div className="space-y-5 border-t border-border/50 pt-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Era / Period</p>
              <Badge className={`${periodColors[dinosaur.period]} px-3 py-1 rounded-full border-none shadow-sm font-medium`}>{dinosaur.period}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Diet</p>
              <Badge className={`${dietColors[dinosaur.diet]} px-3 py-1 rounded-full border-none shadow-sm font-medium`}>{dinosaur.diet}</Badge>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Length</p>
                <p className="text-base font-bold text-foreground mt-0.5">{dinosaur.length}m</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Weight</p>
                <p className="text-base font-bold text-foreground mt-0.5">
                  {(dinosaur.weight / 1000).toFixed(1)} tons
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Description */}
      <Card className="p-6 md:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BookOpen className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Expedition Log</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-lg max-w-4xl">{dinosaur.description}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Taxonomy */}
        <Card className="p-6 md:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm h-full relative overflow-hidden">
          <div className="absolute bottom-0 right-0 p-8 opacity-5">
            <Dna className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Dna className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Taxonomy</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(dinosaur.taxonomy || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center border-b border-border/40 pb-3">
                  <p className="text-sm text-muted-foreground font-medium">{key}</p>
                  <p className="text-sm text-foreground font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Characteristics */}
        <Card className="p-6 md:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Fingerprint className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Characteristics</h2>
            </div>
            <div className="space-y-4">
              {(dinosaur.characteristics || []).map((char, idx) => (
                <div key={idx} className="flex items-start gap-3 text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/30">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="font-medium text-sm">{char}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Fossil & Discovery Info */}
      <Card className="p-6 md:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute bottom-0 left-0 p-8 opacity-5">
          <Pickaxe className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Pickaxe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Fossil Record & Discovery</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted/30 p-5 rounded-2xl border border-border/40">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Fossils Found</p>
              <p className="text-lg text-foreground font-bold mt-2">{dinosaur.fossils}</p>
            </div>
            <div className="bg-muted/30 p-5 rounded-2xl border border-border/40">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Year Discovered</p>
              <p className="text-lg text-foreground font-bold mt-2">{dinosaur.discovered}</p>
            </div>
            <div className="bg-muted/30 p-5 rounded-2xl border border-border/40">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Location</p>
              <p className="text-lg text-foreground font-bold mt-2">{dinosaur.locationFound}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
