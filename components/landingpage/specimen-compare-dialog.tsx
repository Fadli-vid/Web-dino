'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Scale } from 'lucide-react';
import { Dinosaur } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SpecimenCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compareDinosaurs: Dinosaur[];
}

export function SpecimenCompareDialog({
  open,
  onOpenChange,
  compareDinosaurs,
}: SpecimenCompareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl">
        <DialogHeader className="text-left border-b border-border/60 pb-3">
          <DialogTitle className="font-[var(--font-display)] text-xl flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Specimen Comparison Matrix
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Side-by-side morphological and taxonomic parameters of selected specimens.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto py-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60">
                <th className="py-2.5 px-3 font-semibold text-muted-foreground">Attribute</th>
                {compareDinosaurs.map((dino) => (
                  <th key={dino.id} className="py-2.5 px-3 font-bold text-foreground text-sm">
                    {dino.name}
                    <span className="block text-[11px] font-normal italic text-muted-foreground">
                      {dino.scientificName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="py-2.5 px-3 font-medium text-muted-foreground">Visual</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`img-${dino.id}`} className="py-2.5 px-3">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border/60 bg-muted/40">
                      <Image src={dino.image} alt={dino.name} fill className="object-cover" />
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-muted-foreground">Era / Period</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`p-${dino.id}`} className="py-2.5 px-3 font-medium text-foreground">
                    {dino.period}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-muted-foreground">Diet</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`d-${dino.id}`} className="py-2.5 px-3 font-medium text-foreground">
                    {dino.diet}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-muted-foreground">Body Length</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`l-${dino.id}`} className="py-2.5 px-3 font-mono font-medium text-foreground">
                    {dino.length} m
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-muted-foreground">Estimated Weight</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`w-${dino.id}`} className="py-2.5 px-3 font-mono font-medium text-foreground">
                    {(dino.weight / 1000).toFixed(1)} tons
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-muted-foreground">Fossil Location</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`loc-${dino.id}`} className="py-2.5 px-3 text-muted-foreground">
                    {dino.locationFound || 'Archive record'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-muted-foreground">Action</td>
                {compareDinosaurs.map((dino) => (
                  <td key={`act-${dino.id}`} className="py-2.5 px-3">
                    <Button asChild size="sm" variant="outline" className="rounded-lg text-xs h-7">
                      <Link href={`/species/${dino.id}`}>View Details</Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
