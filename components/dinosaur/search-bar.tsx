'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
  initialValue?: string;
}

export function SearchBar({
  onSearch,
  onClear,
  placeholder = 'Search dinosaur specimens, periods, or taxonomy...',
  debounceMs = 1500,
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with initialValue if changed from parent/URL
  useEffect(() => {
    if (initialValue !== undefined) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const triggerSearchImmediate = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setIsDebouncing(false);
      onSearch(value);
    },
    [onSearch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setIsDebouncing(true);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setIsDebouncing(false);
        onSearch(value);
      }, debounceMs);
    },
    [debounceMs, onSearch]
  );

  const handleClear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsDebouncing(false);
    setQuery('');
    onClear();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        triggerSearchImmediate(query);
      }
    },
    [query, triggerSearchImmediate]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="pl-11 pr-14 h-12 rounded-xl border-border/80 bg-background/80 backdrop-blur-md text-sm sm:text-base focus-visible:ring-primary/40 focus-visible:border-primary/50 shadow-sm transition-all hover:border-primary/40"
      />
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {isDebouncing && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-ping mr-1" title="Debouncing..." />
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted p-1 rounded-md transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
