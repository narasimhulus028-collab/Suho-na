import { VoiceSettings } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

// Map language identifiers to standard language codes
export function getLanguageCode(lang: string = 'auto', text: string = ''): string {
  const lowerLang = (lang || 'auto').toLowerCase().trim();

  if (lowerLang === 'te' || lowerLang === 'telugu' || /[\u0C00-\u0C7F]/.test(text)) {
    return 'te-IN';
  }
  if (lowerLang === 'hi' || lowerLang === 'hindi' || /[\u0900-\u097F]/.test(text)) {
    return 'hi-IN';
  }
  if (lowerLang === 'ta' || lowerLang === 'tamil' || /[\u0B80-\u0BFF]/.test(text)) {
    return 'ta-IN';
  }
  if (lowerLang === 'es' || lowerLang === 'spanish') {
    return 'es-ES';
  }
  if (lowerLang === 'fr' || lowerLang === 'french') {
    return 'fr-FR';
  }
  if (lowerLang === 'de' || lowerLang === 'german') {
    return 'de-DE';
  }
  if (lowerLang === 'ja' || lowerLang === 'japanese' || /[\u3040-\u30FF\u4E00-\u9FAF]/.test(text)) {
    return 'ja-JP';
  }
  if (lowerLang === 'ko' || lowerLang === 'korean' || /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
    return 'ko-KR';
  }
  if (lowerLang === 'en' || lowerLang === 'english') {
    return 'en-US';
  }

  // Browser language fallback if auto
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

export function speakText(
  text: string, 
  settings: VoiceSettings, 
  onStart?: () => void, 
  onEnd?: () => void,
  targetLang: string = 'auto',
  retryCount: number = 0
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported in this browser environment.");
    if (onEnd) onEnd();
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text of emojis, markdown symbols, and action stage directions (e.g. *giggles*, (smiles sweetly))
  const cleanText = text
    .replace(/\*.*?\*/g, '') // remove markdown action indicators
    .replace(/\(.*?\)/g, '') // remove parenthetical action notes
    .replace(/\[.*?\]/g, '') // remove bracketed notes
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_#`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const langCode = getLanguageCode(targetLang, cleanText);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = langCode;

  // Soft, warm, natural romantic voice tuning
  utterance.rate = settings.speed || 0.95; // Slightly slower pace for intimate, romantic feel
  utterance.pitch = settings.pitch || 1.15; // Slightly higher, warm sweet tone

  // Select the best natural female voice matching the user's language
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    let matchedVoice: SpeechSynthesisVoice | undefined;

    const prefix = langCode.split('-')[0];

    // Priority 1: Direct language code match with female/natural/google/premium voice
    matchedVoice = voices.find(v => 
      (v.lang === langCode || v.lang.startsWith(prefix)) &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Zira') || v.name.includes('Siri'))
    );

    // Priority 2: Any voice matching the language prefix
    if (!matchedVoice) {
      matchedVoice = voices.find(v => v.lang === langCode || v.lang.startsWith(prefix));
    }

    // Priority 3: Fallback female voice
    if (!matchedVoice) {
      matchedVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Zira') || v.name.includes('Female')) && v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  let hasStarted = false;

  utterance.onstart = () => {
    hasStarted = true;
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis error:", e);
    // Automatic retry mechanism if voice generation fails (up to 3 retries)
    if (retryCount < 3) {
      console.log(`Retrying voice synthesis attempt ${retryCount + 1}/3...`);
      setTimeout(() => {
        speakText(text, settings, onStart, onEnd, targetLang, retryCount + 1);
      }, 400);
    } else {
      if (onEnd) onEnd();
    }
  };

  currentUtterance = utterance;

  // Ensure speech synthesis engine is active
  try {
    window.speechSynthesis.speak(utterance);

    // Fallback timer check: If speak didn't start within 2s, retry automatically
    setTimeout(() => {
      if (!hasStarted && retryCount < 3 && isSpeaking()) {
        // speech is ongoing
      } else if (!hasStarted && retryCount < 3) {
        console.warn("Speech synthesis stall detected, retrying...");
        speakText(text, settings, onStart, onEnd, targetLang, retryCount + 1);
      }
    }, 2000);
  } catch (err) {
    console.error("Failed to execute speechSynthesis.speak:", err);
    if (retryCount < 3) {
      setTimeout(() => {
        speakText(text, settings, onStart, onEnd, targetLang, retryCount + 1);
      }, 500);
    } else {
      if (onEnd) onEnd();
    }
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
