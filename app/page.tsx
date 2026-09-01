'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { getDinosaurs } from '@/lib/dinosaurs-data';
import { Dinosaur } from '@/lib/types';
import { SearchBar } from '@/components/dinosaur/search-bar';
import { FilterPanel } from '@/components/dinosaur/filter-panel';
import { DinosaurCard } from '@/components/dinosaur/dinosaur-card';
import { useDinosaurFilters } from '@/hooks/use-dinosaur-filters';
import { useFilterNavigation } from '@/hooks/use-filter-navigation';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Compass,
  ArrowRight,
  X,
  Layers,
  Scale,
  Sparkles,
  ExternalLink,
  SearchX,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const PAGE_SIZE = 12;

const STRATA_ERAS = [
  { id: 'all', label: 'Semua Era', time: '252-66 Juta Tahun' },
  { id: 'Triassic', label: 'Trias (Triassic)', time: '252-201 Ma' },
  { id: 'Jurassic', label: 'Jura (Jurassic)', time: '201-145 Ma' },
  { id: 'Cretaceous', label: 'Kapur (Cretaceous)', time: '145-66 Ma' },
];

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

  const compareSet = useMemo(() => new Set(compareIds), [compareIds]);
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-[var(--font-display)] text-lg font-bold tracking-tight text-foreground">
                WIKIDINO
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest text-muted-foreground/80">
                Arsip Paleontologi
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-muted/40 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{totalSpecies} Spesimen Terdata</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80 text-xs"
              onClick={() => {
                const element = document.getElementById('specimen-ledger');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Jelajahi Arsip
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(1000px_400px_at_15%_10%,oklch(0.42_0.13_150/0.08),transparent),radial-gradient(800px_400px_at_85%_20%,oklch(0.70_0.15_65/0.08),transparent)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                MESOZOIC FOSSIL ARCHIVE
              </div>

              <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
                Eksplorasi Arsip Fosil & Fauna Prasejarah
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Katalog komprehensif spesimen dinosaurus dunia dari era Trias, Jura, hingga Kapur dengan catatan taksonomi dan fosil aktual.
              </p>

              {/* Quick Search */}
              <div className="pt-2 max-w-xl">
                <SearchBar onSearch={setSearch} onClear={() => setSearch('')} />
              </div>

              {/* Quick Specimen Counter Strip */}
              <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg">
                <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3">
                  <div className="text-[10px] uppercase font-mono text-muted-foreground">Koleksi Fosil</div>
                  <div className="text-xl font-bold text-foreground mt-0.5">{totalSpecies} Spesies</div>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3">
                  <div className="text-[10px] uppercase font-mono text-muted-foreground">Rentang Waktu</div>
                  <div className="text-xl font-bold text-foreground mt-0.5">3 Periode</div>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3">
                  <div className="text-[10px] uppercase font-mono text-muted-foreground">Klasifikasi</div>
                  <div className="text-xl font-bold text-foreground mt-0.5">Taksonomi Lengkap</div>
                </div>
              </div>
            </div>

            {/* Right Visual Feature */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-card/90 shadow-2xl">
                <div className="relative aspect-[4/3] w-full bg-muted/40">
                  <Image
                    src="/hero-specimen.jpg"
                    alt="Museum Paleontologi Fosil Dinosaurus"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Museum Specimen Plaque */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-background/90 backdrop-blur-md border border-border/80 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                        Spesimen Unggulan
                      </div>
                      <div className="font-[var(--font-display)] font-bold text-sm text-foreground">
                        Theropoda & Carnosauria
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                      Museum Grade
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Geological Strata Timeline Bar */}
      <section className="border-b border-border/60 bg-muted/25 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Pilih Stratigrafi Geologis:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {STRATA_ERAS.map((era) => {
                const isActive =
                  era.id === 'all'
                    ? selectedPeriods.length === 0
                    : selectedPeriods.includes(era.id);

                return (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => handleEraSelect(era.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card/70 border-border/70 text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <span>{era.label}</span>
                    <span className={`text-[10px] opacity-75 font-mono ${isActive ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                      ({era.time})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Ledger Content */}
      <main id="specimen-ledger" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
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

          {/* Gallery Main Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Ditemukan</span>
                <span className="font-semibold text-foreground">{filteredDinosaurs.length}</span>
                <span>spesies</span>
                {activeFiltersCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {activeFiltersCount} filter aktif
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden rounded-xl border-border/80 text-xs flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>Filter</span>
                      {activeFiltersCount > 0 && (
                        <span className="ml-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground font-bold flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[360px] p-5 overflow-y-auto bg-card">
                    <SheetHeader className="pb-3 border-b border-border/60 text-left">
                      <SheetTitle className="font-[var(--font-display)] text-base">Filter Ekspedisi</SheetTitle>
                      <SheetDescription className="text-xs">
                        Saring spesimen dinosaurus secara instan.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="pt-3">
                      <FilterPanel
                        variant="ghost"
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
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort Selector */}
                <Select value={sortKey} onValueChange={setSortKey}>
                  <SelectTrigger className="w-[180px] h-9 rounded-xl border-border/80 text-xs bg-background/80">
                    <SelectValue placeholder="Urutkan" />
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

                {/* View Mode Toggle */}
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value) setViewMode(value as 'grid' | 'list');
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border border-border/80 p-0.5 bg-background/80"
                >
                  <ToggleGroupItem value="grid" aria-label="Tampilan Grid" className="h-7 px-2.5 rounded-lg text-xs">
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="Tampilan List" className="h-7 px-2.5 rounded-lg text-xs">
                    <List className="h-3.5 w-3.5" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Specimen Results */}
            {filteredDinosaurs.length === 0 ? (
              <Empty className="border border-border/80 bg-card/60 rounded-2xl p-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX className="w-5 h-5 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle className="font-[var(--font-display)] text-lg text-foreground">
                    Spesimen tidak ditemukan
                  </EmptyTitle>
                  <EmptyDescription className="text-xs">
                    Sesuaikan kriteria filter atau ubah kata kunci pencarian Anda.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="rounded-xl text-xs"
                  >
                    Reset Semua Filter
                  </Button>
                </EmptyContent>
              </Empty>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pagedDinosaurs.map((dinosaur) => {
                  const isCompared = compareSet.has(dinosaur.id);
                  const isMaxCompare = compareIds.length >= 3 && !isCompared;

                  return (
                    <div key={dinosaur.id} className="relative group">
                      <DinosaurCard dinosaur={dinosaur} />

                      {/* Quick Action Overlay Buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setQuickViewId(dinosaur.id);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-background/90 backdrop-blur-md border border-border text-foreground hover:bg-background shadow-sm transition-colors"
                          title="Lihat sekilas spesimen"
                        >
                          Lihat Cepat
                        </button>
                        <button
                          type="button"
                          disabled={isMaxCompare}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCompare(dinosaur);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium backdrop-blur-md border shadow-sm transition-colors ${
                            isCompared
                              ? 'bg-primary text-primary-foreground border-primary'
                              : isMaxCompare
                              ? 'bg-muted/70 text-muted-foreground border-border cursor-not-allowed opacity-60'
                              : 'bg-background/90 border-border text-foreground hover:bg-background'
                          }`}
                          title={isCompared ? 'Hapus perbandingan' : isMaxCompare ? 'Maksimal 3 spesimen' : 'Tambah ke perbandingan'}
                        >
                          {isCompared ? 'Dipilih' : '+ Banding'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List / Ledger Mode */
              <div className="space-y-3">
                {pagedDinosaurs.map((dinosaur) => {
                  const isCompared = compareSet.has(dinosaur.id);
                  const isMaxCompare = compareIds.length >= 3 && !isCompared;

                  return (
                    <div
                      key={dinosaur.id}
                      className="rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-4 transition-all hover:border-primary/40 hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted/40 shrink-0 border border-border/60">
                          <Image
                            src={dinosaur.image}
                            alt={dinosaur.imageAlt || dinosaur.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/species/${dinosaur.id}`}
                              className="font-[var(--font-display)] font-bold text-base text-foreground hover:text-primary transition-colors"
                            >
                              {dinosaur.name}
                            </Link>
                            <span className="text-xs italic text-muted-foreground hidden md:inline">
                              ({dinosaur.scientificName})
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80 font-medium">
                              {dinosaur.period}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80 font-medium">
                              {dinosaur.diet}
                            </span>
                            <span className="font-mono">
                              P: {dinosaur.length}m | B: {(dinosaur.weight / 1000).toFixed(1)}t
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuickViewId(dinosaur.id)}
                          className="rounded-xl text-xs"
                        >
                          Lihat Cepat
                        </Button>
                        <Button
                          variant={isCompared ? 'default' : 'outline'}
                          size="sm"
                          disabled={isMaxCompare}
                          onClick={() => toggleCompare(dinosaur)}
                          className={`rounded-xl text-xs ${isCompared ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                          {isCompared ? 'Dipilih' : 'Bandingkan'}
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Link href={`/species/${dinosaur.id}`}>
                            Detail
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
                <div className="text-xs text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{pageStart}-{pageEnd}</span> dari{' '}
                  <span className="font-semibold text-foreground">{filteredDinosaurs.length}</span> spesimen
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl text-xs"
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-xs font-mono px-2 text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl text-xs"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Comparison Tray (When 1+ items selected) */}
      {compareDinosaurs.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
          <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 pl-1 shrink-0">
                <Scale className="w-3.5 h-3.5 text-primary" />
                <span>Bandingkan ({compareDinosaurs.length}/3):</span>
              </div>
              {compareDinosaurs.map((dino) => (
                <div
                  key={dino.id}
                  className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 px-2 py-1 text-xs shrink-0"
                >
                  <span className="font-medium text-foreground">{dino.name}</span>
                  <button
                    type="button"
                    onClick={() => removeCompare(dino.id)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Hapus ${dino.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompare}
                className="text-xs rounded-xl h-8 px-2.5 text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
              <Button
                size="sm"
                disabled={compareDinosaurs.length < 2}
                onClick={() => setIsCompareOpen(true)}
                className="text-xs rounded-xl h-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Buka Matriks
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal Dialog */}
      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent className="max-w-4xl border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl">
          <DialogHeader className="text-left border-b border-border/60 pb-3">
            <DialogTitle className="font-[var(--font-display)] text-xl flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Matriks Perbandingan Spesimen
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Perbandingan parameter morfologi dan taksonomi dinosaurus terpilih.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto py-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground">Atribut</th>
                  {compareDinosaurs.map((dino) => (
                    <th key={dino.id} className="py-2.5 px-3 font-bold text-foreground text-sm">
                      {dino.name}
                      <span className="block text-[11px] font-normal italic text-muted-foreground">
                        {dino.scientificName}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-muted-foreground">Visual</td>
                  {compareDinosaurs.map((dino) => (
                    <td key={`img-${dino.id}`} className="py-2.5 px-3">
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border/60 bg-muted/40">
                        <Image src={dino.image} alt={dino.name} fill className="object-cover" />
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-muted-foreground">Era / Periode</td>
                  {compareDinosaurs.map((dino) => (
                    <td key={`p-${dino.id}`} className="py-2.5 px-3 font-medium text-foreground">
                      {dino.period}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-muted-foreground">Pola Makan</td>
                  {compareDinosaurs.map((dino) => (
                    <td key={`d-${dino.id}`} className="py-2.5 px-3 font-medium text-foreground">
                      {dino.diet}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-muted-foreground">Panjang Tubuh</td>
                  {compareDinosaurs.map((dino) => (
                    <td key={`l-${dino.id}`} className="py-2.5 px-3 font-mono font-medium text-foreground">
                      {dino.length} meter
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-muted-foreground">Perkiraan Berat</td>
                  {compareDinosaurs.map((dino) => (
                    <td key={`w-${dino.id}`} className="py-2.5 px-3 font-mono font-medium text-foreground">
                      {(dino.weight / 1000).toFixed(1)} ton
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-muted-foreground">Lokasi Fosil</td>
                  {compareDinosaurs.map((dino) => (
                    <td key={`loc-${dino.id}`} className="py-2.5 px-3 text-muted-foreground">
                      {dino.locationFound || 'Data arsip'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-muted-foreground">Aksi</td>
                  {compareDinosaurs.map((dino) => (
                    <td key={`act-${dino.id}`} className="py-2.5 px-3">
                      <Button asChild size="sm" variant="outline" className="rounded-lg text-xs h-7">
                        <Link href={`/species/${dino.id}`}>
                          Lihat Detail
                        </Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick View Dialog */}
      <Dialog
        open={Boolean(quickViewDino)}
        onOpenChange={(open) => {
          if (!open) setQuickViewId(null);
        }}
      >
        {quickViewDino && (
          <DialogContent className="max-w-2xl border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl p-6">
            <div className="grid gap-6 sm:grid-cols-[1.1fr_1fr]">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/60 bg-muted/40">
                <Image
                  src={quickViewDino.image}
                  alt={quickViewDino.imageAlt || quickViewDino.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <DialogHeader className="text-left space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
                    {quickViewDino.period} • {quickViewDino.diet}
                  </div>
                  <DialogTitle className="font-[var(--font-display)] text-2xl font-bold text-foreground">
                    {quickViewDino.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs italic text-muted-foreground">
                    {quickViewDino.scientificName}
                  </DialogDescription>
                </DialogHeader>

                <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-4">
                  {quickViewDino.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="text-[10px] text-muted-foreground uppercase">Panjang</span>
                    <div className="font-mono font-semibold text-foreground">{quickViewDino.length} m</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <span className="text-[10px] text-muted-foreground uppercase">Berat</span>
                    <div className="font-mono font-semibold text-foreground">{(quickViewDino.weight / 1000).toFixed(1)} ton</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button asChild className="flex-1 rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href={`/species/${quickViewDino.id}`}>
                      Buka Dokumen Lengkap
                    </Link>
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-xl text-xs">
                      Tutup
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/20 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-[var(--font-display)] font-bold text-foreground">WIKIDINO</span>
            <span>- Arsip Digital Paleontologi & Fosil Prasejarah</span>
          </div>
          <div>
            Data spesimen dikurasi untuk tujuan edukasi dan eksplorasi sains.
          </div>
        </div>
      </footer>
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
            Memuat Arsip Paleontologi...
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
