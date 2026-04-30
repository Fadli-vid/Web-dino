'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Dinosaur } from '@/lib/types';
import Image from 'next/image';

interface DinosaurCardProps {
  dinosaur: Dinosaur;
}

const dietColors: Record<string, string> = {
  Carnivore: 'bg-red-900/20 text-red-400',
  Herbivore: 'bg-green-900/20 text-green-400',
  Omnivore: 'bg-yellow-900/20 text-yellow-400',
};

const periodColors: Record<string, string> = {
  Triassic: 'bg-blue-900/20 text-blue-400',
  Jurassic: 'bg-purple-900/20 text-purple-400',
  Cretaceous: 'bg-orange-900/20 text-orange-400',
};

export function DinosaurCard({ dinosaur }: DinosaurCardProps) {
  return (
    <Link href={`/species/${dinosaur.id}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full border-border/80 border-b-4 border-b-primary/20 hover:border-b-primary/60 group bg-card/80 backdrop-blur-sm rounded-2xl hover:-translate-y-2 flex flex-col relative">
        <div className="relative h-56 w-full overflow-hidden bg-muted/30">
          <Image
            src={dinosaur.image}
            alt={dinosaur.imageAlt}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3">
            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {dinosaur.name}
            </h3>
            <p className="text-sm text-muted-foreground italic line-clamp-1">{dinosaur.scientificName}</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{dinosaur.description}</p>
          <div className="flex flex-wrap gap-2 pt-2 mb-4">
            <Badge className={`${dietColors[dinosaur.diet]} px-2.5 py-0.5 rounded-full border-none shadow-sm font-medium`} variant="secondary">
              {dinosaur.diet}
            </Badge>
            <Badge className={`${periodColors[dinosaur.period]} px-2.5 py-0.5 rounded-full border-none shadow-sm font-medium`} variant="secondary">
              {dinosaur.period}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground pt-4 border-t border-border/60 flex justify-between items-center mt-auto">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>Length: {dinosaur.length}m</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>Weight: {(dinosaur.weight / 1000).toFixed(1)}t</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
