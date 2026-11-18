import { createHash } from 'node:crypto';
import { Dinosaur, DinosaurSummary } from '@/lib/types';

export type AiLanguage = 'en' | 'id';
export type SpecimenPresetMode = 'preset_myth' | 'preset_biomechanics' | 'preset_mystery';
export type SpecimenAnalyzeMode = SpecimenPresetMode | 'custom';

export interface SpecimenAnalysisResponse {
  title: string;
  summary: string;
  keyFacts: string[];
  confidenceNote: string;
}

export interface EncounterCompareResponse {
  coexistedInHistory: boolean;
  temporalOverlap: string;
  biomechanicsComparison: string;
  ecologicalVerdict: string;
}

export function buildCacheKey(parts: string[]): string {
  return createHash('sha256').update(parts.join('::')).digest('hex').slice(0, 48);
}

function summarizeForPrompt(dino: Dinosaur | DinosaurSummary): string {
  const era = dino.subPeriod ? `${dino.subPeriod} (${dino.period})` : dino.period;
  const mya =
    dino.myaStart !== undefined && dino.myaEnd !== undefined
      ? `${dino.myaStart}-${dino.myaEnd} Ma`
      : 'Mesozoic';
  const weightTons = dino.weight >= 1000 ? `${(dino.weight / 1000).toFixed(1)}t` : `${dino.weight}kg`;
  const traits =
    'characteristics' in dino && Array.isArray(dino.characteristics)
      ? dino.characteristics.slice(0, 4).join(', ')
      : '';

  return [
    `${dino.name} (${dino.scientificName})`,
    `Era: ${era}, ${mya}`,
    `Diet: ${dino.diet}`,
    `Locomotion: ${dino.locomotion || 'unknown'}`,
    `Size: ${dino.length}m, ${weightTons}`,
    `Family: ${dino.taxonomy?.family || 'Dinosauria'}`,
    `Provenance: ${dino.locationFound || dino.continent || 'Archive'}`,
    traits ? `Traits: ${traits}` : '',
  ]
    .filter(Boolean)
    .join(' | ');
}

export function buildSpecimenAnalyzePrompt(params: {
  dinosaur: Dinosaur;
  mode: SpecimenAnalyzeMode;
  customQuestion?: string;
  lang: AiLanguage;
}): { systemInstruction: string; userPrompt: string; cacheKey: string; promptTag: string } {
  const { dinosaur, mode, customQuestion, lang } = params;
  const normalizedQ = (customQuestion || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const langLabel = lang === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English';

  const topicMap: Record<SpecimenPresetMode, string> = {
    preset_myth:
      'Contrast popular media myths or outdated ideas about this dinosaur against verified modern fossil evidence.',
    preset_biomechanics:
      'Explain its key biomechanical adaptations (locomotion, skull/teeth or defense, hunting/feeding strategy).',
    preset_mystery:
      'Highlight ongoing scientific debates, fossil completeness limitations, and what recent paleontology research investigates about it.',
  };

  const taskText =
    mode === 'custom'
      ? `Answer this focused student question accurately: "${customQuestion?.trim()}"`
      : topicMap[mode];

  const promptTag =
    mode === 'custom'
      ? `custom:${buildCacheKey([normalizedQ]).slice(0, 12)}:${lang}`
      : `${mode}:${lang}`;

  const cacheKey = buildCacheKey([
    'analyze_v1',
    dinosaur.id,
    mode,
    mode === 'custom' ? normalizedQ : '',
    lang,
  ]);

  const systemInstruction = [
    'You are Dr. Paleo, an expert paleontologist educator.',
    `Respond strictly in ${langLabel} using concise, verified science grounded in peer-reviewed paleontology.`,
    'Do not invent unverified fossil records. Keep answers compact and educational.',
  ].join(' ');

  const userPrompt = [
    `Specimen Digest: ${summarizeForPrompt(dinosaur)}`,
    `Fossils: ${dinosaur.fossils || 'Partial remains'} (Discovered ${dinosaur.discovered || 'unknown'})`,
    `Task: ${taskText}`,
  ].join('\n');

  return { systemInstruction, userPrompt, cacheKey, promptTag };
}

export function buildEncounterComparePrompt(params: {
  dinosaurs: Array<Dinosaur | DinosaurSummary>;
  lang: AiLanguage;
}): {
  systemInstruction: string;
  userPrompt: string;
  cacheKey: string;
  canonicalIds: string;
} {
  const sorted = [...params.dinosaurs].sort((a, b) => a.id.localeCompare(b.id));
  const canonicalIds = sorted.map((d) => d.id).join(',');
  const langLabel = params.lang === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English';

  const cacheKey = buildCacheKey(['compare_v1', canonicalIds, params.lang]);

  const systemInstruction = [
    'You are an evolutionary paleobiologist comparing dinosaur specimens.',
    `Respond strictly in ${langLabel}.`,
    'First verify if they truly overlapped in geological time (Ma) and geography; never pretend non-coeval species lived together.',
    'Keep every field concise and scientifically factual.',
  ].join(' ');

  const userPrompt = [
    'Compare these specimens:',
    ...sorted.map((d, i) => `${i + 1}. ${summarizeForPrompt(d)}`),
  ].join('\n');

  return { systemInstruction, userPrompt, cacheKey, canonicalIds };
}
