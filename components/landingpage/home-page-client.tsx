'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDinosaurs } from '@/lib/dinosaurs-data';
import { Dinosaur } from '@/lib/types';
import { FilterPanel } from '@/components/dinosaur/filter-panel';
import { useDinosaurFilters } from '@/hooks/use-dinosaur-filters';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';
import {
  LandingHeader,
  HeroSection,
  SpecimenToolbar,
  SpecimenGallery,
  SpecimenPagination,
  SpecimenCompareTray,
  SpecimenCompareDialog,
  SpecimenQuickViewDialog,
  LandingFooter,
} from '@/components/landingpage';

const PAGE_SIZE = 12;

interface HomePageClientProps {
  initialDinosaurs?: Dinosaur[];
}

export function HomePageClient({ initialDinosaurs = [] }: HomePageClientProps) {
  const [dinosaurs, setDinosaurs] = useState<Dinosaur[]>(initialDinosaurs);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Resilient fallback: fetch client-side if initial server payload was empty
  useEffect(() => {
    if (initialDinosaurs.length === 0) {
      async function fetchData() {
        const data = await getDinosaurs();
        setDinosaurs(data);
      }
      fetchData();
    }
  }, [initialDinosaurs]);

  const {
    filteredDinosaurs,
    selectedPeriods,
    selectedDiets,
    searchQuery,
    lengthMin,
    lengthMax,
    weightMin,
    weightMax,
  } = useDinosaurFilters(dinosaurs);

  const {
    togglePeriod,
    toggleDiet,
    setSearch,
    clearFilters,
    setLengthRange,
    setWeightRange,
  } = useFilterNavigation();

  const totalSpecies = dinosaurs.length;
  const activeFiltersCount = selectedPeriods.length + selectedDiets.length;

  const lengthBounds = useMemo(() => {
    const values = dinosaurs.map((dino) => dino.length).filter(Number.isFinite);
    if (values.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.floor(Math.min(...values) * 10) / 10,
      max: Math.ceil(Math.max(...values) * 10) / 10,
    };
  }, [dinosaurs]);

  const weightBounds = useMemo(() => {
    const values = dinosaurs.map((dino) => dino.weight).filter(Number.isFinite);
    if (values.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.floor(Math.min(...values) / 100) * 100,
      max: Math.ceil(Math.max(...values) / 100) * 100,
    };
  }, [dinosaurs]);

  const selectedLengthRange = useMemo(() => {
    const min = lengthMin ?? lengthBounds.min;
    const max = lengthMax ?? lengthBounds.max;
    const clampedMin = Math.min(Math.max(min, lengthBounds.min), lengthBounds.max);
    const clampedMax = Math.min(Math.max(max, lengthBounds.min), lengthBounds.max);
    return clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin];
  }, [lengthMin, lengthMax, lengthBounds]);

  const selectedWeightRange = useMemo(() => {
    const min = weightMin ?? weightBounds.min;
    const max = weightMax ?? weightBounds.max;
    const clampedMin = Math.min(Math.max(min, weightBounds.min), weightBounds.max);
    const clampedMax = Math.min(Math.max(max, weightBounds.min), weightBounds.max);
    return clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin];
  }, [weightMin, weightMax, weightBounds]);

  const sortedDinosaurs = useMemo(() => {
    const list = [...filteredDinosaurs];
    switch (sortKey) {
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case 'length-asc':
        return list.sort((a, b) => a.length - b.length);
      case 'length-desc':
        return list.sort((a, b) => b.length - a.length);
      case 'weight-asc':
        return list.sort((a, b) => a.weight - b.weight);
      case 'weight-desc':
        return list.sort((a, b) => b.weight - a.weight);
      case 'name-asc':
      default:
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredDinosaurs, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedPeriods, selectedDiets, lengthMin, lengthMax, weightMin, weightMax]);

  const totalFiltered = sortedDinosaurs.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, totalFiltered);
  const pagedDinosaurs = sortedDinosaurs.slice(pageStart, pageEnd);

  const handleToggleCompare = (dino: Dinosaur) => {
    setCompareIds((prev) => {
      if (prev.includes(dino.id)) {
        return prev.filter((id) => id !== dino.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), dino.id];
      }
      return [...prev, dino.id];
    });
  };

  const handleRemoveCompare = (id: string) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
  };

  const compareDinosaurs = dinosaurs.filter((dino) => compareIds.includes(dino.id));
  const quickViewDino = dinosaurs.find((dino) => dino.id === quickViewId) ?? null;

  const filterPanelProps = {
    selectedPeriods,
    selectedDiets,
    lengthBounds,
    weightBounds,
    selectedLength: (selectedLengthRange as [number, number]) || [lengthBounds.min, lengthBounds.max],
    selectedWeight: (selectedWeightRange as [number, number]) || [weightBounds.min, weightBounds.max],
    onLengthChange: (range: [number, number]) => setLengthRange(range[0], range[1]),
    onWeightChange: (range: [number, number]) => setWeightRange(range[0], range[1]),
    onPeriodChange: (period: string) => togglePeriod(period),
    onDietChange: (diet: string) => toggleDiet(diet),
    onReset: clearFilters,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingHeader totalSpecies={totalSpecies} />

      <HeroSection
        totalSpecies={totalSpecies}
        onSearch={setSearch}
        initialSearch={searchQuery}
      />

      <main
        id="specimen-ledger"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 flex-1 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            <SpecimenToolbar
              totalFiltered={totalFiltered}
              activeFiltersCount={activeFiltersCount}
              sortKey={sortKey}
              onSortChange={setSortKey}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filterPanelProps={filterPanelProps}
            />

            <SpecimenGallery
              dinosaurs={pagedDinosaurs}
              viewMode={viewMode}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
              onQuickView={setQuickViewId}
              onResetFilters={clearFilters}
            />

            {totalFiltered > PAGE_SIZE && (
              <SpecimenPagination
                page={currentPage}
                totalPages={totalPages}
                pageStart={pageStart}
                pageEnd={pageEnd}
                totalFiltered={totalFiltered}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </main>

      <SpecimenCompareTray
        compareDinosaurs={compareDinosaurs}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
        onOpenMatrix={() => setIsCompareOpen(true)}
      />

      <SpecimenCompareDialog
        open={isCompareOpen}
        onOpenChange={setIsCompareOpen}
        compareDinosaurs={compareDinosaurs}
      />

      <SpecimenQuickViewDialog
        dinosaur={quickViewDino}
        onClose={() => setQuickViewId(null)}
      />

      <LandingFooter />
    </div>
  );
}
