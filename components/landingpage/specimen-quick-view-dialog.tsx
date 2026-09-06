'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Dinosaur } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SpecimenQuickViewDialogProps {
  dinosaur: Dinosaur | null;
  onClose: () => void;
}

export function SpecimenQuickViewDialog({
  dinosaur,
  onClose,
}: SpecimenQuickViewDialogProps) {
  return (
    <Dialog
      open={Boolean(dinosaur)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {dinosaur && (
        <DialogContent className="max-w-2xl border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl p-6">
          <div className="grid gap-6 sm:grid-cols-[1.1fr_1fr]">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/60 bg-muted/40">
              <Image
                src={dinosaur.image}
                alt={dinosaur.imageAlt || dinosaur.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <DialogHeader className="text-left space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
                  {dinosaur.period} · {dinosaur.diet}
                </div>
                <DialogTitle className="font-[var(--font-display)] text-2xl font-bold text-foreground">
                  {dinosaur.name}
                </DialogTitle>
                <DialogDescription className="text-xs italic text-muted-foreground">
                  {dinosaur.scientificName}
                </DialogDescription>
              </DialogHeader>

              <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-4">
                {dinosaur.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                <div className="rounded-lg bg-muted/50 p-2">
                  <span className="text-[10px] text-muted-foreground uppercase">Length</span>
                  <div className="font-mono font-semibold text-foreground">
                    {dinosaur.length} m
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <span className="text-[10px] text-muted-foreground uppercase">Weight</span>
                  <div className="font-mono font-semibold text-foreground">
                    {(dinosaur.weight / 1000).toFixed(1)} tons
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  asChild
                  className="flex-1 rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={`/species/${dinosaur.id}`}>View Full Dossier</Link>
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-xl text-xs">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
