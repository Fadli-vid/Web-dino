'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, RotateCcw, Check, Clock } from 'lucide-react';
import { MESOZOIC_MAX_MA, MESOZOIC_MIN_MA } from '@/hooks/use-dinosaur-filters';

interface FilterPanelProps {
  selectedPeriods: string[];
  selectedDiets: string[];
  lengthBounds: { min: number; max: number };
  weightBounds: { min: number; max: number };
  selectedLength: [number, number];
  selectedWeight: [number, number];
  selectedMya?: [number, number];
  onLengthChange: (range: [number, number]) => void;
  onWeightChange: (range: [number, number]) => void;
  onMyaChange?: (range: [number, number]) => void;
  onPeriodChange: (period: string, checked: boolean) => void;
  onDietChange: (diet: string, checked: boolean) => void;
  onReset: () => void;
  variant?: 'card' | 'ghost';
}

const periods = ['Triassic', 'Jurassic', 'Cretaceous'];
const primaryDiets = ['Carnivore', 'Herbivore', 'Omnivore'];
const specialistDiets = ['Piscivore', 'Insectivore'];

const MESOZOIC_SPAN = MESOZOIC_MAX_MA - MESOZOIC_MIN_MA; // 186 Ma

function toSliderPos(ma: number) {
  return Math.min(MESOZOIC_SPAN, Math.max(0, Math.round(MESOZOIC_MAX_MA - ma)));
}

function fromSliderPos(pos: number) {
  return Math.min(MESOZOIC_MAX_MA, Math.max(MESOZOIC_MIN_MA, Math.round(MESOZOIC_MAX_MA - pos)));
}

export function FilterPanel({
  selectedPeriods = [],
  selectedDiets = [],
  lengthBounds = { min: 0, max: 0 },
  weightBounds = { min: 0, max: 0 },
  selectedLength,
  selectedWeight,
  selectedMya,
  onLengthChange,
  onWeightChange,
  onMyaChange,
  onPeriodChange,
  onDietChange,
  onReset,
  variant = 'card',
}: FilterPanelProps) {
  const safeLength: [number, number] =
    Array.isArray(selectedLength) && selectedLength.length === 2
      ? selectedLength
      : [lengthBounds?.min ?? 0, lengthBounds?.max ?? 0];

  const safeWeight: [number, number] =
    Array.isArray(selectedWeight) && selectedWeight.length === 2
      ? selectedWeight
      : [weightBounds?.min ?? 0, weightBounds?.max ?? 0];

  const safeMya: [number, number] =
    Array.isArray(selectedMya) && selectedMya.length === 2
      ? [Math.min(selectedMya[0], selectedMya[1]), Math.max(selectedMya[0], selectedMya[1])]
      : [MESOZOIC_MIN_MA, MESOZOIC_MAX_MA];

  const lengthActive =
    lengthBounds.min !== lengthBounds.max &&
    (safeLength[0] > lengthBounds.min || safeLength[1] < lengthBounds.max);
  const weightActive =
    weightBounds.min !== weightBounds.max &&
    (safeWeight[0] > weightBounds.min || safeWeight[1] < weightBounds.max);
  const myaActive =
    safeMya[0] > MESOZOIC_MIN_MA || safeMya[1] < MESOZOIC_MAX_MA;
  const hasActiveFilters =
    selectedPeriods.length > 0 ||
    selectedDiets.length > 0 ||
    lengthActive ||
    weightActive ||
    myaActive;

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
    min: formatLength(safeLength[0]),
    max: formatLength(safeLength[1]),
  });
  const [weightDraft, setWeightDraft] = useState({
    min: formatWeight(safeWeight[0]),
    max: formatWeight(safeWeight[1]),
  });
  const [myaDraftPos, setMyaDraftPos] = useState<[number, number]>([
    toSliderPos(safeMya[1]),
    toSliderPos(safeMya[0]),
  ]);

  useEffect(() => {
    setLengthDraft({
      min: formatLength(safeLength[0]),
      max: formatLength(safeLength[1]),
    });
  }, [safeLength[0], safeLength[1]]);

  useEffect(() => {
    setWeightDraft({
      min: formatWeight(safeWeight[0]),
      max: formatWeight(safeWeight[1]),
    });
  }, [safeWeight[0], safeWeight[1]]);

  useEffect(() => {
    setMyaDraftPos([toSliderPos(safeMya[1]), toSliderPos(safeMya[0])]);
  }, [safeMya[0], safeMya[1]]);

  const draftOlderMa = fromSliderPos(myaDraftPos[0]);
  const draftYoungerMa = fromSliderPos(myaDraftPos[1]);

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

      {/* Chrono-Stratigraphic Timeline Slider (Ma) */}
      {onMyaChange && (
        <div className="space-y-2.5 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              <span>Geologic Time (Ma)</span>
            </span>
            <span className="font-mono text-[11px] text-foreground font-semibold">
              {draftOlderMa}–{draftYoungerMa} Ma
            </span>
          </div>

          {/* Proportional Mesozoic Era Indicator Bar (252 Ma -> 66 Ma) */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-full overflow-hidden flex opacity-80">
              <div
                className="bg-amber-500/70 h-full"
                style={{ width: '27.2%' }}
                title="Triassic (252–201.3 Ma)"
              />
              <div
                className="bg-emerald-500/70 h-full"
                style={{ width: '30.3%' }}
                title="Jurassic (201.3–145 Ma)"
              />
              <div
                className="bg-teal-500/70 h-full"
                style={{ width: '42.5%' }}
                title="Cretaceous (145–66 Ma)"
              />
            </div>

            <Slider
              min={0}
              max={MESOZOIC_SPAN}
              step={1}
              value={myaDraftPos}
              onValueChange={(vals) => {
                if (vals.length === 2) {
                  setMyaDraftPos([vals[0], vals[1]]);
                }
              }}
              onValueCommit={(vals) => {
                if (vals.length === 2) {
                  const older = fromSliderPos(vals[0]);
                  const younger = fromSliderPos(vals[1]);
                  onMyaChange([Math.min(younger, older), Math.max(younger, older)]);
                }
              }}
              aria-label="Geological time range in Million Years Ago"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>252 Ma (Older)</span>
              <span>66 Ma (K-Pg)</span>
            </div>
          </div>

          {/* Quick Chronological Snap Presets */}
          <div className="grid grid-cols-4 gap-1">
            {[
              { label: 'All', range: [66, 252] as [number, number] },
              { label: '252–201', range: [201, 252] as [number, number] },
              { label: '201–145', range: [145, 201] as [number, number] },
              { label: '145–66', range: [66, 145] as [number, number] },
            ].map((preset) => {
              const isPresetActive =
                safeMya[0] === preset.range[0] && safeMya[1] === preset.range[1];
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onMyaChange(preset.range)}
                  className={`py-1 px-1 rounded-md text-[10px] font-mono border transition-colors ${
                    isPresetActive && (preset.label !== 'All' || !myaActive)
                      ? 'border-primary/50 bg-primary/15 text-foreground font-semibold'
                      : 'border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Diet Filter (Compact Chips) */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Diet
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {primaryDiets.map((diet) => {
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
        <div className="grid grid-cols-2 gap-1.5">
          {specialistDiets.map((diet) => {
            const isChecked = selectedDiets.includes(diet);
            return (
              <button
                key={diet}
                type="button"
                onClick={() => onDietChange(diet, !isChecked)}
                className={`py-1 px-1.5 rounded-lg text-[11px] font-medium transition-all text-center border flex items-center justify-center gap-1 ${
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
