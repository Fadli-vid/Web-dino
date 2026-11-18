'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BrainCircuit,
  Database,
  HelpCircle,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Dinosaur } from '@/lib/types';
import {
  AiLanguage,
  SpecimenAnalysisResponse,
  SpecimenAnalyzeMode,
  SpecimenPresetMode,
} from '@/lib/ai/prompt-builder';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AskPaleoPanelProps {
  dinosaur: Dinosaur;
}

interface AnalyzeApiResult {
  data: SpecimenAnalysisResponse;
  cached: boolean;
  modelUsed?: string;
}

const PRESET_OPTIONS: Array<{
  mode: SpecimenPresetMode;
  labelEn: string;
  labelId: string;
  descEn: string;
}> = [
  {
    mode: 'preset_myth',
    labelEn: 'Myth vs. Real Science',
    labelId: 'Mitos vs. Fakta Fosil',
    descEn: 'Compare pop-culture portrayals against actual fossil evidence',
  },
  {
    mode: 'preset_biomechanics',
    labelEn: 'Biomechanics & Survival',
    labelId: 'Biomekanika & Bertahan Hidup',
    descEn: 'Explore anatomy, feeding mechanics, and locomotor adaptations',
  },
  {
    mode: 'preset_mystery',
    labelEn: 'Fossil Mysteries',
    labelId: 'Misteri & Riset Terbaru',
    descEn: 'Discover open paleontological debates and fossil limits',
  },
];

const CUSTOM_COOLDOWN_SEC = 10;

export function AskPaleoPanel({ dinosaur }: AskPaleoPanelProps) {
  const [lang, setLang] = useState<AiLanguage>('en');
  const [activeMode, setActiveMode] = useState<SpecimenAnalyzeMode | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeApiResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = setTimeout(() => setCooldownSec((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSec]);

  // Reset visible output when switching dinosaur
  useEffect(() => {
    setResult(null);
    setErrorMsg(null);
    setActiveMode(null);
  }, [dinosaur.id]);

  const runAnalysis = async (mode: SpecimenAnalyzeMode, questionText?: string) => {
    if (isLoading) return;
    const trimmedQ = (questionText || '').trim();
    if (mode === 'custom' && trimmedQ.length < 4) {
      setErrorMsg(
        lang === 'id'
          ? 'Masukkan pertanyaan minimal 4 karakter.'
          : 'Please enter a question of at least 4 characters.'
      );
      return;
    }

    setActiveMode(mode);
    setErrorMsg(null);

    const storageKey = `wikidino:ai:spec:${dinosaur.id}:${mode}:${trimmedQ.toLowerCase()}:${lang}`;
    if (typeof window !== 'undefined') {
      try {
        const cachedRaw = window.sessionStorage.getItem(storageKey);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as AnalyzeApiResult;
          setResult({ ...parsed, cached: true });
          return;
        }
      } catch {
        // Ignore sessionStorage parse errors
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/analyze-specimen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dinosaurId: dinosaur.id,
          mode,
          customQuestion: mode === 'custom' ? trimmedQ : undefined,
          lang,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setErrorMsg(
          payload?.message ||
            'AI service is temporarily unavailable. Please try again shortly.'
        );
        return;
      }

      const finalResult: AnalyzeApiResult = {
        data: payload.data,
        cached: Boolean(payload.cached),
        modelUsed: payload.modelUsed,
      };
      setResult(finalResult);

      if (mode === 'custom' && !payload.cached) {
        setCooldownSec(CUSTOM_COOLDOWN_SEC);
      }

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(storageKey, JSON.stringify(finalResult));
        } catch {
          // Ignore storage quota limits
        }
      }
    } catch {
      setErrorMsg(
        lang === 'id'
          ? 'Gagal terhubung ke server AI. Periksa koneksi Anda.'
          : 'Unable to reach AI analysis endpoint. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 border border-border/80 bg-card/75 backdrop-blur-md rounded-2xl shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/15 border border-primary/30 text-primary shrink-0">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-[var(--font-display)] text-lg sm:text-xl font-bold text-foreground">
                Ask Dr. Paleo
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/25 text-[10px] font-mono text-primary">
                <ShieldCheck className="w-3 h-3" />
                Quota-Saver Cache
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === 'id'
                ? 'Asisten paleontologi AI berbasis data fosil terverifikasi dengan cache global TiDB.'
                : 'AI paleontology insights grounded in verified specimen data with shared TiDB caching.'}
            </p>
          </div>
        </div>

        {/* Language Toggle (EN / ID) */}
        <div className="inline-flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
              lang === 'en'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('id')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
              lang === 'id'
                ? 'bg-background text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ID
          </button>
        </div>
      </div>

      {/* 3 Preset Deep-Dive Chips (Globally Cached in TiDB) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PRESET_OPTIONS.map((opt) => {
          const isActive = activeMode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              disabled={isLoading}
              onClick={() => void runAnalysis(opt.mode)}
              className={`text-left rounded-xl border p-3 transition-all flex flex-col gap-1 disabled:opacity-60 ${
                isActive
                  ? 'border-primary/60 bg-primary/10 shadow-xs'
                  : 'border-border/70 bg-muted/25 hover:bg-muted/50 hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{lang === 'id' ? opt.labelId : opt.labelEn}</span>
              </div>
              <span className="text-[11px] text-muted-foreground leading-snug">
                {opt.descEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Single-Turn Focused Custom Question */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (cooldownSec > 0 || isLoading) return;
          void runAnalysis('custom', customQuestion);
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            maxLength={150}
            placeholder={
              lang === 'id'
                ? `Tanya singkat tentang ${dinosaur.name} (maks 150 karakter)...`
                : `Ask a focused question about ${dinosaur.name} (max 150 chars)...`
            }
            className="h-9 pl-8 pr-14 rounded-xl text-xs bg-background/80 border-border/80"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground">
            {customQuestion.length}/150
          </span>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={isLoading || cooldownSec > 0 || customQuestion.trim().length < 4}
          className="h-9 rounded-xl text-xs bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shrink-0"
        >
          {isLoading && activeMode === 'custom' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{cooldownSec > 0 ? `Wait ${cooldownSec}s` : 'Ask AI'}</span>
        </Button>
      </form>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="rounded-xl border border-border/70 bg-muted/25 p-4 flex items-center gap-3 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          <span>
            {lang === 'id'
              ? 'Menganalisis catatan paleontologi & memeriksa cache TiDB...'
              : 'Analyzing fossil archive & checking TiDB cache...'}
          </span>
        </div>
      )}

      {/* Graceful Error / Setup Notice */}
      {errorMsg && !isLoading && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Structured AI Output Card */}
      {result && !isLoading && (
        <div className="rounded-xl border border-primary/30 bg-muted/25 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
            <h3 className="font-[var(--font-display)] font-bold text-base text-foreground">
              {result.data.title}
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background/80 border border-border/70 text-[10px] font-mono text-muted-foreground self-start">
              <Database className="w-3 h-3 text-primary" />
              {result.cached
                ? `Cached · 0 Gemini tokens${result.modelUsed ? ` (${result.modelUsed})` : ''}`
                : `Live · ${result.modelUsed || 'Gemini Flash'}`}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            {result.data.summary}
          </p>

          {result.data.keyFacts?.length > 0 && (
            <ul className="space-y-1.5 pt-1">
              {result.data.keyFacts.map((fact, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          )}

          {result.data.confidenceNote && (
            <p className="text-[11px] font-mono text-muted-foreground/90 pt-2 border-t border-border/50">
              Scientific note: {result.data.confidenceNote}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
