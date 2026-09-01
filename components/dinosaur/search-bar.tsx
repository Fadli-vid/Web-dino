'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  onClear,
  placeholder = 'Cari spesimen dinosaurus, periode, atau taksonomi...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onClear();
  }, [onClear]);

  return (
    <div className="relative w-full group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="pl-11 pr-11 h-12 rounded-xl border-border/80 bg-background/80 backdrop-blur-md text-sm sm:text-base focus-visible:ring-primary/40 focus-visible:border-primary/50 shadow-sm transition-all hover:border-primary/40"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted p-1 rounded-md transition-colors"
          aria-label="Hapus pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
