// ============================================================================
// KONFIGURASI MODEL GEMINI (UTAMA & CADANGAN / FALLBACK)
// Anda dapat mengubah nama model langsung di sini, atau menimpanya lewat .env
// menggunakan variabel GEMINI_MODEL dan GEMINI_FALLBACK_MODELS.
// ============================================================================
export const PRIMARY_GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

export const FALLBACK_GEMINI_MODELS: string[] = process.env.GEMINI_FALLBACK_MODELS
  ? process.env.GEMINI_FALLBACK_MODELS.split(',')
      .map((model) => model.trim())
      .filter(Boolean)
  : ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-3.5-flash'];

export function getGeminiModelChain(): string[] {
  return Array.from(new Set([PRIMARY_GEMINI_MODEL, ...FALLBACK_GEMINI_MODELS]));
}

export type AiErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'QUOTA_EXCEEDED'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_RESPONSE';

export class AiServiceError extends Error {
  public readonly code: AiErrorCode;
  public readonly status: number;
  public readonly triedModels: string[];

  constructor(
    code: AiErrorCode,
    message: string,
    status: number,
    triedModels: string[] = []
  ) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
    this.status = status;
    this.triedModels = triedModels;
  }
}

export interface GeminiJsonSchema {
  type: 'OBJECT' | 'ARRAY' | 'STRING' | 'BOOLEAN' | 'NUMBER' | 'INTEGER';
  properties?: Record<string, GeminiJsonSchema>;
  items?: GeminiJsonSchema;
  required?: string[];
  description?: string;
}

interface GeminiGenerateParams {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: GeminiJsonSchema;
  maxOutputTokens?: number;
  temperature?: number;
}

interface GeminiGenerateResult<T> {
  data: T;
  modelUsed: string;
  triedModels: string[];
}

function parseJsonResponse<T>(rawText: string): T {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleaned) as T;
}

function isFallbackEligibleStatus(status: number, message: string): boolean {
  if (status === 429 || status === 404 || status >= 500) {
    return true;
  }
  const lower = message.toLowerCase();
  return (
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('overloaded') ||
    lower.includes('unavailable') ||
    lower.includes('not found')
  );
}

function isAuthOrKeyError(status: number, message: string): boolean {
  if (status === 401 || status === 403) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('permission_denied')
  );
}

/**
 * Invokes Google Gemini Generative Language API with strict JSON schema output
 * and automatic sequential fallback across backup models if the active model
 * is unavailable, rate-limited (429), or overloaded (503).
 */
export async function generateStructuredJsonWithFallback<T>(
  params: GeminiGenerateParams
): Promise<GeminiGenerateResult<T>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiServiceError(
      'MISSING_API_KEY',
      'GEMINI_API_KEY is not configured yet. Please add your Gemini API key in the .env file.',
      503
    );
  }

  const modelChain = getGeminiModelChain();
  const triedModels: string[] = [];
  let lastStatus = 503;
  let lastErrorMessage = 'No Gemini model responded.';

  for (const model of modelChain) {
    triedModels.push(model);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: params.systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: params.userPrompt }],
            },
          ],
          generationConfig: {
            temperature: params.temperature ?? 0.35,
            maxOutputTokens: params.maxOutputTokens ?? 420,
            responseMimeType: 'application/json',
            responseSchema: params.responseSchema,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBodyText = await response.text().catch(() => '');
        let parsedMsg = errorBodyText;
        try {
          const errJson = JSON.parse(errorBodyText);
          parsedMsg = errJson?.error?.message || errorBodyText;
        } catch {
          // Keep raw error string
        }

        lastStatus = response.status;
        lastErrorMessage = parsedMsg || `HTTP ${response.status}`;

        if (isAuthOrKeyError(response.status, lastErrorMessage)) {
          throw new AiServiceError(
            'INVALID_API_KEY',
            'Your GEMINI_API_KEY appears invalid or lacks permission. Please verify it in .env.',
            401,
            triedModels
          );
        }

        if (isFallbackEligibleStatus(response.status, lastErrorMessage)) {
          console.warn(
            `[Gemini Fallback] Model "${model}" unavailable (${response.status}). Trying backup model...`
          );
          continue;
        }

        throw new AiServiceError(
          'SERVICE_UNAVAILABLE',
          `Gemini API error (${response.status}): ${lastErrorMessage}`,
          response.status >= 400 && response.status < 600 ? response.status : 502,
          triedModels
        );
      }

      const payload = await response.json();
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText || typeof rawText !== 'string') {
        lastStatus = 502;
        lastErrorMessage = 'Empty candidate payload returned from Gemini.';
        continue;
      }

      const parsedData = parseJsonResponse<T>(rawText);
      return {
        data: parsedData,
        modelUsed: model,
        triedModels,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof AiServiceError) {
        throw error;
      }

      const errMsg = error instanceof Error ? error.message : String(error);
      lastStatus = 503;
      lastErrorMessage = errMsg;
      console.warn(
        `[Gemini Fallback] Model "${model}" request failed (${errMsg}). Trying next backup...`
      );
    }
  }

  const isQuota = lastStatus === 429 || lastErrorMessage.toLowerCase().includes('quota');
  throw new AiServiceError(
    isQuota ? 'QUOTA_EXCEEDED' : 'SERVICE_UNAVAILABLE',
    isQuota
      ? 'Free-tier Gemini quota reached across primary and backup models. Please wait a moment and try again.'
      : `All Gemini models (${triedModels.join(', ')}) are currently unavailable: ${lastErrorMessage}`,
    isQuota ? 429 : 503,
    triedModels
  );
}
