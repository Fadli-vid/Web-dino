'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
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
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <Input
        placeholder="Search dinosaurs by name, diet, or period..."
        value={query}
        onChange={handleChange}
        className="pl-14 pr-14 h-16 rounded-full border-muted-foreground/20 bg-background/80 backdrop-blur-md text-lg focus-visible:ring-primary/50 shadow-sm transition-all hover:border-primary/30"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted p-1.5 rounded-full transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
