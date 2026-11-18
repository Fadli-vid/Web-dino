'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { DinosaurSummary } from '@/lib/types';
import { getDinosaursSummary } from '@/lib/dinosaurs-data';

const STORAGE_KEY = 'wikidino:notebook:v1';
const NOTEBOOK_EVENT = 'wikidino:notebook-change';
const EMPTY_IDS: string[] = [];

let cachedRawStorage: string | null = null;
let cachedParsedIds: string[] = EMPTY_IDS;

function getSavedIdsSnapshot(): string[] {
  if (typeof window === 'undefined') return EMPTY_IDS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRawStorage) return cachedParsedIds;
    cachedRawStorage = raw;
    if (!raw) {
      cachedParsedIds = EMPTY_IDS;
      return cachedParsedIds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedParsedIds = EMPTY_IDS;
      return cachedParsedIds;
    }
    cachedParsedIds = Array.from(
      new Set(parsed.filter((item): item is string => typeof item === 'string'))
    );
    return cachedParsedIds;
  } catch {
    return EMPTY_IDS;
  }
}

function getServerSavedIdsSnapshot(): string[] {
  return EMPTY_IDS;
}

function subscribeNotebookStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      callback();
    }
  };
  const handleLocalChange = () => callback();
  window.addEventListener('storage', handleStorage);
  window.addEventListener(NOTEBOOK_EVENT, handleLocalChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(NOTEBOOK_EVENT, handleLocalChange);
  };
}

function subscribeHydration(): () => void {
  return () => {};
}

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

export function FieldNotebookProvider({ children }: { children: React.ReactNode }) {
  const savedIds = useSyncExternalStore(
    subscribeNotebookStore,
    getSavedIdsSnapshot,
    getServerSavedIdsSnapshot
  );
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  );
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [summaries, setSummaries] = useState<DinosaurSummary[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);

  const inFlightSummariesRef = useRef<Promise<DinosaurSummary[]> | null>(null);

  const persistIds = useCallback((nextIds: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(nextIds);
      cachedRawStorage = serialized;
      cachedParsedIds = nextIds;
      window.localStorage.setItem(STORAGE_KEY, serialized);
      window.dispatchEvent(new Event(NOTEBOOK_EVENT));
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
      const current = getSavedIdsSnapshot();
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      persistIds(next);
    },
    [persistIds]
  );

  const removeSave = useCallback(
    (id: string) => {
      const current = getSavedIdsSnapshot();
      const next = current.filter((item) => item !== id);
      persistIds(next);
    },
    [persistIds]
  );

  const clearNotebook = useCallback(() => {
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
