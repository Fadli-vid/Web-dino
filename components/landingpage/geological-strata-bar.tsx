'use client';

import { Layers } from 'lucide-react';

export const STRATA_ERAS = [
  { id: 'all', label: 'All Eras', time: '252-66 Ma' },
  { id: 'Triassic', label: 'Triassic', time: '252-201 Ma' },
  { id: 'Jurassic', label: 'Jurassic', time: '201-145 Ma' },
  { id: 'Cretaceous', label: 'Cretaceous', time: '145-66 Ma' },
];

interface GeologicalStrataBarProps {
  selectedPeriods: string[];
  onSelectEra: (eraId: string) => void;
}

export function GeologicalStrataBar({
  selectedPeriods,
  onSelectEra,
}: GeologicalStrataBarProps) {
  return (
    <section className="border-b border-border/60 bg-muted/25 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Geological Stratigraphy:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {STRATA_ERAS.map((era) => {
              const isActive =
                era.id === 'all'
                  ? selectedPeriods.length === 0
                  : selectedPeriods.includes(era.id);

              return (
                <button
                  key={era.id}
                  type="button"
                  onClick={() => onSelectEra(era.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <span>{era.label}</span>
                  <span
                    className={`text-[10px] opacity-75 font-mono ${
                      isActive ? 'text-primary-foreground/90' : 'text-muted-foreground'
                    }`}
                  >
                    ({era.time})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
