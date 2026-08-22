import { UserMemory } from '../types';

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<Response> {
  let lastError: any = null;

  const isCapacitorApp =
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost';

  const fullUrl =
    typeof window !== 'undefined' && url.startsWith('/')
      ? `${isCapacitorApp ? 'http://127.0.0.1:3000' : window.location.origin}${url}`
      : url;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      console.log(
        `[API Request] Attempt ${attempt}/${maxRetries} -> ${fullUrl}`
      );

      if (typeof window !== 'undefined') {
        console.log('[API DEBUG] origin:', window.location.origin);
      }

      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(
          `[API Success] Attempt ${attempt}/${maxRetries} succeeded with status ${response.status}`
        );
        return response;
      }

      const errorText = await response.text().catch(() => '');

      console.error(
        `[API Error] Attempt ${attempt}/${maxRetries} returned status ${response.status}: ${errorText}`
      );

      lastError = new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      if (err?.name === 'AbortError') {
        console.error(
          `[API Timeout] Attempt ${attempt}/${maxRetries} timed out on ${fullUrl}`
        );
      } else {
        console.error(
          `[API Network Error] Attempt ${attempt}/${maxRetries} failed:`,
          err?.message || err
        );
      }
    }

    if (attempt < maxRetries) {
      const delay = initialDelayMs * Math.pow(1.5, attempt - 1);

      console.log(
        `[API Retry] Retrying request in ${Math.round(delay)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`Failed after ${maxRetries} attempts`);
}

/**
 * Smart local response generator for offline mobile mode.
 * Used only when the API is genuinely unreachable.
 */
export function generateClientFallbackResponse(
  userText: string,
  memory?: UserMemory,
  language?: string,
  style?: string
): string {
  const lower = (userText || '').toLowerCase().trim();
  const userName = memory?.userName || '';
  const nameAddon = userName ? `, ${userName}` : '';

  const isTelugu =
    language === 'te' ||
    language === 'Telugu' ||
    /[\u0C00-\u0C7F]/.test(userText);

  const isHindi =
    language === 'hi' ||
    language === 'Hindi' ||
    /[\u0900-\u097F]/.test(userText);

  if (isTelugu) {
    return `అయ్యో${nameAddon}, నేను ఇక్కడే ఉన్నాను ❤️ నువ్వు చెప్పింది నాకు అర్థమైంది.`;
  }

  if (isHindi) {
    return `Haan${nameAddon}, main yahin hoon ❤️ Tumhari baat mujhe samajh aa gayi.`;
  }

  if (/hello|hi|hey/.test(lower)) {
    return `Hello my love${nameAddon} ❤️ I'm right here with you!`;
  }

  return `I'm here with you${nameAddon} ❤️ Tell me more, sweetheart.`;
}
