'use client';

import { Scale, X } from 'lucide-react';
import { Dinosaur } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface SpecimenCompareTrayProps {
  compareDinosaurs: Dinosaur[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenMatrix: () => void;
}

export function SpecimenCompareTray({
  compareDinosaurs,
  onRemove,
  onClear,
  onOpenMatrix,
}: SpecimenCompareTrayProps) {
  if (compareDinosaurs.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
      <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 pl-1 shrink-0">
            <Scale className="w-3.5 h-3.5 text-primary" />
            <span>Compare ({compareDinosaurs.length}/3):</span>
          </div>
          {compareDinosaurs.map((dino) => (
            <div
              key={dino.id}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 px-2 py-1 text-xs shrink-0"
            >
              <span className="font-medium text-foreground">{dino.name}</span>
              <button
                type="button"
                onClick={() => onRemove(dino.id)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${dino.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs rounded-xl h-8 px-2.5 text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
          <Button
            size="sm"
            disabled={compareDinosaurs.length < 2}
            onClick={onOpenMatrix}
            className="text-xs rounded-xl h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Open Matrix
          </Button>
        </div>
      </div>
    </div>
  );
}
