'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface FilterPanelProps {
  selectedPeriods: string[];
  selectedDiets: string[];
  onPeriodChange: (period: string, checked: boolean) => void;
  onDietChange: (diet: string, checked: boolean) => void;
  onReset: () => void;
}

const periods = ['Triassic', 'Jurassic', 'Cretaceous'];
const diets = ['Carnivore', 'Herbivore', 'Omnivore'];

import { SlidersHorizontal } from 'lucide-react';

export function FilterPanel({
  selectedPeriods,
  selectedDiets,
  onPeriodChange,
  onDietChange,
  onReset,
}: FilterPanelProps) {
  const hasActiveFilters = selectedPeriods.length > 0 || selectedDiets.length > 0;

  return (
    <Card className="p-6 lg:p-8 border-border/70 bg-[radial-gradient(280px_120px_at_10%_0%,rgba(180,120,40,0.18),transparent)] backdrop-blur-md rounded-3xl h-fit sticky top-6 space-y-8 shadow-md">
      <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3">
        <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4 text-amber-700" />
          Field Console
        </div>
        <h2 className="mt-2 font-[var(--font-display)] text-2xl text-foreground">Expedition Filter</h2>
      </div>
      
      <div>
        <h3 className="font-semibold text-foreground mb-4">Era / Periode</h3>
        <div className="space-y-2">
          {periods.map((period) => (
            <div key={period} className="flex items-center space-x-2 rounded-full border border-border/60 bg-background/70 px-3 py-2">
              <Checkbox
                id={`period-${period}`}
                checked={selectedPeriods.includes(period)}
                onCheckedChange={(checked) => onPeriodChange(period, checked as boolean)}
              />
              <Label htmlFor={`period-${period}`} className="cursor-pointer text-sm font-normal text-foreground/80">
                {period}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-muted-foreground/10" />

      <div>
        <h3 className="font-semibold text-foreground mb-3">Pola Makan</h3>
        <div className="space-y-2">
          {diets.map((diet) => (
            <div key={diet} className="flex items-center space-x-2 rounded-full border border-border/60 bg-background/70 px-3 py-2">
              <Checkbox
                id={`diet-${diet}`}
                checked={selectedDiets.includes(diet)}
                onCheckedChange={(checked) => onDietChange(diet, checked as boolean)}
              />
              <Label htmlFor={`diet-${diet}`} className="cursor-pointer text-sm font-normal text-foreground/80">
                {diet}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <div className="border-t border-muted-foreground/10" />
          <button
            onClick={onReset}
            className="w-full rounded-full border border-amber-700/30 bg-amber-100/70 px-4 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-200/80"
          >
            Reset Filter
          </button>
        </>
      )}
    </Card>
  );
}
