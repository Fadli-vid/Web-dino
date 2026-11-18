'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Dinosaur, DinosaurPeriod } from '@/lib/types';

export const MESOZOIC_MIN_MA = 66;
export const MESOZOIC_MAX_MA = 252;

function parseNumber(value: string | null) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getFallbackMyaRange(period: DinosaurPeriod): [number, number] {
  switch (period) {
    case 'Triassic':
      return [201.3, 252];
    case 'Jurassic':
      return [145, 201.3];
    case 'Cretaceous':
    default:
      return [66, 145];
  }
}

export function useDinosaurFilters(dinosaursData: Dinosaur[] = []) {
  const searchParams = useSearchParams();

  const searchQuery = useMemo(() => {
    return searchParams.get('search')?.toLowerCase() || '';
  }, [searchParams]);

  const selectedPeriods = useMemo(() => {
    const periods = searchParams.get('periods');
    return periods ? periods.split(',') : [];
  }, [searchParams]);

  const selectedDiets = useMemo(() => {
    const diets = searchParams.get('diets');
    return diets ? diets.split(',') : [];
  }, [searchParams]);

  const lengthMin = useMemo(() => parseNumber(searchParams.get('lengthMin')), [searchParams]);
  const lengthMax = useMemo(() => parseNumber(searchParams.get('lengthMax')), [searchParams]);
  const weightMin = useMemo(() => parseNumber(searchParams.get('weightMin')), [searchParams]);
  const weightMax = useMemo(() => parseNumber(searchParams.get('weightMax')), [searchParams]);
  const myaMin = useMemo(() => parseNumber(searchParams.get('myaMin')), [searchParams]);
  const myaMax = useMemo(() => parseNumber(searchParams.get('myaMax')), [searchParams]);

  const filteredDinosaurs = useMemo(() => {
    let results = dinosaursData;

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (dino) =>
          dino.name.toLowerCase().includes(searchQuery) ||
          dino.scientificName.toLowerCase().includes(searchQuery) ||
          dino.description.toLowerCase().includes(searchQuery)
      );
    }

    // Filter by period
    if (selectedPeriods.length > 0) {
      results = results.filter((dino) => selectedPeriods.includes(dino.period));
    }

    // Filter by diet
    if (selectedDiets.length > 0) {
      results = results.filter((dino) => selectedDiets.includes(dino.diet));
    }

    if (lengthMin !== null || lengthMax !== null) {
      const min = lengthMin ?? -Infinity;
      const max = lengthMax ?? Infinity;
      results = results.filter((dino) => dino.length >= min && dino.length <= max);
    }

    if (weightMin !== null || weightMax !== null) {
      const min = weightMin ?? -Infinity;
      const max = weightMax ?? Infinity;
      results = results.filter((dino) => dino.weight >= min && dino.weight <= max);
    }

    // Chrono-Stratigraphic interval overlap filter (in Million Years Ago / Ma)
    if (myaMin !== null || myaMax !== null) {
      const filterYounger = myaMin ?? MESOZOIC_MIN_MA;
      const filterOlder = myaMax ?? MESOZOIC_MAX_MA;
      const low = Math.min(filterYounger, filterOlder);
      const high = Math.max(filterYounger, filterOlder);

      results = results.filter((dino) => {
        const [fallbackEnd, fallbackStart] = getFallbackMyaRange(dino.period);
        const dinoEnd = dino.myaEnd ?? fallbackEnd;
        const dinoStart = dino.myaStart ?? fallbackStart;
        return dinoStart >= low && dinoEnd <= high;
      });
    }

    return results;
  }, [
    dinosaursData,
    searchQuery,
    selectedPeriods,
    selectedDiets,
    lengthMin,
    lengthMax,
    weightMin,
    weightMax,
    myaMin,
    myaMax,
  ]);

  return {
    searchQuery,
    selectedPeriods,
    selectedDiets,
    lengthMin,
    lengthMax,
    weightMin,
    weightMax,
    myaMin,
    myaMax,
    filteredDinosaurs,
  };
}
