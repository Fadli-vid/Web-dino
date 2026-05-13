'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Dinosaur } from '@/lib/types';

function parseNumber(value: string | null) {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

    return results;
  }, [dinosaursData, searchQuery, selectedPeriods, selectedDiets, lengthMin, lengthMax, weightMin, weightMax]);

  return {
    searchQuery,
    selectedPeriods,
    selectedDiets,
    lengthMin,
    lengthMax,
    weightMin,
    weightMax,
    filteredDinosaurs,
  };
}
