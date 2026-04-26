'use client';

import { Suspense } from 'react';
import { SearchBar } from '@/components/dinosaur/search-bar';
import { FilterPanel } from '@/components/dinosaur/filter-panel';
import { DinosaurCard } from '@/components/dinosaur/dinosaur-card';
import { useDinosaurFilters } from '@/hooks/use-dinosaur-filters';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';
import { Empty } from '@/components/ui/empty';

function HomePageContent() {
  const { filteredDinosaurs, selectedPeriods, selectedDiets } = useDinosaurFilters();
  const { togglePeriod, toggleDiet, setSearch, clearFilters } = useFilterNavigation();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-muted-foreground/10 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-foreground">Dinosaur Encyclopedia</h1>
            <p className="text-muted-foreground mt-2">
              Explore the prehistoric world with our comprehensive collection
            </p>
          </div>
          <SearchBar onSearch={setSearch} onClear={() => setSearch('')} />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <FilterPanel
              selectedPeriods={selectedPeriods}
              selectedDiets={selectedDiets}
              onPeriodChange={togglePeriod}
              onDietChange={toggleDiet}
              onReset={clearFilters}
            />
          </aside>

          {/* Gallery */}
          <div className="lg:col-span-3">
            {filteredDinosaurs.length === 0 ? (
              <Empty
                icon="SearchX"
                title="No dinosaurs found"
                description="Try adjusting your search or filters to find what you&apos;re looking for."
              />
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredDinosaurs.length} dinosaur{filteredDinosaurs.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDinosaurs.map((dinosaur) => (
                    <DinosaurCard key={dinosaur.id} dinosaur={dinosaur} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <header className="border-b border-muted-foreground/10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-4xl font-bold text-foreground">Dinosaur Encyclopedia</h1>
            <div className="mt-4 h-11 bg-muted rounded-md animate-pulse" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    }>
      <HomePageContent />
    </Suspense>
  );
}
