'use client';

import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
}

const periods = ['Triassic', 'Jurassic', 'Cretaceous'];
const diets = ['Carnivore', 'Herbivore', 'Omnivore'];

import { SlidersHorizontal } from 'lucide-react';

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
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return;
    }
    const clampedMin = clampValue(min, lengthBounds.min, lengthBounds.max);
    const clampedMax = clampValue(max, lengthBounds.min, lengthBounds.max);
    onLengthChange([clampedMin, clampedMax]);
  };

  const applyWeightRange = () => {
    const min = Number(weightDraft.min);
    const max = Number(weightDraft.max);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return;
    }
    const minBound = toTons(weightBounds.min);
    const maxBound = toTons(weightBounds.max);
    const clampedMin = clampValue(min, minBound, maxBound);
    const clampedMax = clampValue(max, minBound, maxBound);
    onWeightChange([Math.round(clampedMin * 1000), Math.round(clampedMax * 1000)]);
  };

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

      <div className="border-t border-muted-foreground/10" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Rentang Panjang</h3>
          <span className="text-xs text-muted-foreground">
            {formatLength(selectedLength[0])} - {formatLength(selectedLength[1])} m
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Min (m)</Label>
            <Input
              type="number"
              min={lengthBounds.min}
              max={lengthBounds.max}
              step={0.1}
              value={lengthDraft.min}
              onChange={(event) => {
                setLengthDraft((current) => ({
                  ...current,
                  min: event.target.value,
                }));
              }}
              disabled={lengthBounds.min === lengthBounds.max}
              className="h-9 rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Max (m)</Label>
            <Input
              type="number"
              min={lengthBounds.min}
              max={lengthBounds.max}
              step={0.1}
              value={lengthDraft.max}
              onChange={(event) => {
                setLengthDraft((current) => ({
                  ...current,
                  max: event.target.value,
                }));
              }}
              disabled={lengthBounds.min === lengthBounds.max}
              className="h-9 rounded-full"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={applyLengthRange}
          disabled={lengthBounds.min === lengthBounds.max}
          className="w-full rounded-full border border-amber-700/30 bg-amber-100/70 px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-200/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Terapkan Panjang
        </button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatLength(lengthBounds.min)} m</span>
          <span>{formatLength(lengthBounds.max)} m</span>
        </div>
      </div>

      <div className="border-t border-muted-foreground/10" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Rentang Berat</h3>
          <span className="text-xs text-muted-foreground">
            {formatWeight(selectedWeight[0])} - {formatWeight(selectedWeight[1])} ton
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Min (ton)</Label>
            <Input
              type="number"
              min={toTons(weightBounds.min)}
              max={toTons(weightBounds.max)}
              step={0.1}
              value={weightDraft.min}
              onChange={(event) => {
                setWeightDraft((current) => ({
                  ...current,
                  min: event.target.value,
                }));
              }}
              disabled={weightBounds.min === weightBounds.max}
              className="h-9 rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Max (ton)</Label>
            <Input
              type="number"
              min={toTons(weightBounds.min)}
              max={toTons(weightBounds.max)}
              step={0.1}
              value={weightDraft.max}
              onChange={(event) => {
                setWeightDraft((current) => ({
                  ...current,
                  max: event.target.value,
                }));
              }}
              disabled={weightBounds.min === weightBounds.max}
              className="h-9 rounded-full"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={applyWeightRange}
          disabled={weightBounds.min === weightBounds.max}
          className="w-full rounded-full border border-emerald-700/30 bg-emerald-100/70 px-4 py-2 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-200/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Terapkan Berat
        </button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatWeight(weightBounds.min)} ton</span>
          <span>{formatWeight(weightBounds.max)} ton</span>
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
