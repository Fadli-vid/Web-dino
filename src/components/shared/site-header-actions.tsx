'use client';

import { Bookmark, Search } from 'lucide-react';
import { useFieldNotebook } from '@/hooks/use-field-notebook';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';

export function SiteHeaderActions() {
  const {
    savedIds,
    isHydrated,
    setIsCommandOpen,
    setIsNotebookOpen,
  } = useFieldNotebook();

  const savedCount = isHydrated ? savedIds.length : 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsCommandOpen(true)}
        className="h-8 rounded-xl border-border/80 bg-card/70 hover:bg-card text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 px-2.5 sm:px-3"
        title="Open Quick Search (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="hidden sm:inline">Search archive...</span>
        <Kbd className="hidden md:inline-flex text-[10px] font-mono px-1.5 h-4">
          Ctrl K
        </Kbd>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsNotebookOpen(true)}
        className="h-8 rounded-xl border-border/80 bg-card/70 hover:bg-card text-xs flex items-center gap-1.5 px-2.5 sm:px-3"
        title="Open Field Notebook"
      >
        <Bookmark className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="hidden sm:inline font-medium">Notebook</span>
        {savedCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {savedCount}
          </span>
        )}
      </Button>
    </div>
  );
}
