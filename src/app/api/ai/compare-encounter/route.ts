import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAiAnalysisCache,
  getDinosaursSummaryServer,
  saveAiAnalysisCache,
} from '@/lib/db/dinosaurs-server';
import {
  buildEncounterComparePrompt,
  EncounterCompareResponse,
} from '@/lib/ai/prompt-builder';
import {
  AiServiceError,
  GeminiJsonSchema,
  generateStructuredJsonWithFallback,
} from '@/lib/ai/gemini-client';
import { checkAiRateLimit, extractClientIp } from '@/lib/ai/rate-limit';

const requestSchema = z.object({
  speciesIds: z.array(z.string().min(1).max(120)).min(2).max(3),
  lang: z.enum(['en', 'id']).default('en'),
});

const encounterCompareJsonSchema: GeminiJsonSchema = {
  type: 'OBJECT',
  properties: {
    coexistedInHistory: { type: 'BOOLEAN' },
    temporalOverlap: { type: 'STRING' },
    biomechanicsComparison: { type: 'STRING' },
    ecologicalVerdict: { type: 'STRING' },
  },
  required: [
    'coexistedInHistory',
    'temporalOverlap',
    'biomechanicsComparison',
    'ecologicalVerdict',
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          errorCode: 'BAD_REQUEST',
          message: 'Select 2 to 3 valid dinosaur species to compare.',
        },
        { status: 400 }
      );
    }

    const uniqueIds = Array.from(new Set(parsed.data.speciesIds));
    if (uniqueIds.length < 2) {
      return NextResponse.json(
        {
          errorCode: 'BAD_REQUEST',
          message: 'Please select at least 2 distinct species to compare.',
        },
        { status: 400 }
      );
    }

    const summaries = await getDinosaursSummaryServer();
    const byId = new Map(summaries.map((item) => [item.id, item]));
    const selectedDinosaurs = uniqueIds
      .map((id) => byId.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (selectedDinosaurs.length < 2) {
      return NextResponse.json(
        { errorCode: 'NOT_FOUND', message: 'One or more specimen records were not found.' },
        { status: 404 }
      );
    }

    const { systemInstruction, userPrompt, cacheKey, canonicalIds } =
      buildEncounterComparePrompt({
        dinosaurs: selectedDinosaurs,
        lang: parsed.data.lang,
      });

    // 1. Check shared TiDB cache first (0 Gemini tokens, bypasses rate limiter)
    const cached = await getAiAnalysisCache<EncounterCompareResponse>(cacheKey);
    if (cached?.responseData?.temporalOverlap) {
      return NextResponse.json({
        data: cached.responseData,
        cached: true,
        modelUsed: cached.modelUsed,
      });
    }

    // 2. Enforce sliding-window rate limit only for live LLM calls
    const clientIp = extractClientIp(request.headers);
    const rate = checkAiRateLimit(clientIp);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          errorCode: 'RATE_LIMITED',
          message: `Too many live AI requests. Please wait ${rate.retryAfterSeconds}s and retry.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) },
        }
      );
    }

    // 3. Call Gemini with automatic backup model fallback
    const result = await generateStructuredJsonWithFallback<EncounterCompareResponse>({
      systemInstruction,
      userPrompt,
      responseSchema: encounterCompareJsonSchema,
      maxOutputTokens: 450,
      temperature: 0.35,
    });

    // 4. Persist canonical comparison into TiDB cache
    await saveAiAnalysisCache({
      cacheKey,
      featureType: 'compare_encounter',
      speciesIds: canonicalIds,
      promptTag: `compare:${parsed.data.lang}`,
      responseData: result.data,
      modelUsed: result.modelUsed,
    });

    return NextResponse.json({
      data: result.data,
      cached: false,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json(
        {
          errorCode: error.code,
          message: error.message,
          triedModels: error.triedModels,
        },
        { status: error.status }
      );
    }

    console.error('Unexpected error in /api/ai/compare-encounter:', error);
    return NextResponse.json(
      { errorCode: 'INTERNAL_ERROR', message: 'Failed to compare specimens with AI.' },
      { status: 500 }
    );
  }
}
