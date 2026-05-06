'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dinosaur } from '@/lib/types';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Dna, Fingerprint, Pickaxe, Ruler, Scale, PersonStanding, Map, GitMerge } from 'lucide-react';
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

      {/* Size Comparison */}
      <Card className="p-6 md:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <PersonStanding className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <PersonStanding className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Size Comparison</h2>
          </div>
          {dinosaur.sizeComparisonUrl ? (
            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-border/40">
              <Image src={dinosaur.sizeComparisonUrl} alt="Size comparison" fill className="object-cover" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-2xl border border-border/40 min-h-[250px]">
              <div className="flex items-end justify-center gap-12 md:gap-24 w-full mt-4">
                {/* Human placeholder */}
                <div className="flex flex-col items-center">
                  <div className="h-[40px] border-l-2 border-primary/50 border-dashed mb-2 flex items-center justify-center relative">
                    <span className="absolute -left-10 text-xs font-bold text-primary/70">1.8m</span>
                  </div>
                  <PersonStanding className="h-16 w-16 text-muted-foreground" />
                  <span className="text-sm font-medium mt-2">Human</span>
                </div>
                {/* Dino placeholder */}
                <div className="flex flex-col items-center">
                  <div className="h-[80px] border-l-2 border-primary/50 border-dashed mb-2 flex items-center justify-center relative">
                    <span className="absolute -right-12 text-xs font-bold text-primary/70">{dinosaur.length}m</span>
                  </div>
                  <div className="w-32 h-16 md:w-48 md:h-24 bg-primary/20 rounded-t-full rounded-bl-full relative border-b-4 border-primary shadow-inner flex items-center justify-center">
                     <span className="font-extrabold text-primary/40 text-xl md:text-2xl uppercase tracking-widest">{dinosaur.name.substring(0,3)}</span>
                  </div>
                  <span className="text-sm font-medium mt-2">{dinosaur.name}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-10 text-center max-w-lg">
                Interactive visualization comparing the size of an average adult human to a fully grown {dinosaur.name}.
              </p>
            </div>
          )}
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

      {/* Evolutionary Tree */}
      <Card className="p-6 md:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 p-8 opacity-5">
          <GitMerge className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <GitMerge className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Evolutionary Tree</h2>
          </div>
          {dinosaur.evolutionaryTreeUrl ? (
            <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-border/40">
              <Image src={dinosaur.evolutionaryTreeUrl} alt="Evolutionary tree" fill className="object-contain" />
            </div>
          ) : (
            <div className="w-full py-12 bg-muted/30 rounded-2xl border border-border/40 flex flex-col items-center justify-center relative">
               <div className="flex flex-col items-center space-y-4">
                  <div className="px-6 py-2 bg-background border border-border rounded-full text-foreground font-medium shadow-sm">Dinosauria</div>
                  <div className="w-px h-6 bg-border"></div>
                  <div className="px-6 py-2 bg-background border border-border rounded-full text-foreground font-medium shadow-sm">{dinosaur.taxonomy?.order || 'Unknown Order'}</div>
                  <div className="w-px h-6 bg-border"></div>
                  <div className="flex gap-4 items-center">
                    <div className="w-8 md:w-16 h-px bg-border"></div>
                    <div className="px-6 py-3 bg-primary text-primary-foreground shadow-lg rounded-xl font-bold text-lg md:text-xl tracking-tight">{dinosaur.name}</div>
                    <div className="w-8 md:w-16 h-px bg-border"></div>
                  </div>
               </div>
               <p className="text-muted-foreground text-sm mt-10 text-center max-w-lg">
                Taxonomic diagram showing the closest relatives and evolutionary lineage.
              </p>
            </div>
          )}
        </div>
      </Card>

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

      {/* Habitat & Fossil Map */}
      <Card className="p-6 md:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Map className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Map className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Habitat & Fossil Map</h2>
          </div>
          {dinosaur.habitatMapUrl ? (
            <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-border/40">
              <Image src={dinosaur.habitatMapUrl} alt="Habitat map" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-full h-[300px] bg-muted/30 rounded-2xl border border-border/40 flex flex-col items-center justify-center relative overflow-hidden">
              <Map className="w-32 h-32 text-muted-foreground/10 absolute" />
              <div className="z-10 text-center px-4">
                <div className="inline-flex items-center justify-center p-3 bg-background border border-border rounded-xl shadow-sm mb-4">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Location: {dinosaur.locationFound}</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  Interactive map visualization highlighting the habitat and fossil discovery points.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
