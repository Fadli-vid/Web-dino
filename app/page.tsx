'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { getDinosaurs } from '@/lib/dinosaurs-data';
import { Dinosaur } from '@/lib/types';
import { FilterPanel } from '@/components/dinosaur/filter-panel';
import { useDinosaurFilters } from '@/hooks/use-dinosaur-filters';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';
import {
  LandingHeader,
  HeroSection,
  GeologicalStrataBar,
  SpecimenToolbar,
  SpecimenGallery,
  SpecimenPagination,
  SpecimenCompareTray,
  SpecimenCompareDialog,
  SpecimenQuickViewDialog,
  LandingFooter,
} from '@/components/landingpage';

const PAGE_SIZE = 12;

function HomePageContent() {
  const [dinosaurs, setDinosaurs] = useState<Dinosaur[]>([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const data = await getDinosaurs();
      setDinosaurs(data);
    }
    fetchData();
  }, []);

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
    updateFilters,
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
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'length-asc':
        list.sort((a, b) => a.length - b.length);
        break;
      case 'length-desc':
        list.sort((a, b) => b.length - a.length);
        break;
      case 'weight-asc':
        list.sort((a, b) => a.weight - b.weight);
        break;
      case 'weight-desc':
        list.sort((a, b) => b.weight - a.weight);
        break;
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return list;
  }, [filteredDinosaurs, sortKey]);

  const compareDinosaurs = useMemo(() => {
    return compareIds
      .map((id) => dinosaurs.find((dino) => dino.id === id))
      .filter((dino): dino is Dinosaur => Boolean(dino));
  }, [compareIds, dinosaurs]);

  const quickViewDino = useMemo(() => {
    if (!quickViewId) return null;
    return dinosaurs.find((dino) => dino.id === quickViewId) || null;
  }, [quickViewId, dinosaurs]);

  const totalPages = Math.max(1, Math.ceil(sortedDinosaurs.length / PAGE_SIZE));
  const pageStart = sortedDinosaurs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, sortedDinosaurs.length);
  const pagedDinosaurs = sortedDinosaurs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedPeriods, selectedDiets, sortKey, lengthMin, lengthMax, weightMin, weightMax]);

  const toggleCompare = (dinosaur: Dinosaur) => {
    setCompareIds((current) => {
      if (current.includes(dinosaur.id)) {
        return current.filter((id) => id !== dinosaur.id);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, dinosaur.id];
    });
  };

  const removeCompare = (id: string) => {
    setCompareIds((current) => current.filter((entry) => entry !== id));
  };

  const clearCompare = () => {
    setCompareIds([]);
  };

  const handleEraSelect = (eraId: string) => {
    if (eraId === 'all') {
      updateFilters({ periods: [] });
    } else {
      const isOnlyThisSelected =
        selectedPeriods.length === 1 && selectedPeriods.includes(eraId);
      if (isOnlyThisSelected) {
        updateFilters({ periods: [] });
      } else {
        updateFilters({ periods: [eraId] });
      }
    }
  };

  const filterPanelProps = {
    selectedPeriods,
    selectedDiets,
    lengthBounds,
    weightBounds,
    selectedLength: selectedLengthRange as [number, number],
    selectedWeight: selectedWeightRange as [number, number],
    onLengthChange: (range: [number, number]) => {
      const [min, max] = range;
      setLengthRange(Math.round(min * 10) / 10, Math.round(max * 10) / 10);
    },
    onWeightChange: (range: [number, number]) => {
      const [min, max] = range;
      setWeightRange(Math.round(min), Math.round(max));
    },
    onPeriodChange: togglePeriod,
    onDietChange: toggleDiet,
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
      <GeologicalStrataBar selectedPeriods={selectedPeriods} onSelectEra={handleEraSelect} />

      <main id="specimen-ledger" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <FilterPanel {...filterPanelProps} />
          </aside>

          <div className="lg:col-span-3 space-y-6">
            <SpecimenToolbar
              totalFiltered={filteredDinosaurs.length}
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
              onToggleCompare={toggleCompare}
              onQuickView={setQuickViewId}
              onResetFilters={clearFilters}
            />

            <SpecimenPagination
              page={page}
              totalPages={totalPages}
              pageStart={pageStart}
              pageEnd={pageEnd}
              totalFiltered={filteredDinosaurs.length}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>

      <SpecimenCompareTray
        compareDinosaurs={compareDinosaurs}
        onRemove={removeCompare}
        onClear={clearCompare}
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

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Loading Paleontology Archive...
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
