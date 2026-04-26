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
    <Link href={`/species/${dinosaur.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full border-muted-foreground/20 hover:border-primary/50 group">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={dinosaur.image}
            alt={dinosaur.imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {dinosaur.name}
            </h3>
            <p className="text-sm text-muted-foreground italic">{dinosaur.scientificName}</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{dinosaur.description}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className={dietColors[dinosaur.diet]} variant="secondary">
              {dinosaur.diet}
            </Badge>
            <Badge className={periodColors[dinosaur.period]} variant="secondary">
              {dinosaur.period}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t border-muted-foreground/10">
            <div>Length: {dinosaur.length}m | Weight: {(dinosaur.weight / 1000).toFixed(1)}t</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
