'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DinosaurSummary } from '@/lib/types';
import { getDinosaursSummary } from '@/lib/dinosaurs-data';

const STORAGE_KEY = 'wikidino:notebook:v1';

interface FieldNotebookContextValue {
  savedIds: string[];
  isHydrated: boolean;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  removeSave: (id: string) => void;
  clearNotebook: () => void;
  isCommandOpen: boolean;
  setIsCommandOpen: (open: boolean) => void;
  isNotebookOpen: boolean;
  setIsNotebookOpen: (open: boolean) => void;
  summaries: DinosaurSummary[];
  isLoadingSummaries: boolean;
  ensureSummariesLoaded: () => Promise<DinosaurSummary[]>;
  seedSummaries: (items: DinosaurSummary[]) => void;
}

const FieldNotebookContext = createContext<FieldNotebookContextValue | null>(null);

function readSavedIdsFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.filter((item): item is string => typeof item === 'string')));
  } catch {
    return [];
  }
}

export function FieldNotebookProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [summaries, setSummaries] = useState<DinosaurSummary[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);

  const inFlightSummariesRef = useRef<Promise<DinosaurSummary[]> | null>(null);

  useEffect(() => {
    setSavedIds(readSavedIdsFromStorage());
    setIsHydrated(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setSavedIds(readSavedIdsFromStorage());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistIds = useCallback((nextIds: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    } catch {
      // Ignore storage quota / private mode failures gracefully
    }
  }, []);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds]
  );

  const toggleSave = useCallback(
    (id: string) => {
      setSavedIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
        persistIds(next);
        return next;
      });
    },
    [persistIds]
  );

  const removeSave = useCallback(
    (id: string) => {
      setSavedIds((prev) => {
        const next = prev.filter((item) => item !== id);
        persistIds(next);
        return next;
      });
    },
    [persistIds]
  );

  const clearNotebook = useCallback(() => {
    setSavedIds([]);
    persistIds([]);
  }, [persistIds]);

  const seedSummaries = useCallback((items: DinosaurSummary[]) => {
    if (!items || items.length === 0) return;
    setSummaries((prev) => (prev.length >= items.length ? prev : items));
  }, []);

  const ensureSummariesLoaded = useCallback(async (): Promise<DinosaurSummary[]> => {
    if (summaries.length > 0) return summaries;
    if (inFlightSummariesRef.current) return inFlightSummariesRef.current;

    setIsLoadingSummaries(true);
    const promise = getDinosaursSummary()
      .then((data) => {
        if (data.length > 0) {
          setSummaries(data);
        }
        return data;
      })
      .finally(() => {
        setIsLoadingSummaries(false);
        inFlightSummariesRef.current = null;
      });

    inFlightSummariesRef.current = promise;
    return promise;
  }, [summaries]);

  return (
    <FieldNotebookContext.Provider
      value={{
        savedIds,
        isHydrated,
        isSaved,
        toggleSave,
        removeSave,
        clearNotebook,
        isCommandOpen,
        setIsCommandOpen,
        isNotebookOpen,
        setIsNotebookOpen,
        summaries,
        isLoadingSummaries,
        ensureSummariesLoaded,
        seedSummaries,
      }}
    >
      {children}
    </FieldNotebookContext.Provider>
  );
}

export function useFieldNotebook() {
  const ctx = useContext(FieldNotebookContext);
  if (!ctx) {
    throw new Error('useFieldNotebook must be used within a FieldNotebookProvider');
  }
  return ctx;
}
