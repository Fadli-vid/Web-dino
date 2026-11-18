import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAiAnalysisCache,
  getDinosaurByIdServer,
  saveAiAnalysisCache,
} from '@/lib/dinosaurs-server';
import {
  buildSpecimenAnalyzePrompt,
  SpecimenAnalysisResponse,
} from '@/lib/ai/prompt-builder';
import {
  AiServiceError,
  GeminiJsonSchema,
  generateStructuredJsonWithFallback,
} from '@/lib/ai/gemini-client';
import { checkAiRateLimit, extractClientIp } from '@/lib/ai/rate-limit';

const requestSchema = z.object({
  dinosaurId: z.string().min(1).max(120),
  mode: z.enum(['preset_myth', 'preset_biomechanics', 'preset_mystery', 'custom']),
  customQuestion: z.string().trim().max(150).optional(),
  lang: z.enum(['en', 'id']).default('en'),
});

const specimenAnalysisJsonSchema: GeminiJsonSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    summary: { type: 'STRING' },
    keyFacts: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    confidenceNote: { type: 'STRING' },
  },
  required: ['title', 'summary', 'keyFacts', 'confidenceNote'],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errorCode: 'BAD_REQUEST', message: 'Invalid specimen analysis request.' },
        { status: 400 }
      );
    }

    const { dinosaurId, mode, customQuestion, lang } = parsed.data;
    if (mode === 'custom' && (!customQuestion || customQuestion.length < 4)) {
      return NextResponse.json(
        {
          errorCode: 'BAD_REQUEST',
          message: 'Please provide a question of at least 4 characters.',
        },
        { status: 400 }
      );
    }

    const dinosaur = await getDinosaurByIdServer(dinosaurId);
    if (!dinosaur) {
      return NextResponse.json(
        { errorCode: 'NOT_FOUND', message: 'Specimen record not found.' },
        { status: 404 }
      );
    }

    const { systemInstruction, userPrompt, cacheKey, promptTag } =
      buildSpecimenAnalyzePrompt({
        dinosaur,
        mode,
        customQuestion,
        lang,
      });

    // 1. Check shared TiDB cache first (0 Gemini tokens, bypasses rate limiter)
    const cached = await getAiAnalysisCache<SpecimenAnalysisResponse>(cacheKey);
    if (cached?.responseData?.summary) {
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
          message: `Too many live AI requests. Please wait ${rate.retryAfterSeconds}s or explore cached presets.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) },
        }
      );
    }

    // 3. Call Gemini with automatic backup model fallback
    const result = await generateStructuredJsonWithFallback<SpecimenAnalysisResponse>({
      systemInstruction,
      userPrompt,
      responseSchema: specimenAnalysisJsonSchema,
      maxOutputTokens: 420,
      temperature: 0.35,
    });

    // 4. Persist valid response into TiDB cache asynchronously/safely
    await saveAiAnalysisCache({
      cacheKey,
      featureType: 'ask_paleo',
      speciesIds: dinosaur.id,
      promptTag,
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

    console.error('Unexpected error in /api/ai/analyze-specimen:', error);
    return NextResponse.json(
      { errorCode: 'INTERNAL_ERROR', message: 'Failed to analyze specimen.' },
      { status: 500 }
    );
  }
}
