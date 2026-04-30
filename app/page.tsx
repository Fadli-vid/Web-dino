'use client';

import { Suspense } from 'react';
import { SearchBar } from '@/components/dinosaur/search-bar';
import { FilterPanel } from '@/components/dinosaur/filter-panel';
import { DinosaurCard } from '@/components/dinosaur/dinosaur-card';
import { useDinosaurFilters } from '@/hooks/use-dinosaur-filters';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';
import { Empty } from '@/components/ui/empty';
import { Leaf, Mountain, Pickaxe, Compass } from 'lucide-react';

function HomePageContent() {
  const { filteredDinosaurs, selectedPeriods, selectedDiets } = useDinosaurFilters();
  const { togglePeriod, toggleDiet, setSearch, clearFilters } = useFilterNavigation();

  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-amber-900/10 border-b border-border/40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] opacity-[0.03] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[30rem] h-[30rem] bg-green-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Leaf className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
            Discover the Prehistoric World
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both flex items-center justify-center gap-3 flex-wrap">
            <Pickaxe className="h-10 w-10 md:h-14 md:w-14 text-amber-600/80" />
            Dinosaur <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-amber-600 drop-shadow-sm">Encyclopedia</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
            Unearth the mysteries of paleontology. Explore our comprehensive collection of the majestic giants that ruled the Earth millions of years ago.
          </p>
          <div className="w-full max-w-2xl mx-auto relative group animate-in fade-in zoom-in-95 duration-700 delay-300 fill-mode-both">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-amber-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <SearchBar onSearch={setSearch} onClear={() => setSearch('')} />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
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
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-sm p-12 text-center">
                <Empty
                  icon="SearchX"
                  title="No fossils found"
                  description="Try adjusting your expedition filters or search terms to discover different species."
                />
              </div>
            ) : (
              <>
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground/90 flex items-center gap-3">
                    <Compass className="text-primary h-7 w-7" />
                    Discovery Gallery
                  </h2>
                  <div className="text-sm font-medium text-muted-foreground bg-primary/10 px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2 shadow-sm w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Showing <span className="text-foreground font-bold">{filteredDinosaurs.length}</span> species
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 border-b border-border/40">
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center text-center">
            <div className="h-8 w-48 bg-muted rounded-full animate-pulse mb-8" />
            <div className="h-16 md:h-24 w-3/4 max-w-2xl bg-muted rounded-2xl animate-pulse mb-6" />
            <div className="h-20 w-2/3 max-w-xl bg-muted rounded-xl animate-pulse mb-12" />
            <div className="w-full max-w-2xl h-14 bg-muted rounded-full animate-pulse" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="lg:col-span-1 space-y-4">
              <div className="h-96 bg-muted rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
                <div className="h-8 w-32 bg-muted rounded-full animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
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
