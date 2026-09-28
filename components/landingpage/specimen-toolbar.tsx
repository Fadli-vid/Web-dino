'use client';

import { ComponentProps } from 'react';
import { SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { FilterPanel } from '@/components/dinosaur/filter-panel';

interface SpecimenToolbarProps {
  totalFiltered: number;
  activeFiltersCount: number;
  sortKey: string;
  onSortChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filterPanelProps: Omit<ComponentProps<typeof FilterPanel>, 'variant'>;
}

export function SpecimenToolbar({
  totalFiltered,
  activeFiltersCount,
  sortKey,
  onSortChange,
  viewMode,
  onViewModeChange,
  filterPanelProps,
}: SpecimenToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing</span>
        <span className="font-semibold text-foreground">{totalFiltered}</span>
        <span>species</span>
        {activeFiltersCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            {activeFiltersCount} active {activeFiltersCount === 1 ? 'filter' : 'filters'}
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
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[360px] p-5 overflow-y-auto bg-card">
            <SheetHeader className="pb-3 border-b border-border/60 text-left">
              <SheetTitle className="font-[var(--font-display)] text-base">
                Expedition Filters
              </SheetTitle>
              <SheetDescription className="text-xs">
                Filter dinosaur specimens instantly.
              </SheetDescription>
            </SheetHeader>
            <div className="pt-3">
              <FilterPanel variant="ghost" {...filterPanelProps} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort Selector */}
        <Select value={sortKey} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] h-9 rounded-xl border-border/80 text-xs bg-background/80">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="length-desc">Length (Longest)</SelectItem>
            <SelectItem value="length-asc">Length (Shortest)</SelectItem>
            <SelectItem value="weight-desc">Weight (Heaviest)</SelectItem>
            <SelectItem value="weight-asc">Weight (Lightest)</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) onViewModeChange(value as 'grid' | 'list');
          }}
          variant="outline"
          size="sm"
          className="rounded-xl border border-border/80 p-0.5 bg-background/80"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-7 px-2.5 rounded-lg text-xs">
            <LayoutGrid className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="h-7 px-2.5 rounded-lg text-xs">
            <List className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
