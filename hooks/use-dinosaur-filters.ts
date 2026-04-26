'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { dinosaurs } from '@/lib/dinosaurs-data';
import { Dinosaur, FilterOptions } from '@/lib/types';

export function useDinosaurFilters() {
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

  const filteredDinosaurs = useMemo(() => {
    let results = dinosaurs;

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

    return results;
  }, [searchQuery, selectedPeriods, selectedDiets]);

  return {
    searchQuery,
    selectedPeriods,
    selectedDiets,
    filteredDinosaurs,
  };
}
