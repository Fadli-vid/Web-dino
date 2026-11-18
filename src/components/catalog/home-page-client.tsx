'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { getDinosaurs } from '@/lib/dinosaurs-data';
import { Dinosaur } from '@/lib/types';
import { FilterPanel } from '@/components/catalog/filter-panel';
import {
  useDinosaurFilters,
  getMyaRangeForPeriods,
  MESOZOIC_MAX_MA,
  MESOZOIC_MIN_MA,
} from '@/hooks/use-dinosaur-filters';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';
import { useFieldNotebook } from '@/hooks/use-field-notebook';
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
} from '@/components/catalog';

const PAGE_SIZE = 12;

const PaleoAnalyticsDialog = dynamic(
  () =>
    import('@/components/analytics/paleo-analytics-dialog').then(
      (mod) => mod.PaleoAnalyticsDialog
    ),
  { ssr: false }
);

interface HomePageClientProps {
  initialDinosaurs?: Dinosaur[];
}

export function HomePageClient({ initialDinosaurs = [] }: HomePageClientProps) {
  const [dinosaurs, setDinosaurs] = useState<Dinosaur[]>(initialDinosaurs);
  const [sortKey, setSortKey] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const searchParams = useSearchParams();
  const analyticsParam = searchParams.get('analytics');
  const [analyticsState, setAnalyticsState] = useState<{
    open: boolean;
    dismissedParam: string | null;
  }>(() => ({
    open: analyticsParam === '1',
    dismissedParam: null,
  }));
  const isAnalyticsOpen =
    analyticsState.open ||
    (analyticsParam === '1' && analyticsState.dismissedParam !== analyticsParam);

  const setIsAnalyticsOpen = (nextOpen: boolean) => {
    setAnalyticsState({
      open: nextOpen,
      dismissedParam: !nextOpen && analyticsParam === '1' ? analyticsParam : null,
    });
  };
  const { seedSummaries } = useFieldNotebook();

  useEffect(() => {
    const handleOpenAnalytics = () =>
      setAnalyticsState({ open: true, dismissedParam: null });
    window.addEventListener('wikidino:open-analytics', handleOpenAnalytics);
    return () => window.removeEventListener('wikidino:open-analytics', handleOpenAnalytics);
  }, []);

  // Seed lightweight catalog summaries into global Command Palette & Notebook context
  useEffect(() => {
    if (dinosaurs.length > 0) {
      seedSummaries(
        dinosaurs.map((d) => ({
          id: d.id,
          name: d.name,
          scientificName: d.scientificName,
          period: d.period,
          subPeriod: d.subPeriod,
          myaStart: d.myaStart,
          myaEnd: d.myaEnd,
          length: d.length,
          weight: d.weight,
          diet: d.diet,
          locomotion: d.locomotion,
          continent: d.continent,
          locationFound: d.locationFound,
          image: d.image,
          taxonomy: {
            order: d.taxonomy?.order || '',
            family: d.taxonomy?.family || '',
            genus: d.taxonomy?.genus || '',
          },
        }))
      );
    }
  }, [dinosaurs, seedSummaries]);

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
    myaMin,
    myaMax,
  } = useDinosaurFilters(dinosaurs);

  const {
    togglePeriod,
    toggleDiet,
    setSearch,
    clearFilters,
    setLengthRange,
    setWeightRange,
    setMyaRange,
  } = useFilterNavigation();

  const totalSpecies = dinosaurs.length;
  const hasMyaFilter =
    (myaMin !== null && myaMin > MESOZOIC_MIN_MA) ||
    (myaMax !== null && myaMax < MESOZOIC_MAX_MA);
  const hasLengthFilter = lengthMin !== null || lengthMax !== null;
  const hasWeightFilter = weightMin !== null || weightMax !== null;
  const activeFiltersCount =
    selectedPeriods.length +
    selectedDiets.length +
    (hasMyaFilter ? 1 : 0) +
    (hasLengthFilter ? 1 : 0) +
    (hasWeightFilter ? 1 : 0);

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

  const filterKey = useMemo(
    () =>
      JSON.stringify([
        searchQuery,
        selectedPeriods,
        selectedDiets,
        lengthMin,
        lengthMax,
        weightMin,
        weightMax,
        myaMin,
        myaMax,
      ]),
    [
      searchQuery,
      selectedPeriods,
      selectedDiets,
      lengthMin,
      lengthMax,
      weightMin,
      weightMax,
      myaMin,
      myaMax,
    ]
  );

  const [paginationState, setPaginationState] = useState<{
    filterKey: string;
    page: number;
  }>({ filterKey, page: 1 });

  const page = paginationState.filterKey === filterKey ? paginationState.page : 1;
  const setPage = (nextPage: number) => setPaginationState({ filterKey, page: nextPage });

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

  const selectedMyaRange: [number, number] = useMemo(() => {
    const periodFallback =
      myaMin === null && myaMax === null ? getMyaRangeForPeriods(selectedPeriods) : null;
    const min = myaMin ?? periodFallback?.[0] ?? MESOZOIC_MIN_MA;
    const max = myaMax ?? periodFallback?.[1] ?? MESOZOIC_MAX_MA;
    const clampedMin = Math.min(Math.max(min, MESOZOIC_MIN_MA), MESOZOIC_MAX_MA);
    const clampedMax = Math.min(Math.max(max, MESOZOIC_MIN_MA), MESOZOIC_MAX_MA);
    return clampedMin <= clampedMax ? [clampedMin, clampedMax] : [clampedMax, clampedMin];
  }, [myaMin, myaMax, selectedPeriods]);

  const filterPanelProps = {
    selectedPeriods,
    selectedDiets,
    lengthBounds,
    weightBounds,
    selectedLength: (selectedLengthRange as [number, number]) || [lengthBounds.min, lengthBounds.max],
    selectedWeight: (selectedWeightRange as [number, number]) || [weightBounds.min, weightBounds.max],
    selectedMya: selectedMyaRange,
    onLengthChange: (range: [number, number]) => setLengthRange(range[0], range[1]),
    onWeightChange: (range: [number, number]) => setWeightRange(range[0], range[1]),
    onMyaChange: (range: [number, number]) => {
      if (range[0] <= MESOZOIC_MIN_MA && range[1] >= MESOZOIC_MAX_MA) {
        setMyaRange(null, null);
      } else {
        setMyaRange(range[0], range[1]);
      }
    },
    onPeriodChange: (period: string) => togglePeriod(period),
    onDietChange: (diet: string) => toggleDiet(diet),
    onReset: clearFilters,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingHeader />

      <HeroSection
        onSearch={setSearch}
        initialSearch={searchQuery}
      />

      {/* 3-Card Specimen Strip - Tepat di luar/di bawah hero, ukuran full horizontal */}
      <section className="w-full border-b border-border/60 bg-card/60 backdrop-blur-xs">
        <div className="w-full grid grid-cols-3 divide-x divide-border/60">
          <div className="px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex flex-col justify-center">
            <div className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-muted-foreground">
              Fossil Collection
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {totalSpecies} Species
            </div>
          </div>
          <div className="px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex flex-col justify-center">
            <div className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-muted-foreground">
              Temporal Range
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground mt-0.5">
              3 Eras
            </div>
          </div>
          <div className="px-4 sm:px-8 lg:px-12 py-4 sm:py-5 flex flex-col justify-center">
            <div className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-muted-foreground">
              Classification
            </div>
            <div className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Full Taxonomy
            </div>
          </div>
        </div>
      </section>

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
              onOpenAnalytics={() => setIsAnalyticsOpen(true)}
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

      {isAnalyticsOpen && (
        <PaleoAnalyticsDialog
          open={isAnalyticsOpen}
          onOpenChange={setIsAnalyticsOpen}
          allDinosaurs={dinosaurs}
          filteredDinosaurs={filteredDinosaurs}
        />
      )}

      <LandingFooter />
    </div>
  );
}
