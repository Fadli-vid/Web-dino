'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { getDinosaurs } from '@/lib/dinosaurs-data';
import { Dinosaur } from '@/lib/types';
import { SearchBar } from '@/components/dinosaur/search-bar';
import { FilterPanel } from '@/components/dinosaur/filter-panel';
import { DinosaurCard } from '@/components/dinosaur/dinosaur-card';
import { useDinosaurFilters } from '@/hooks/use-dinosaur-filters';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';
import { Empty } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Leaf, Mountain, Pickaxe, Compass, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const PAGE_SIZE = 12;

function HomePageContent() {
  const [dinosaurs, setDinosaurs] = useState<Dinosaur[]>([]);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

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
    togglePeriod,
    toggleDiet,
    setSearch,
    clearFilters,
    setLengthRange,
    setWeightRange,
  } = useFilterNavigation();
  const totalSpecies = dinosaurs.length;
  const activeFiltersCount = selectedPeriods.length + selectedDiets.length;
  const eraFocus = selectedPeriods.length ? selectedPeriods.join(' / ') : 'All eras';
  const dietFocus = selectedDiets.length ? selectedDiets.join(' / ') : 'All diets';
  const lengthBounds = useMemo(() => {
    const values = dinosaurs.map((dino) => dino.length).filter(Number.isFinite);
    if (values.length === 0) {
      return { min: 0, max: 0 };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      min: Math.floor(min * 10) / 10,
      max: Math.ceil(max * 10) / 10,
    };
  }, [dinosaurs]);
  const weightBounds = useMemo(() => {
    const values = dinosaurs.map((dino) => dino.weight).filter(Number.isFinite);
    if (values.length === 0) {
      return { min: 0, max: 0 };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      min: Math.floor(min / 100) * 100,
      max: Math.ceil(max / 100) * 100,
    };
  }, [dinosaurs]);
  const selectedLengthRange = useMemo(() => {
    const min = lengthMin ?? lengthBounds.min;
    const max = lengthMax ?? lengthBounds.max;
    const clampedMin = Math.min(Math.max(min, lengthBounds.min), lengthBounds.max);
    const clampedMax = Math.min(Math.max(max, lengthBounds.min), lengthBounds.max);
    return clampedMin <= clampedMax
      ? [clampedMin, clampedMax]
      : [clampedMax, clampedMin];
  }, [lengthMin, lengthMax, lengthBounds]);
  const selectedWeightRange = useMemo(() => {
    const min = weightMin ?? weightBounds.min;
    const max = weightMax ?? weightBounds.max;
    const clampedMin = Math.min(Math.max(min, weightBounds.min), weightBounds.max);
    const clampedMax = Math.min(Math.max(max, weightBounds.min), weightBounds.max);
    return clampedMin <= clampedMax
      ? [clampedMin, clampedMax]
      : [clampedMax, clampedMin];
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

  const compareSet = useMemo(() => new Set(compareIds), [compareIds]);
  const compareDinosaurs = useMemo(() => {
    return compareIds
      .map((id) => dinosaurs.find((dino) => dino.id === id))
      .filter((dino): dino is Dinosaur => Boolean(dino));
  }, [compareIds, dinosaurs]);
  const compareLimitReached = compareIds.length >= 3;
  const quickViewDino = useMemo(() => {
    if (!quickViewId) {
      return null;
    }
    return dinosaurs.find((dino) => dino.id === quickViewId) || null;
  }, [quickViewId, dinosaurs]);

  const totalPages = Math.max(1, Math.ceil(sortedDinosaurs.length / PAGE_SIZE));
  const pageStart = sortedDinosaurs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, sortedDinosaurs.length);
  const pagedDinosaurs = sortedDinosaurs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const canGoBack = page > 1;
  const canGoNext = page < totalPages;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedPeriods, selectedDiets, sortKey, lengthMin, lengthMax, weightMin, weightMax]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setCompareIds((current) =>
      current.filter((id) => filteredDinosaurs.some((dino) => dino.id === id))
    );
  }, [filteredDinosaurs]);

  useEffect(() => {
    setQuickViewId((current) => {
      if (!current) {
        return null;
      }
      return filteredDinosaurs.some((dino) => dino.id === current) ? current : null;
    });
  }, [filteredDinosaurs]);

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

  const openQuickView = (dinosaur: Dinosaur) => {
    setQuickViewId(dinosaur.id);
  };

  const closeQuickView = () => {
    setQuickViewId(null);
  };

  return (
    <main className="min-h-screen bg-background selection:bg-amber-200/70 selection:text-amber-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(1200px_600px_at_12%_-10%,rgba(19,120,86,0.25),transparent),radial-gradient(900px_500px_at_92%_0%,rgba(180,120,40,0.25),transparent)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,90,50,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,90,50,0.12)_1px,transparent_1px)] opacity-[0.2] bg-[size:28px_28px]"></div>
        <div className="absolute -top-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-amber-500/20 blur-3xl"></div>
        <div className="absolute -bottom-36 -left-24 h-[26rem] w-[26rem] rounded-full bg-emerald-700/20 blur-3xl"></div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(90deg,rgba(88,63,38,0.2),rgba(150,101,51,0.2),rgba(88,63,38,0.2))] opacity-70"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-amber-200/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-amber-900/70 shadow-sm backdrop-blur">
                <Mountain className="h-4 w-4 text-amber-700" />
                Paleontology Field Station
              </div>
              <h1 className="text-5xl md:text-7xl font-[var(--font-display)] font-bold tracking-tight text-foreground">
                <span className="block text-sm md:text-base uppercase tracking-[0.4em] text-muted-foreground mb-3">Mesozoic Archive</span>
                Dinosaur{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-700 to-amber-700">Encyclopedia</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Trace the strata of time. Filter by era and diet to uncover fossil records, taxonomy notes, and the field stories behind each discovery.
              </p>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-foreground/70">
                <span className="rounded-full border border-amber-700/30 bg-amber-100/70 px-4 py-1.5">Triassic</span>
                <span className="rounded-full border border-emerald-700/30 bg-emerald-100/70 px-4 py-1.5">Jurassic</span>
                <span className="rounded-full border border-orange-700/30 bg-orange-100/70 px-4 py-1.5">Cretaceous</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">Specimens</div>
                  <div className="text-2xl font-semibold text-foreground">{totalSpecies}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">Active Filters</div>
                  <div className="text-2xl font-semibold text-foreground">{activeFiltersCount}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">Era Focus</div>
                  <div className="text-sm font-semibold text-foreground">{eraFocus}</div>
                </div>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-amber-400/20 via-transparent to-emerald-400/20 blur-2xl opacity-80"></div>
              <div className="relative rounded-[2.5rem] border border-border/70 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Pickaxe className="h-4 w-4 text-amber-600" />
                    Expedition Console
                  </div>
                  <span className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[0.65rem]">Field Issue 09</span>
                </div>
                <div className="mt-6">
                  <SearchBar onSearch={setSearch} onClear={() => setSearch('')} />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <Compass className="h-4 w-4 text-emerald-600" />
                      Diet Focus
                    </div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{dietFocus}</div>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-background/70 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <Leaf className="h-4 w-4 text-green-600" />
                      Survey Hint
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Combine era and diet filters to pinpoint rare fossil records.
                    </div>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-dashed border-amber-700/40 bg-amber-100/50 px-4 py-3 text-xs uppercase tracking-[0.25em] text-amber-900/70">
                  Field log updated in real time as you search.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-14 sm:py-20 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_300px_at_20%_0%,rgba(110,80,40,0.12),transparent)]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <FilterPanel
              selectedPeriods={selectedPeriods}
              selectedDiets={selectedDiets}
              lengthBounds={lengthBounds}
              weightBounds={weightBounds}
              selectedLength={selectedLengthRange as [number, number]}
              selectedWeight={selectedWeightRange as [number, number]}
              onLengthChange={(range) => {
                const [min, max] = range;
                setLengthRange(Math.round(min * 10) / 10, Math.round(max * 10) / 10);
              }}
              onWeightChange={(range) => {
                const [min, max] = range;
                setWeightRange(Math.round(min), Math.round(max));
              }}
              onPeriodChange={togglePeriod}
              onDietChange={toggleDiet}
              onReset={clearFilters}
            />
          </aside>

          {/* Gallery */}
          <div className="lg:col-span-3">
            {filteredDinosaurs.length === 0 ? (
              <div className="rounded-3xl border border-border/60 bg-[radial-gradient(600px_240px_at_50%_0%,rgba(180,120,40,0.16),transparent)] p-12 text-center shadow-sm">
                <Empty
                  icon="SearchX"
                  title="No fossils recovered"
                  description="Adjust your expedition filters or search terms to uncover new species."
                />
              </div>
            ) : (
              <>
                <div className="mb-8 rounded-3xl border border-border/60 bg-card/70 backdrop-blur px-6 py-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        <Compass className="h-4 w-4 text-emerald-700" />
                        Expedition Ledger
                      </div>
                      <h2 className="mt-3 text-3xl font-[var(--font-display)] tracking-tight text-foreground">Specimen Gallery</h2>
                      <p className="text-sm text-muted-foreground">
                        Every card is a curated fossil dossier matched to your filters.
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground bg-amber-100/80 px-4 py-2 rounded-full border border-amber-700/20 flex items-center gap-2 shadow-sm w-fit">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                      Total <span className="text-foreground font-bold">{filteredDinosaurs.length}</span> species
                    </div>
                  </div>
                </div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Urutkan hasil
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                    <Select value={sortKey} onValueChange={setSortKey}>
                      <SelectTrigger className="w-full sm:w-[230px] rounded-full border border-border/60 bg-background/80 px-4">
                        <SelectValue placeholder="Pilih urutan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
                        <SelectItem value="length-desc">Panjang (Terbesar)</SelectItem>
                        <SelectItem value="length-asc">Panjang (Terkecil)</SelectItem>
                        <SelectItem value="weight-desc">Berat (Terbesar)</SelectItem>
                        <SelectItem value="weight-asc">Berat (Terkecil)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Tampilan
                      </span>
                      <ToggleGroup
                        type="single"
                        value={viewMode}
                        onValueChange={(value) => {
                          if (value) {
                            setViewMode(value as 'grid' | 'list');
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        aria-label="Tampilan daftar"
                      >
                        <ToggleGroupItem value="grid" aria-label="Tampilan grid" className="flex-1 sm:flex-none">
                          <LayoutGrid className="h-4 w-4" />
                          Grid
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="Tampilan list" className="flex-1 sm:flex-none">
                          <List className="h-4 w-4" />
                          List
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </div>
                <div className="mb-6 rounded-3xl border border-border/60 bg-card/70 backdrop-blur px-5 py-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold text-[18px]">
                        Bandingkan Spesimen
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Dipilih <span className="text-foreground font-semibold">{compareDinosaurs.length}</span>/3
                      </span>
                      <button
                        type="button"
                        onClick={clearCompare}
                        disabled={compareDinosaurs.length === 0}
                        className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {compareDinosaurs.length === 0 ? (
                    <div className="mt-4 text-sm text-muted-foreground">
                      Belum ada dinosaurus yang dipilih untuk dibandingkan.
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {compareDinosaurs.map((dino) => (
                          <div
                            key={`chip-${dino.id}`}
                            className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground"
                          >
                            <span>{dino.name}</span>
                            <button
                              type="button"
                              onClick={() => removeCompare(dino.id)}
                              className="rounded-full border border-border/60 px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground hover:text-foreground"
                              aria-label={`Hapus ${dino.name} dari perbandingan`}
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>

                      {compareDinosaurs.length < 2 ? (
                        <div className="mt-3 text-sm text-muted-foreground">
                          Tambahkan minimal 1 dinosaurus lagi untuk melihat perbandingan.
                        </div>
                      ) : (
                        <div
                          className="mt-5 grid gap-3 text-sm"
                          style={{
                            gridTemplateColumns: `minmax(150px, 200px) repeat(${compareDinosaurs.length}, minmax(0, 1fr))`,
                          }}
                        >
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Atribut</div>
                          {compareDinosaurs.map((dino) => (
                            <div
                              key={`header-${dino.id}`}
                              className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2"
                            >
                              <div className="font-semibold text-foreground">{dino.name}</div>
                              <div className="text-xs italic text-muted-foreground">{dino.scientificName}</div>
                            </div>
                          ))}

                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Era / Periode</div>
                          {compareDinosaurs.map((dino) => (
                            <div
                              key={`period-${dino.id}`}
                              className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2"
                            >
                              <span className="rounded-full border border-amber-700/30 bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                                {dino.period}
                              </span>
                            </div>
                          ))}

                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pola Makan</div>
                          {compareDinosaurs.map((dino) => (
                            <div
                              key={`diet-${dino.id}`}
                              className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2"
                            >
                              <span className="rounded-full border border-emerald-700/30 bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                                {dino.diet}
                              </span>
                            </div>
                          ))}

                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Panjang</div>
                          {compareDinosaurs.map((dino) => (
                            <div
                              key={`length-${dino.id}`}
                              className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2 font-semibold text-foreground"
                            >
                              {dino.length} m
                            </div>
                          ))}

                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Berat</div>
                          {compareDinosaurs.map((dino) => (
                            <div
                              key={`weight-${dino.id}`}
                              className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2 font-semibold text-foreground"
                            >
                              {(dino.weight / 1000).toFixed(1)} ton
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pagedDinosaurs.map((dinosaur) => (
                      <div key={dinosaur.id} className="relative">
                        <DinosaurCard dinosaur={dinosaur} />
                        <button
                          type="button"
                          onClick={() => openQuickView(dinosaur)}
                          aria-haspopup="dialog"
                          className="absolute left-4 top-4 z-10 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
                        >
                          Lihat cepat
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCompare(dinosaur)}
                          disabled={!compareSet.has(dinosaur.id) && compareLimitReached}
                          aria-pressed={compareSet.has(dinosaur.id)}
                          className={`absolute right-4 top-4 z-10 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur transition-colors ${
                            compareSet.has(dinosaur.id)
                              ? 'border-emerald-700/40 bg-emerald-600 text-white'
                              : 'border-border/60 bg-background/80 text-foreground hover:bg-background'
                          } ${
                            !compareSet.has(dinosaur.id) && compareLimitReached
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                          }`}
                          title={
                            compareSet.has(dinosaur.id)
                              ? 'Hapus dari perbandingan'
                              : compareLimitReached
                                ? 'Maksimal 3 dinosaurus'
                                : 'Tambahkan ke perbandingan'
                          }
                        >
                          {compareSet.has(dinosaur.id)
                            ? 'Dipilih'
                            : compareLimitReached
                              ? 'Maks 3'
                              : 'Bandingkan'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pagedDinosaurs.map((dinosaur) => {
                      const compareSelected = compareSet.has(dinosaur.id);
                      const compareDisabled = !compareSelected && compareLimitReached;
                      const compareLabel = compareSelected
                        ? 'Dipilih'
                        : compareDisabled
                          ? 'Maks 3'
                          : 'Bandingkan';

                      return (
                        <div
                          key={dinosaur.id}
                          className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur px-4 py-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row">
                            <Link
                              href={`/species/${dinosaur.id}`}
                              className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30 sm:w-40 sm:shrink-0"
                              style={{ aspectRatio: '4 / 3' }}
                            >
                              <Image
                                src={dinosaur.image}
                                alt={dinosaur.imageAlt}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-transparent" />
                            </Link>
                            <div className="flex flex-1 flex-col gap-3">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <Link
                                    href={`/species/${dinosaur.id}`}
                                    className="text-xl font-semibold text-foreground transition-colors hover:text-primary"
                                  >
                                    {dinosaur.name}
                                  </Link>
                                  <div className="text-sm italic text-muted-foreground">
                                    {dinosaur.scientificName}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span className="rounded-full border border-amber-700/30 bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                                    {dinosaur.period}
                                  </span>
                                  <span className="rounded-full border border-emerald-700/30 bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                                    {dinosaur.diet}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {dinosaur.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
                                  Panjang: {dinosaur.length} m
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
                                  Berat: {(dinosaur.weight / 1000).toFixed(1)} ton
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() => openQuickView(dinosaur)}
                                >
                                  Lihat cepat
                                </Button>
                                <Button
                                  size="sm"
                                  variant={compareSelected ? 'default' : 'outline'}
                                  className={`rounded-full ${
                                    compareSelected ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''
                                  }`}
                                  onClick={() => toggleCompare(dinosaur)}
                                  disabled={compareDisabled}
                                  aria-pressed={compareSelected}
                                  title={
                                    compareSelected
                                      ? 'Hapus dari perbandingan'
                                      : compareDisabled
                                        ? 'Maksimal 3 dinosaurus'
                                        : 'Tambahkan ke perbandingan'
                                  }
                                >
                                  {compareLabel}
                                </Button>
                                <Button
                                  size="sm"
                                  asChild
                                  className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <Link href={`/species/${dinosaur.id}`}>Detail</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {filteredDinosaurs.length > PAGE_SIZE && (
                  <div className="mt-10 rounded-2xl border border-border/60 bg-card/70 backdrop-blur px-5 py-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-muted-foreground">
                        Menampilkan{' '}
                        <span className="font-semibold text-foreground">{pageStart}-{pageEnd}</span> dari{' '}
                        <span className="font-semibold text-foreground">{filteredDinosaurs.length}</span> spesies
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          Halaman <span className="text-foreground font-semibold">{page}</span> / {totalPages}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={!canGoBack}
                            className="rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Sebelumnya
                          </button>
                          <button
                            type="button"
                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                            disabled={!canGoNext}
                            className="rounded-full border border-amber-700/30 bg-amber-100/80 px-4 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-200/80 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Dialog
        open={Boolean(quickViewDino)}
        onOpenChange={(open) => {
          if (!open) {
            closeQuickView();
          }
        }}
      >
        {quickViewDino && (
          <DialogContent className="max-w-3xl border-border/70 bg-card/90 backdrop-blur">
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div
                className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30"
                style={{ aspectRatio: '4 / 3' }}
              >
                <Image
                  src={quickViewDino.image}
                  alt={quickViewDino.imageAlt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-transparent" />
              </div>
              <div className="space-y-4">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-[var(--font-display)]">
                    {quickViewDino.name}
                  </DialogTitle>
                  <DialogDescription className="text-sm italic">
                    {quickViewDino.scientificName}
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {quickViewDino.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-700/30 bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                    {quickViewDino.period}
                  </span>
                  <span className="rounded-full border border-emerald-700/30 bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                    {quickViewDino.diet}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Panjang</div>
                    <div className="font-semibold text-foreground">{quickViewDino.length} m</div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Berat</div>
                    <div className="font-semibold text-foreground">
                      {(quickViewDino.weight / 1000).toFixed(1)} ton
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                    <Link href={`/species/${quickViewDino.id}`}>Lihat detail</Link>
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-full">
                      Tutup
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="h-7 w-56 bg-muted rounded-full animate-pulse" />
                <div className="h-20 w-3/4 bg-muted rounded-2xl animate-pulse" />
                <div className="h-20 w-2/3 bg-muted rounded-xl animate-pulse" />
                <div className="flex flex-wrap gap-3">
                  <div className="h-8 w-28 bg-muted rounded-full animate-pulse" />
                  <div className="h-8 w-28 bg-muted rounded-full animate-pulse" />
                  <div className="h-8 w-32 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="h-20 bg-muted rounded-2xl animate-pulse" />
                  <div className="h-20 bg-muted rounded-2xl animate-pulse" />
                  <div className="h-20 bg-muted rounded-2xl animate-pulse" />
                </div>
              </div>
              <div className="h-96 bg-muted rounded-[2.5rem] animate-pulse" />
            </div>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="lg:col-span-1 space-y-4">
              <div className="h-[28rem] bg-muted rounded-3xl animate-pulse" />
            </div>
            <div className="lg:col-span-3">
              <div className="mb-6 h-24 bg-muted rounded-3xl animate-pulse" />
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
