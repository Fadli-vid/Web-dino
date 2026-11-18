import { cache } from 'react';
import { Dinosaur, DinosaurSummary, AiAnalysisCacheRecord } from '@/lib/types';
import { dbPool } from './tidb';
import { RowDataPacket } from 'mysql2';

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function toNullableNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function mapRowToDinosaur(dino: RowDataPacket): Dinosaur {
  const taxonomy = parseJsonField<Dinosaur['taxonomy']>(dino.taxonomy, {
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    order: '',
    family: '',
    genus: '',
    species: '',
  });
  const characteristics = parseJsonField<string[]>(dino.characteristics, []);

  return {
    id: dino.id,
    name: dino.name,
    scientificName: dino.scientific_name,
    period: dino.period,
    subPeriod: dino.sub_period || undefined,
    myaStart: toNullableNumber(dino.mya_start),
    myaEnd: toNullableNumber(dino.mya_end),
    length: Number(dino.length) || 0,
    weight: Number(dino.weight) || 0,
    diet: dino.diet,
    locomotion: dino.locomotion || undefined,
    continent: dino.continent || undefined,
    description: dino.description || '',
    image: dino.image || 'https://images.unsplash.com/photo-1618930157654-43a39d50c41c?w=500&h=500&fit=crop',
    imageAlt: dino.image_alt || (dino.name + ' illustration'),
    taxonomy,
    characteristics,
    fossils: dino.fossils || '',
    discovered: dino.discovered || '',
    locationFound: dino.location_found || '',
    sizeComparisonUrl: dino.size_comparison_url || undefined,
    habitatMapUrl: dino.habitat_map_url || undefined,
    evolutionaryTreeUrl: dino.evolutionary_tree_url || undefined,
  };
}

function mapRowToSummary(dino: RowDataPacket): DinosaurSummary {
  const taxonomy = parseJsonField<Partial<Dinosaur['taxonomy']>>(dino.taxonomy, {});

  return {
    id: dino.id,
    name: dino.name,
    scientificName: dino.scientific_name,
    period: dino.period,
    subPeriod: dino.sub_period || undefined,
    myaStart: toNullableNumber(dino.mya_start),
    myaEnd: toNullableNumber(dino.mya_end),
    length: Number(dino.length) || 0,
    weight: Number(dino.weight) || 0,
    diet: dino.diet,
    locomotion: dino.locomotion || undefined,
    continent: dino.continent || undefined,
    locationFound: dino.location_found || '',
    image: dino.image || 'https://images.unsplash.com/photo-1618930157654-43a39d50c41c?w=500&h=500&fit=crop',
    taxonomy: {
      order: taxonomy.order || '',
      family: taxonomy.family || '',
      genus: taxonomy.genus || '',
    },
  };
}

/**
 * Deduplicated server-side query for a single dinosaur specimen by ID.
 * Wrapped with React cache() to prevent duplicate round-trips to TiDB Cloud
 * between generateMetadata and Page components.
 */
export const getDinosaurByIdServer = cache(async (id: string): Promise<Dinosaur | null> => {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      'SELECT * FROM dinosaurs WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows || rows.length === 0) return null;
    return mapRowToDinosaur(rows[0]);
  } catch (error) {
    console.error('Error fetching dinosaur by ID from TiDB database:', error);
    return null;
  }
});

/**
 * Deduplicated server-side query for the complete dinosaur catalog.
 */
export const getDinosaursServer = cache(async (): Promise<Dinosaur[]> => {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>('SELECT * FROM dinosaurs ORDER BY name ASC');
    return rows.map(mapRowToDinosaur);
  } catch (error) {
    console.error('Error fetching dinosaurs from TiDB database:', error);
    return [];
  }
});

/**
 * Lightweight projection query for Command Palette, Smart Recommendation, and Analytics.
 */
export const getDinosaursSummaryServer = cache(async (): Promise<DinosaurSummary[]> => {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT id, name, scientific_name, period, sub_period, mya_start, mya_end,
              length, weight, diet, locomotion, continent, location_found, image, taxonomy
       FROM dinosaurs
       ORDER BY name ASC`
    );
    return rows.map(mapRowToSummary);
  } catch (error) {
    console.error('Error fetching dinosaur summaries from TiDB database:', error);
    return [];
  }
});

/**
 * Retrieves a cached AI analysis payload from TiDB (`ai_analysis_cache`) to minimize LLM quota usage.
 */
export async function getAiAnalysisCache<T = unknown>(
  cacheKey: string
): Promise<AiAnalysisCacheRecord<T> | null> {
  try {
    const [rows] = await dbPool.query<RowDataPacket[]>(
      `SELECT cache_key, feature_type, species_ids, prompt_tag, response_data, model_used, created_at
       FROM ai_analysis_cache
       WHERE cache_key = ?
       LIMIT 1`,
      [cacheKey]
    );
    if (!rows || rows.length === 0) return null;
    const row = rows[0];
    return {
      cacheKey: row.cache_key,
      featureType: row.feature_type,
      speciesIds: row.species_ids,
      promptTag: row.prompt_tag || undefined,
      responseData: parseJsonField<T>(row.response_data, {} as T),
      modelUsed: row.model_used || undefined,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error reading AI analysis cache from TiDB:', error);
    return null;
  }
}

/**
 * Persists an AI analysis payload into TiDB (`ai_analysis_cache`).
 */
export async function saveAiAnalysisCache<T = unknown>(params: {
  cacheKey: string;
  featureType: string;
  speciesIds: string;
  promptTag?: string;
  responseData: T;
  modelUsed?: string;
}): Promise<void> {
  try {
    await dbPool.execute(
      `INSERT INTO ai_analysis_cache (cache_key, feature_type, species_ids, prompt_tag, response_data, model_used)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         response_data = VALUES(response_data),
         model_used = VALUES(model_used),
         created_at = CURRENT_TIMESTAMP`,
      [
        params.cacheKey,
        params.featureType,
        params.speciesIds,
        params.promptTag ?? null,
        JSON.stringify(params.responseData),
        params.modelUsed ?? null,
      ]
    );
  } catch (error) {
    console.error('Error saving AI analysis cache to TiDB:', error);
  }
}
