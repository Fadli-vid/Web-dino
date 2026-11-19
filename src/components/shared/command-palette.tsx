'use client';

import { useEffect, useMemo, useState } from 'react';
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

const SEARCH_DEBOUNCE_MS = 500;

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

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);

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
    } else {
      // Reset search query and debounced state when closing dialog
      setSearchQuery('');
      setDebouncedQuery('');
      setIsDebouncing(false);
    }
  }, [isCommandOpen, ensureSummariesLoaded]);

  // 0.5s Debounce timer for efficient search filtering
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
      setIsDebouncing(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const quickActions = useMemo(
    () => [
      {
        id: 'action-notebook',
        label: 'Open Field Notebook',
        shortcut: isHydrated ? `${savedIds.length} saved` : '0 saved',
        keywords: 'open field notebook bookmarks saved collection',
        icon: <Bookmark className="w-4 h-4 text-primary" />,
        onSelect: openNotebook,
      },
      {
        id: 'action-analytics',
        label: 'Open Paleobiology Analytics',
        shortcut: 'Charts',
        keywords: 'open paleobiology data analytics charts scatter plot biomass ecology',
        icon: <BarChart3 className="w-4 h-4 text-primary" />,
        onSelect: openAnalytics,
      },
      {
        id: 'action-archive',
        label: 'Browse Full Archive',
        shortcut: 'Home',
        keywords: 'browse full archive home catalog fossils list species',
        icon: <Compass className="w-4 h-4 text-primary" />,
        onSelect: () => navigateTo('/'),
      },
      {
        id: 'action-triassic',
        label: 'Filter Era: Triassic (252–201 Ma)',
        keywords: 'filter era triassic early dinosaurs pangaea 252 201 ma',
        icon: <Filter className="w-4 h-4 text-amber-500" />,
        onSelect: () => navigateTo('/?periods=Triassic'),
      },
      {
        id: 'action-jurassic',
        label: 'Filter Era: Jurassic (201–145 Ma)',
        keywords: 'filter era jurassic dinosaurs golden age 201 145 ma',
        icon: <Filter className="w-4 h-4 text-emerald-500" />,
        onSelect: () => navigateTo('/?periods=Jurassic'),
      },
      {
        id: 'action-cretaceous',
        label: 'Filter Era: Cretaceous (145–66 Ma)',
        keywords: 'filter era cretaceous dinosaurs 145 66 ma k-pg impact',
        icon: <Filter className="w-4 h-4 text-teal-500" />,
        onSelect: () => navigateTo('/?periods=Cretaceous'),
      },
      {
        id: 'action-carnivores',
        label: 'Filter Diet: Carnivores',
        keywords: 'filter diet carnivores meat eaters theropods predators',
        icon: <Sparkles className="w-4 h-4 text-red-500" />,
        onSelect: () => navigateTo('/?diets=Carnivore'),
      },
      {
        id: 'action-herbivores',
        label: 'Filter Diet: Herbivores',
        keywords: 'filter diet herbivores plant eaters sauropods ceratopsians',
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        onSelect: () => navigateTo('/?diets=Herbivore'),
      },
    ],
    [isHydrated, savedIds.length]
  );

  const queryTokens = useMemo(() => {
    return debouncedQuery.toLowerCase().split(/\s+/).filter(Boolean);
  }, [debouncedQuery]);

  const filteredQuickActions = useMemo(() => {
    if (queryTokens.length === 0) return quickActions;
    return quickActions.filter((action) => {
      const text = `${action.label} ${action.keywords}`.toLowerCase();
      return queryTokens.every((token) => text.includes(token));
    });
  }, [quickActions, queryTokens]);

  const filteredSavedSpecimens = useMemo(() => {
    if (queryTokens.length === 0) return savedSpecimens;
    return savedSpecimens.filter((dino) => {
      const text = `${dino.name} ${dino.scientificName} ${dino.period} ${dino.subPeriod ?? ''} ${dino.diet} ${dino.continent ?? ''}`.toLowerCase();
      return queryTokens.every((token) => text.includes(token));
    });
  }, [savedSpecimens, queryTokens]);

  const filteredSpecimens = useMemo(() => {
    if (queryTokens.length === 0) return summaries;
    return summaries.filter((dino) => {
      const text = `${dino.name} ${dino.scientificName} ${dino.period} ${dino.subPeriod ?? ''} ${dino.diet} ${dino.continent ?? ''} ${dino.taxonomy?.family ?? ''} ${dino.taxonomy?.order ?? ''}`.toLowerCase();
      return queryTokens.every((token) => text.includes(token));
    });
  }, [summaries, queryTokens]);

  return (
    <CommandDialog
      open={isCommandOpen}
      onOpenChange={setIsCommandOpen}
      shouldFilter={false}
      title="WikiDino Command Palette"
      description="Search dinosaur specimens, geological eras, or run quick archive actions."
      className="max-w-xl rounded-2xl border-border/80 bg-card/95 backdrop-blur-xl"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        isLoading={isDebouncing}
        placeholder="Search specimens, scientific names, families, eras..."
      />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>
          {isLoadingSummaries ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading paleontology archive index...</span>
            </div>
          ) : isDebouncing ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Filtering archive...</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              No matching dinosaur specimens or commands found.
            </span>
          )}
        </CommandEmpty>

        {filteredQuickActions.length > 0 && (
          <CommandGroup heading="Quick Actions">
            {filteredQuickActions.map((action) => (
              <CommandItem
                key={action.id}
                value={action.label}
                onSelect={action.onSelect}
              >
                {action.icon}
                <span>{action.label}</span>
                {action.shortcut && (
                  <CommandShortcut>{action.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredSavedSpecimens.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Saved in Field Notebook">
              {filteredSavedSpecimens.map((dino) => (
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

        {filteredSpecimens.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup
              heading={
                queryTokens.length > 0
                  ? `Specimens (${filteredSpecimens.length})`
                  : `Specimens (${summaries.length})`
              }
            >
              {filteredSpecimens.map((dino) => (
                <CommandItem
                  key={dino.id}
                  value={`${dino.name} ${dino.scientificName} ${dino.period} ${dino.diet}`}
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
