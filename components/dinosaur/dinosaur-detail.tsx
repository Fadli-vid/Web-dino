'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dinosaur } from '@/lib/types';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
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
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Image */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden border-muted-foreground/20">
            <div className="relative w-full h-96 md:h-[500px] bg-muted">
              <Image
                src={dinosaur.image}
                alt={dinosaur.imageAlt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Card>
        </div>

        {/* Quick Info */}
        <Card className="p-6 border-muted-foreground/20 h-fit space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{dinosaur.name}</h1>
            <p className="text-muted-foreground italic mt-1">{dinosaur.scientificName}</p>
          </div>

          <div className="space-y-3 border-t border-muted-foreground/10 pt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Period</p>
              <Badge className={`${periodColors[dinosaur.period]} mt-1`}>{dinosaur.period}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Diet</p>
              <Badge className={`${dietColors[dinosaur.diet]} mt-1`}>{dinosaur.diet}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Length</p>
              <p className="text-sm font-medium text-foreground mt-1">{dinosaur.length}m</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Weight</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {(dinosaur.weight / 1000).toFixed(1)} tons
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Description */}
      <Card className="p-6 border-muted-foreground/20">
        <h2 className="text-2xl font-bold text-foreground mb-3">Overview</h2>
        <p className="text-muted-foreground leading-relaxed">{dinosaur.description}</p>
      </Card>

      {/* Taxonomy */}
      <Card className="p-6 border-muted-foreground/20">
        <h2 className="text-2xl font-bold text-foreground mb-4">Taxonomy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(dinosaur.taxonomy).map(([key, value]) => (
            <div key={key} className="border-b border-muted-foreground/10 pb-3">
              <p className="text-xs text-muted-foreground uppercase font-semibold">{key}</p>
              <p className="text-sm text-foreground font-medium mt-1">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Characteristics */}
      <Card className="p-6 border-muted-foreground/20">
        <h2 className="text-2xl font-bold text-foreground mb-4">Characteristics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dinosaur.characteristics.map((char, idx) => (
            <div key={idx} className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span>{char}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Fossil & Discovery Info */}
      <Card className="p-6 border-muted-foreground/20">
        <h2 className="text-2xl font-bold text-foreground mb-4">Fossil Record & Discovery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Fossils Found</p>
            <p className="text-sm text-foreground font-medium mt-2">{dinosaur.fossils}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Year Discovered</p>
            <p className="text-sm text-foreground font-medium mt-2">{dinosaur.discovered}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Location</p>
            <p className="text-sm text-foreground font-medium mt-2">{dinosaur.locationFound}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
