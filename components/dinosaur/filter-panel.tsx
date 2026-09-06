'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

interface FilterPanelProps {
  selectedPeriods: string[];
  selectedDiets: string[];
  lengthBounds: { min: number; max: number };
  weightBounds: { min: number; max: number };
  selectedLength: [number, number];
  selectedWeight: [number, number];
  onLengthChange: (range: [number, number]) => void;
  onWeightChange: (range: [number, number]) => void;
  onPeriodChange: (period: string, checked: boolean) => void;
  onDietChange: (diet: string, checked: boolean) => void;
  onReset: () => void;
  variant?: 'card' | 'ghost';
}

const periods = ['Triassic', 'Jurassic', 'Cretaceous'];
const diets = ['Carnivore', 'Herbivore', 'Omnivore'];

export function FilterPanel({
  selectedPeriods,
  selectedDiets,
  lengthBounds,
  weightBounds,
  selectedLength,
  selectedWeight,
  onLengthChange,
  onWeightChange,
  onPeriodChange,
  onDietChange,
  onReset,
  variant = 'card',
}: FilterPanelProps) {
  const lengthActive =
    lengthBounds.min !== lengthBounds.max &&
    (selectedLength[0] > lengthBounds.min || selectedLength[1] < lengthBounds.max);
  const weightActive =
    weightBounds.min !== weightBounds.max &&
    (selectedWeight[0] > weightBounds.min || selectedWeight[1] < weightBounds.max);
  const hasActiveFilters =
    selectedPeriods.length > 0 || selectedDiets.length > 0 || lengthActive || weightActive;

  const formatLength = (value: number) => {
    const normalized = Math.round(value * 10) / 10;
    return Number.isInteger(normalized) ? normalized.toString() : normalized.toFixed(1);
  };

  const formatWeight = (value: number) => {
    const tons = Math.round((value / 1000) * 10) / 10;
    return Number.isInteger(tons) ? tons.toString() : tons.toFixed(1);
  };

  const toTons = (value: number) => Math.round((value / 1000) * 10) / 10;

  const [lengthDraft, setLengthDraft] = useState({
    min: formatLength(selectedLength[0]),
    max: formatLength(selectedLength[1]),
  });
  const [weightDraft, setWeightDraft] = useState({
    min: formatWeight(selectedWeight[0]),
    max: formatWeight(selectedWeight[1]),
  });

  useEffect(() => {
    setLengthDraft({
      min: formatLength(selectedLength[0]),
      max: formatLength(selectedLength[1]),
    });
  }, [selectedLength]);

  useEffect(() => {
    setWeightDraft({
      min: formatWeight(selectedWeight[0]),
      max: formatWeight(selectedWeight[1]),
    });
  }, [selectedWeight]);

  const clampValue = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  };

  const applyLengthRange = () => {
    const min = Number(lengthDraft.min);
    const max = Number(lengthDraft.max);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return;
    const clampedMin = clampValue(min, lengthBounds.min, lengthBounds.max);
    const clampedMax = clampValue(max, lengthBounds.min, lengthBounds.max);
    onLengthChange([clampedMin, clampedMax]);
  };

  const applyWeightRange = () => {
    const min = Number(weightDraft.min);
    const max = Number(weightDraft.max);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return;
    const minBound = toTons(weightBounds.min);
    const maxBound = toTons(weightBounds.max);
    const clampedMin = clampValue(min, minBound, maxBound);
    const clampedMax = clampValue(max, minBound, maxBound);
    onWeightChange([Math.round(clampedMin * 1000), Math.round(clampedMax * 1000)]);
  };

  const Container = (variant === 'ghost' ? 'div' : Card) as React.ElementType;
  const containerClasses =
    variant === 'ghost'
      ? 'space-y-4 h-fit'
      : 'p-4 sm:p-5 border border-border/80 bg-card/80 backdrop-blur-md rounded-2xl h-fit sticky top-20 space-y-4 shadow-sm';

  return (
    <Container className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm text-foreground">Expedition Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Period Filter (Compact Chips) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Era / Period
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {periods.map((period) => {
            const isChecked = selectedPeriods.includes(period);
            return (
              <button
                key={period}
                type="button"
                onClick={() => onPeriodChange(period, !isChecked)}
                className={`py-1.5 px-1 rounded-lg text-xs font-medium transition-all text-center border flex items-center justify-center gap-1 ${
                  isChecked
                    ? 'border-primary/60 bg-primary/15 text-foreground font-semibold shadow-xs'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                title={period === 'Triassic' ? '252-201 Ma' : period === 'Jurassic' ? '201-145 Ma' : '145-66 Ma'}
              >
                {isChecked && <Check className="w-3 h-3 text-primary shrink-0" />}
                <span className="truncate">{period}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diet Filter (Compact Chips) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Diet
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {diets.map((diet) => {
            const isChecked = selectedDiets.includes(diet);
            return (
              <button
                key={diet}
                type="button"
                onClick={() => onDietChange(diet, !isChecked)}
                className={`py-1.5 px-1 rounded-lg text-xs font-medium transition-all text-center border flex items-center justify-center gap-1 ${
                  isChecked
                    ? 'border-primary/60 bg-primary/15 text-foreground font-semibold shadow-xs'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {isChecked && <Check className="w-3 h-3 text-primary shrink-0" />}
                <span className="truncate">{diet}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Length & Weight Ranges (Inline Grid) */}
      <div className="space-y-3 pt-1 border-t border-border/60">
        {/* Length Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Length (m)</span>
            <span className="font-mono text-[11px] text-foreground font-medium">
              {formatLength(selectedLength[0])} - {formatLength(selectedLength[1])} m
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={lengthBounds.min}
              max={lengthBounds.max}
              step={0.1}
              value={lengthDraft.min}
              placeholder="Min"
              onChange={(e) => setLengthDraft((c) => ({ ...c, min: e.target.value }))}
              onBlur={applyLengthRange}
              onKeyDown={(e) => e.key === 'Enter' && applyLengthRange()}
              className="h-7 text-xs rounded-lg text-center"
            />
            <span className="text-muted-foreground text-xs font-mono">-</span>
            <Input
              type="number"
              min={lengthBounds.min}
              max={lengthBounds.max}
              step={0.1}
              value={lengthDraft.max}
              placeholder="Max"
              onChange={(e) => setLengthDraft((c) => ({ ...c, max: e.target.value }))}
              onBlur={applyLengthRange}
              onKeyDown={(e) => e.key === 'Enter' && applyLengthRange()}
              className="h-7 text-xs rounded-lg text-center"
            />
          </div>
        </div>

        {/* Weight Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Weight (tons)</span>
            <span className="font-mono text-[11px] text-foreground font-medium">
              {formatWeight(selectedWeight[0])} - {formatWeight(selectedWeight[1])} tons
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={toTons(weightBounds.min)}
              max={toTons(weightBounds.max)}
              step={0.1}
              value={weightDraft.min}
              placeholder="Min"
              onChange={(e) => setWeightDraft((c) => ({ ...c, min: e.target.value }))}
              onBlur={applyWeightRange}
              onKeyDown={(e) => e.key === 'Enter' && applyWeightRange()}
              className="h-7 text-xs rounded-lg text-center"
            />
            <span className="text-muted-foreground text-xs font-mono">-</span>
            <Input
              type="number"
              min={toTons(weightBounds.min)}
              max={toTons(weightBounds.max)}
              step={0.1}
              value={weightDraft.max}
              placeholder="Max"
              onChange={(e) => setWeightDraft((c) => ({ ...c, max: e.target.value }))}
              onBlur={applyWeightRange}
              onKeyDown={(e) => e.key === 'Enter' && applyWeightRange()}
              className="h-7 text-xs rounded-lg text-center"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 py-1.5 text-xs font-semibold text-primary transition-colors mt-1"
        >
          Reset Filters
        </button>
      )}
    </Container>
  );
}
