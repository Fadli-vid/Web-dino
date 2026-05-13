'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useFilterNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (updates: {
      search?: string | null;
      periods?: string[];
      diets?: string[];
      lengthMin?: number | null;
      lengthMax?: number | null;
      weightMin?: number | null;
      weightMax?: number | null;
    }) => {
      const params = new URLSearchParams(searchParams);

      if (updates.search === null) {
        params.delete('search');
      } else if (updates.search !== undefined) {
        params.set('search', updates.search);
      }

      if (updates.periods !== undefined) {
        if (updates.periods.length === 0) {
          params.delete('periods');
        } else {
          params.set('periods', updates.periods.join(','));
        }
      }

      if (updates.diets !== undefined) {
        if (updates.diets.length === 0) {
          params.delete('diets');
        } else {
          params.set('diets', updates.diets.join(','));
        }
      }

      if (updates.lengthMin === null) {
        params.delete('lengthMin');
      } else if (updates.lengthMin !== undefined) {
        params.set('lengthMin', updates.lengthMin.toString());
      }

      if (updates.lengthMax === null) {
        params.delete('lengthMax');
      } else if (updates.lengthMax !== undefined) {
        params.set('lengthMax', updates.lengthMax.toString());
      }

      if (updates.weightMin === null) {
        params.delete('weightMin');
      } else if (updates.weightMin !== undefined) {
        params.set('weightMin', updates.weightMin.toString());
      }

      if (updates.weightMax === null) {
        params.delete('weightMax');
      } else if (updates.weightMax !== undefined) {
        params.set('weightMax', updates.weightMax.toString());
      }

      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : '/');
    },
    [router, searchParams]
  );

  const togglePeriod = useCallback(
    (period: string) => {
      const periods = searchParams.get('periods')?.split(',') || [];
      const updated = periods.includes(period)
        ? periods.filter((p) => p !== period)
        : [...periods, period];
      updateFilters({ periods: updated });
    },
    [searchParams, updateFilters]
  );

  const toggleDiet = useCallback(
    (diet: string) => {
      const diets = searchParams.get('diets')?.split(',') || [];
      const updated = diets.includes(diet)
        ? diets.filter((d) => d !== diet)
        : [...diets, diet];
      updateFilters({ diets: updated });
    },
    [searchParams, updateFilters]
  );

  const setSearch = useCallback(
    (query: string) => {
      updateFilters({ search: query || null });
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    updateFilters({
      search: null,
      periods: [],
      diets: [],
      lengthMin: null,
      lengthMax: null,
      weightMin: null,
      weightMax: null,
    });
  }, [updateFilters]);

  const setLengthRange = useCallback(
    (min: number, max: number) => {
      updateFilters({ lengthMin: min, lengthMax: max });
    },
    [updateFilters]
  );

  const setWeightRange = useCallback(
    (min: number, max: number) => {
      updateFilters({ weightMin: min, weightMax: max });
    },
    [updateFilters]
  );

  return {
    updateFilters,
    togglePeriod,
    toggleDiet,
    setSearch,
    clearFilters,
    setLengthRange,
    setWeightRange,
  };
}
