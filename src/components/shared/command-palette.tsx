'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Compass,
  Filter,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useFieldNotebook } from '@/hooks/use-field-notebook';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isCommandOpen,
    setIsCommandOpen,
    setIsNotebookOpen,
    summaries,
    isLoadingSummaries,
    ensureSummariesLoaded,
    savedIds,
    isHydrated,
  } = useFieldNotebook();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsCommandOpen(!isCommandOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, setIsCommandOpen]);

  useEffect(() => {
    if (isCommandOpen) {
      void ensureSummariesLoaded();
    }
  }, [isCommandOpen, ensureSummariesLoaded]);

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const savedSpecimens = useMemo(() => {
    if (!isHydrated || savedIds.length === 0) return [];
    return summaries.filter((item) => savedSet.has(item.id));
  }, [isHydrated, savedIds.length, summaries, savedSet]);

  const navigateTo = (href: string) => {
    setIsCommandOpen(false);
    router.push(href);
  };

  const openNotebook = () => {
    setIsCommandOpen(false);
    setIsNotebookOpen(true);
  };

  const openAnalytics = () => {
    setIsCommandOpen(false);
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('wikidino:open-analytics'));
    } else {
      router.push('/?analytics=1');
    }
  };

  return (
    <CommandDialog
      open={isCommandOpen}
      onOpenChange={setIsCommandOpen}
      title="WikiDino Command Palette"
      description="Search dinosaur specimens, geological eras, or run quick archive actions."
      className="max-w-xl rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl"
    >
      <CommandInput placeholder="Search specimens, scientific names, families, eras..." />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>
          {isLoadingSummaries ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading paleontology archive index...</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              No matching dinosaur specimens or commands found.
            </span>
          )}
        </CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem value="open field notebook bookmarks saved" onSelect={openNotebook}>
            <Bookmark className="w-4 h-4 text-primary" />
            <span>Open Field Notebook</span>
            <CommandShortcut>
              {isHydrated ? `${savedIds.length} saved` : '0 saved'}
            </CommandShortcut>
          </CommandItem>
          <CommandItem
            value="open paleobiology data analytics charts scatter plot"
            onSelect={openAnalytics}
          >
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Open Paleobiology Analytics</span>
            <CommandShortcut>Charts</CommandShortcut>
          </CommandItem>
          <CommandItem value="browse full archive home catalog" onSelect={() => navigateTo('/')}>
            <Compass className="w-4 h-4 text-primary" />
            <span>Browse Full Archive</span>
            <CommandShortcut>Home</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="filter era triassic early dinosaurs"
            onSelect={() => navigateTo('/?periods=Triassic')}
          >
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Filter Era: Triassic (252–201 Ma)</span>
          </CommandItem>
          <CommandItem
            value="filter era jurassic dinosaurs"
            onSelect={() => navigateTo('/?periods=Jurassic')}
          >
            <Filter className="w-4 h-4 text-emerald-500" />
            <span>Filter Era: Jurassic (201–145 Ma)</span>
          </CommandItem>
          <CommandItem
            value="filter era cretaceous dinosaurs"
            onSelect={() => navigateTo('/?periods=Cretaceous')}
          >
            <Filter className="w-4 h-4 text-teal-500" />
            <span>Filter Era: Cretaceous (145–66 Ma)</span>
          </CommandItem>
          <CommandItem
            value="filter diet carnivores meat eaters"
            onSelect={() => navigateTo('/?diets=Carnivore')}
          >
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>Filter Diet: Carnivores</span>
          </CommandItem>
          <CommandItem
            value="filter diet herbivores plant eaters"
            onSelect={() => navigateTo('/?diets=Herbivore')}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Filter Diet: Herbivores</span>
          </CommandItem>
        </CommandGroup>

        {savedSpecimens.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Saved in Field Notebook">
              {savedSpecimens.map((dino) => (
                <CommandItem
                  key={`saved-${dino.id}`}
                  value={`saved ${dino.name} ${dino.scientificName} ${dino.period}`}
                  onSelect={() => navigateTo(`/species/${dino.id}`)}
                >
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-foreground truncate">{dino.name}</span>
                    <span className="text-[11px] italic text-muted-foreground truncate">
                      {dino.scientificName}
                    </span>
                  </div>
                  <CommandShortcut>{dino.period}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {summaries.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Specimens (${summaries.length})`}>
              {summaries.map((dino) => (
                <CommandItem
                  key={dino.id}
                  value={`${dino.name} ${dino.scientificName} ${dino.period} ${dino.subPeriod ?? ''} ${dino.diet} ${dino.continent ?? ''} ${dino.taxonomy?.family ?? ''} ${dino.taxonomy?.order ?? ''}`}
                  onSelect={() => navigateTo(`/species/${dino.id}`)}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground truncate">{dino.name}</span>
                        {isHydrated && savedSet.has(dino.id) && (
                          <BookmarkCheck className="w-3 h-3 text-primary shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate">
                        <span className="italic">{dino.scientificName}</span>
                        {dino.taxonomy?.family ? ` · ${dino.taxonomy.family}` : ''}
                      </span>
                    </div>
                  </div>
                  <CommandShortcut className="text-[10px] font-mono">
                    {dino.period} · {dino.diet}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
