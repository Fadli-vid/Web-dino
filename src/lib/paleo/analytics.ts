import { Dinosaur, DinosaurDiet, DinosaurPeriod, DinosaurSummary } from '@/lib/types';

export type AnalyticsSpecimen = Dinosaur | DinosaurSummary;

export const DIET_ORDER: DinosaurDiet[] = [
  'Carnivore',
  'Herbivore',
  'Omnivore',
  'Piscivore',
  'Insectivore',
];

export const DIET_COLORS: Record<DinosaurDiet, string> = {
  Carnivore: '#ef4444',
  Herbivore: '#10b981',
  Omnivore: '#f59e0b',
  Piscivore: '#0ea5e9',
  Insectivore: '#8b5cf6',
};

export const PERIOD_ORDER: DinosaurPeriod[] = [
  'Triassic',
  'Jurassic',
  'Cretaceous',
];

export interface ScatterPoint {
  id: string;
  name: string;
  scientificName: string;
  period: DinosaurPeriod;
  subPeriod?: string;
  diet: DinosaurDiet;
  length: number;
  weightKg: number;
  weightDisplay: string;
}

export interface DietEraRow {
  period: DinosaurPeriod;
  Carnivore: number;
  Herbivore: number;
  Omnivore: number;
  Piscivore: number;
  Insectivore: number;
  total: number;
}

export interface ContinentRow {
  continent: string;
  count: number;
}

export interface AnalyticsKPIs {
  total: number;
  avgLength: number;
  longestSpecimen: AnalyticsSpecimen | null;
  heaviestSpecimen: AnalyticsSpecimen | null;
  dominantDiet: string;
  bipedalCount: number;
  quadrupedalCount: number;
  facultativeCount: number;
}

export function formatWeightHuman(weightKg: number): string {
  if (weightKg >= 1000) {
    return `${(weightKg / 1000).toFixed(1)} t`;
  }
  return `${weightKg.toLocaleString()} kg`;
}

export function buildBiomassScatterGroups(
  specimens: AnalyticsSpecimen[]
): Record<DinosaurDiet, ScatterPoint[]> {
  const groups: Record<DinosaurDiet, ScatterPoint[]> = {
    Carnivore: [],
    Herbivore: [],
    Omnivore: [],
    Piscivore: [],
    Insectivore: [],
  };

  for (const item of specimens) {
    const length = Number(item.length);
    const weightKg = Math.max(1, Number(item.weight) || 1);
    if (!Number.isFinite(length) || length <= 0) continue;

    const diet: DinosaurDiet = DIET_ORDER.includes(item.diet) ? item.diet : 'Herbivore';
    groups[diet].push({
      id: item.id,
      name: item.name,
      scientificName: item.scientificName,
      period: item.period,
      subPeriod: item.subPeriod,
      diet,
      length,
      weightKg,
      weightDisplay: formatWeightHuman(weightKg),
    });
  }

  return groups;
}

export function buildDietByEraData(specimens: AnalyticsSpecimen[]): DietEraRow[] {
  const map = new Map<DinosaurPeriod, DietEraRow>();
  for (const period of PERIOD_ORDER) {
    map.set(period, {
      period,
      Carnivore: 0,
      Herbivore: 0,
      Omnivore: 0,
      Piscivore: 0,
      Insectivore: 0,
      total: 0,
    });
  }

  for (const item of specimens) {
    const row = map.get(item.period);
    if (!row) continue;
    const diet: DinosaurDiet = DIET_ORDER.includes(item.diet) ? item.diet : 'Herbivore';
    row[diet] += 1;
    row.total += 1;
  }

  return PERIOD_ORDER.map((period) => map.get(period)!);
}

export function buildContinentDistribution(specimens: AnalyticsSpecimen[]): ContinentRow[] {
  const counts = new Map<string, number>();

  for (const item of specimens) {
    const raw = item.continent || 'Other';
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    for (const part of parts) {
      counts.set(part, (counts.get(part) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([continent, count]) => ({ continent, count }))
    .sort((a, b) => b.count - a.count || a.continent.localeCompare(b.continent));
}

export function buildAnalyticsKPIs(specimens: AnalyticsSpecimen[]): AnalyticsKPIs {
  if (specimens.length === 0) {
    return {
      total: 0,
      avgLength: 0,
      longestSpecimen: null,
      heaviestSpecimen: null,
      dominantDiet: 'N/A',
      bipedalCount: 0,
      quadrupedalCount: 0,
      facultativeCount: 0,
    };
  }

  let lengthSum = 0;
  let longestSpecimen = specimens[0];
  let heaviestSpecimen = specimens[0];
  const dietCounts = new Map<string, number>();
  let bipedalCount = 0;
  let quadrupedalCount = 0;
  let facultativeCount = 0;

  for (const item of specimens) {
    lengthSum += item.length || 0;
    if ((item.length || 0) > (longestSpecimen.length || 0)) {
      longestSpecimen = item;
    }
    if ((item.weight || 0) > (heaviestSpecimen.weight || 0)) {
      heaviestSpecimen = item;
    }

    dietCounts.set(item.diet, (dietCounts.get(item.diet) || 0) + 1);

    const loc = (item.locomotion || '').toLowerCase();
    if (loc.includes('facultative')) {
      facultativeCount += 1;
    } else if (loc.includes('quadruped')) {
      quadrupedalCount += 1;
    } else if (loc.includes('biped')) {
      bipedalCount += 1;
    }
  }

  let dominantDiet = 'Herbivore';
  let maxDietCount = -1;
  for (const [diet, count] of dietCounts.entries()) {
    if (count > maxDietCount) {
      maxDietCount = count;
      dominantDiet = diet;
    }
  }

  return {
    total: specimens.length,
    avgLength: Math.round((lengthSum / specimens.length) * 10) / 10,
    longestSpecimen,
    heaviestSpecimen,
    dominantDiet,
    bipedalCount,
    quadrupedalCount,
    facultativeCount,
  };
}
