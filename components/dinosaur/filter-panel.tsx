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
    <Card className="p-6 lg:p-8 border-border/60 bg-card/60 backdrop-blur-md rounded-3xl h-fit sticky top-6 space-y-8 shadow-sm">
      <div className="flex items-center gap-2 mb-2 pb-4 border-b border-border/50">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-xl text-foreground">Expedition Filters</h2>
      </div>
      
      <div>
        <h3 className="font-semibold text-foreground mb-4">Era / Period</h3>
        <div className="space-y-2">
          {periods.map((period) => (
            <div key={period} className="flex items-center space-x-2">
              <Checkbox
                id={`period-${period}`}
                checked={selectedPeriods.includes(period)}
                onCheckedChange={(checked) => onPeriodChange(period, checked as boolean)}
              />
              <Label htmlFor={`period-${period}`} className="cursor-pointer text-sm font-normal">
                {period}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-muted-foreground/10" />

      <div>
        <h3 className="font-semibold text-foreground mb-3">Diet</h3>
        <div className="space-y-2">
          {diets.map((diet) => (
            <div key={diet} className="flex items-center space-x-2">
              <Checkbox
                id={`diet-${diet}`}
                checked={selectedDiets.includes(diet)}
                onCheckedChange={(checked) => onDietChange(diet, checked as boolean)}
              />
              <Label htmlFor={`diet-${diet}`} className="cursor-pointer text-sm font-normal">
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
            className="w-full px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </>
      )}
    </Card>
  );
}
