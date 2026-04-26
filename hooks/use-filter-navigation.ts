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
    updateFilters({ search: null, periods: [], diets: [] });
  }, [updateFilters]);

  return {
    updateFilters,
    togglePeriod,
    toggleDiet,
    setSearch,
    clearFilters,
  };
}
