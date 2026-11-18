import { Dinosaur, DinosaurSummary } from '@/lib/types';
import { getFallbackMyaRange } from '@/hooks/use-dinosaur-filters';

export type RecommendationBadge =
  | 'Predator–Prey Coeval'
  | 'Coeval Neighbor'
  | 'Close Relative'
  | 'Era Contemporary'
  | 'Taxonomic Kin';

export interface RecommendedSpecimen {
  specimen: DinosaurSummary;
  score: number;
  badge: RecommendationBadge;
  reason: string;
  myaOverlap: boolean;
  sameFamily: boolean;
}

const LOCATION_STOPWORDS = new Set([
  'usa',
  'canada',
  'province',
  'north',
  'south',
  'east',
  'west',
  'america',
  'europe',
  'africa',
  'asia',
]);

function extractLocationTokens(locationFound?: string): Set<string> {
  if (!locationFound) return new Set();
  const rawTokens = locationFound
    .toLowerCase()
    .split(/[,;/]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const tokens = new Set<string>();
  for (const token of rawTokens) {
    if (!LOCATION_STOPWORDS.has(token) && token.length >= 3) {
      tokens.add(token);
    }
  }
  return tokens;
}

function extractContinents(continent?: string): Set<string> {
  if (!continent) return new Set();
  return new Set(
    continent
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean)
  );
}

function getMyaBounds(item: Pick<Dinosaur | DinosaurSummary, 'period' | 'myaStart' | 'myaEnd'>): [number, number] {
  const [fallbackEnd, fallbackStart] = getFallbackMyaRange(item.period);
  const start = item.myaStart ?? fallbackStart;
  const end = item.myaEnd ?? fallbackEnd;
  return [Math.min(end, start), Math.max(end, start)];
}

/**
 * Deterministic multi-factor smart recommendation engine computing temporal overlap,
 * geographic co-existence, taxonomic kinship, and predator–prey ecological pairings.
 */
export function getSmartRecommendations(
  current: Dinosaur,
  candidates: DinosaurSummary[],
  limit = 4
): RecommendedSpecimen[] {
  if (!candidates || candidates.length === 0) return [];

  const [currEnd, currStart] = getMyaBounds(current);
  const currLocations = extractLocationTokens(current.locationFound);
  const currContinents = extractContinents(current.continent);
  const currFamily = current.taxonomy?.family?.trim().toLowerCase() || '';
  const currOrder = current.taxonomy?.order?.trim().toLowerCase() || '';

  const scored: RecommendedSpecimen[] = [];

  for (const candidate of candidates) {
    if (candidate.id === current.id) continue;

    let score = 0;

    // 1. Temporal overlap
    const [candEnd, candStart] = getMyaBounds(candidate);
    const overlapStart = Math.min(currStart, candStart);
    const overlapEnd = Math.max(currEnd, candEnd);
    const myaOverlap = overlapStart >= overlapEnd;

    if (myaOverlap) {
      const overlapDuration = Math.max(0.5, overlapStart - overlapEnd);
      const midpointDiff = Math.abs((currStart + currEnd) / 2 - (candStart + candEnd) / 2);
      const proximityBonus = Math.max(0, 10 - Math.min(10, midpointDiff));
      score += 35 + Math.min(8, overlapDuration) + proximityBonus;
    } else if (candidate.period === current.period) {
      score += 10;
    }

    // 2. Geographic co-existence
    const candLocations = extractLocationTokens(candidate.locationFound);
    const sharedLocations = [...currLocations].filter((loc) => candLocations.has(loc));
    const candContinents = extractContinents(candidate.continent);
    const sharedContinents = [...currContinents].filter((c) => candContinents.has(c));

    let geoTier: 'exact' | 'continent' | 'none' = 'none';
    if (sharedLocations.length > 0) {
      score += 28;
      geoTier = 'exact';
    } else if (sharedContinents.length > 0) {
      score += 16;
      geoTier = 'continent';
    }

    // 3. Taxonomic kinship
    const candFamily = candidate.taxonomy?.family?.trim().toLowerCase() || '';
    const candOrder = candidate.taxonomy?.order?.trim().toLowerCase() || '';
    const sameFamily = Boolean(currFamily && candFamily && currFamily === candFamily);
    const sameOrder = Boolean(currOrder && candOrder && currOrder === candOrder);

    if (sameFamily) {
      score += 30;
    } else if (sameOrder) {
      score += 10;
    }

    // 4. Ecological interaction bonus (coeval predator & herbivore in same area)
    const isContrastingDiet =
      (current.diet === 'Carnivore' && (candidate.diet === 'Herbivore' || candidate.diet === 'Omnivore')) ||
      ((current.diet === 'Herbivore' || current.diet === 'Omnivore') && candidate.diet === 'Carnivore');

    const isEcosystemCoeval = myaOverlap && geoTier !== 'none';
    if (isEcosystemCoeval && isContrastingDiet) {
      score += 14;
    }

    // Determine primary scientific badge and explanation
    const eraLabel = candidate.subPeriod || candidate.period;
    const myaText = `${candStart}–${candEnd} Ma`;
    const geoLabel =
      sharedLocations.length > 0
        ? sharedLocations[0].replace(/\b\w/g, (ch) => ch.toUpperCase())
        : candidate.continent || candidate.locationFound;

    let badge: RecommendationBadge;
    let reason: string;

    if (isEcosystemCoeval && isContrastingDiet) {
      badge = 'Predator–Prey Coeval';
      reason = `Coexisted in ${geoLabel} during ${eraLabel} (${myaText}) in contrasting trophic roles.`;
    } else if (isEcosystemCoeval) {
      badge = 'Coeval Neighbor';
      reason = `Shared ${eraLabel} (${myaText}) habitats across ${geoLabel}.`;
    } else if (sameFamily) {
      badge = 'Close Relative';
      reason = `Taxonomic relative within family ${candidate.taxonomy.family}.`;
    } else if (myaOverlap) {
      badge = 'Era Contemporary';
      reason = `Lived concurrently during ${eraLabel} (${myaText}).`;
    } else {
      badge = 'Taxonomic Kin';
      reason = sameOrder
        ? `Related ${candidate.taxonomy.order} lineage from ${eraLabel}.`
        : `${eraLabel} specimen (${myaText}) from ${candidate.continent || 'archive'}.`;
    }

    scored.push({
      specimen: candidate,
      score,
      badge,
      reason,
      myaOverlap,
      sameFamily,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.specimen.name.localeCompare(b.specimen.name));

  // Ensure educational balance: pick top results while preserving at least one Close Relative if strongly relevant
  const top = scored.slice(0, limit);
  const hasRelativeInTop = top.some((item) => item.sameFamily);
  if (!hasRelativeInTop) {
    const bestRelative = scored.find((item) => item.sameFamily);
    if (bestRelative && top.length === limit) {
      return [...top.slice(0, limit - 1), bestRelative];
    }
  }

  return top;
}
