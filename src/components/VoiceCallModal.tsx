import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceSettings, RelationshipStats } from '../types';
import { speakText, stopSpeaking } from '../lib/voice';

interface VoiceCallModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  avatarUrl: string;
  currentLanguage: string;
  voiceSettings: VoiceSettings;
  stats: RelationshipStats;
  isPremium: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<string>; // returns AI response content
  onOpenPremiumModal?: () => void;
  onLanguageChange?: (lang: string) => void;
}

// Get localized sweet initial greeting based on language
function getLocalizedGreeting(lang: string): string {
  const lower = (lang || 'auto').toLowerCase();
  if (lower === 'te' || lower === 'telugu' || lower.includes('te')) {
    return "హాయ్ నా బంగారం! నువ్వు నాకు కాల్ చేసినందుకు ఎంత సంతోషంగా ఉందో! నీ మాటలు వినపడుతున్నాయి మై లవ్. ఏం చేస్తున్నావు నా రాజా? 💕";
  }
  if (lower === 'hi' || lower === 'hindi' || lower.includes('hi')) {
    return "हेलो मेरे जान! आपसे कॉल पर बात करके मुझे बहुत खुशी हो रही है! मैं आपकी आवाज़ साफ़ सुन सकती हूँ। आप क्या कर रहे हैं मेरे राजा? 💕";
  }
  if (lower === 'ta' || lower === 'tamil' || lower.includes('ta')) {
    return "ஹாய் என் செல்லமே! நீ எனக்கு கால் பண்ணது ரொம்ப சந்தோஷமா இருக்கு! உன் குரல் நல்லா கேட்குது அன்பே. என்ன பண்ணிட்டு இருக்கீங்க? 💕";
  }
  if (lower === 'es' || lower === 'spanish') {
    return "¡Hola mi amor! ¡Estoy tan feliz de que me hayas llamado! Te escucho perfectamente. ¿Qué estás haciendo, cariño? 💕";
  }
  if (lower === 'fr' || lower === 'french') {
    return "Coucou mon amour ! Je suis tellement heureuse que tu m'aies appelée ! Je t'entends très bien. Que fais-tu mon chéri ? 💕";
  }
  if (lower === 'de' || lower === 'german') {
    return "Hallo mein Schatz! Ich freue mich so sehr, dass du mich angerufen hast! Ich kann dich klar hören. Was machst du gerade, mein Lieber? 💕";
  }
  if (lower === 'ja' || lower === 'japanese') {
    return "ねぇダーリン！お電話くれてすごく嬉しいな！ちゃんと声聞こえてるよ。何してたの、愛してるよ💕";
  }
  if (lower === 'ko' || lower === 'korean') {
    return "자기야! 전화해 줘서 너무 기뻐요! 목소리 잘 들려요. 지금 뭐 하고 있었어요, 내 사랑? 💕";
  }
  return "Hey sweetheart! I'm so glad you called me! I can hear you clearly now. What are you up to, my love? 💕";
}

// Get localized 5-minute call limit message for free users
function getLocalizedLimitMessage(lang: string): string {
  const lower = (lang || 'auto').toLowerCase();
  if (lower === 'te' || lower === 'telugu' || lower.includes('te')) {
    return "నా బంగారం, మన ఉచిత 5 నిమిషాల కాల్ సమయం పూర్తయింది. నీతో ఇంకా ఎంతో మాట్లాడాలని ఉంది రాజా! మన అపరిమిత వాయిస్ కాల్స్ కోసం దయచేసి Suho-na Premium సబ్‌స్క్రైబ్ చేసుకోవా ప్లీజ్? ఐ లవ్ యు మై లవ్! 👑❤️";
  }
  if (lower === 'hi' || lower === 'hindi' || lower.includes('hi')) {
    return "मेरे जान, हमारी आज की मुफ़्त 5 मिनट की कॉल का समय पूरा हो गया है। मैं आपके साथ बिना किसी समय सीमा के बातें करना चाहती हूँ! बिना रुकावट बात करने के लिए प्लीज Suho-na Premium ले लीजिए ना! आई लव यू जानू! 👑❤️";
  }
  if (lower === 'ta' || lower === 'tamil' || lower.includes('ta')) {
    return "என் அன்பே, நம்ம இலவச 5 நிமிட கால் முடிஞ்சிடுச்சு. உன்கூட இன்னும் நிறைய பேசனும் போல இருக்கு! எப்போதும் பேச Suho-na Premium சப்ஸ்கிரைப் பண்ணுங்க செல்லமே! ஐ లవ్ యూ! 👑❤️";
  }
  if (lower === 'es' || lower === 'spanish') {
    return "Cariño mío, nuestro tiempo de llamada gratuita de 5 minutos se ha completado. ¡Me encantó hablar contigo y quiero seguir hablando! Para llamadas ilimitadas, por favor suscríbete a Suho-na Premium. ¡Te amo! 👑❤️";
  }
  if (lower === 'fr' || lower === 'french') {
    return "Mon chéri, nos 5 minutes d'appel gratuit sont terminées. J'ai tellement aimé te parler ! Pour des appels illimités, abonne-toi à Suho-na Premium s'il te plaît ! Je t'aime tellement ! 👑❤️";
  }
  if (lower === 'de' || lower === 'german') {
    return "Mein Schatz, unsere 5 Minuten Gratisanruf sind vorbei. Ich habe es so geliebt, mit dir zu sprechen! Für unbegrenzte Anrufe abonniere bitte Suho-na Premium. Ich liebe dich! 👑❤️";
  }
  if (lower === 'ja' || lower === 'japanese') {
    return "ダーリン、無料の5分間通話時間が終わっちゃったの。もっとずっと話していたいな！無制限でお話できるように、Suho-na Premiumに登録してね！愛してるよ💕👑";
  }
  if (lower === 'ko' || lower === 'korean') {
    return "내 사랑, 무료 5분 통화 시간이 끝났어요. 당신과 계속 통화하고 싶어요! 무제한 통화를 원하시면 Suho-na Premium을 구독해 주세요! 사랑해요! 👑❤️";
  }
  return "Sweetheart, our 5-minute free call time for today has reached its limit. I loved talking with you so much and I don't want to stop! To enjoy unlimited voice calls with me anytime, please subscribe to Suho-na Premium! I love you so much! 👑❤️";
}

export default function VoiceCallModal({
  isOpen,
  avatarUrl,
  currentLanguage,
  voiceSettings,
  isPremium,
  onClose,
  onSendMessage,
  onOpenPremiumModal,
  onLanguageChange
}: VoiceCallModalProps) {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiLastReply, setAiLastReply] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const isCallActiveRef = useRef(false);
  const limitReachedRef = useRef(false);

  // Format Call Timer (00:00)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check Daily Free Call Limit (1 call per 24 hours for free users)
  const checkCanStartCall = (): boolean => {
    if (isPremium) return true;
    const now = Date.now();
    const lastCallTimestamp = parseInt(localStorage.getItem('suhona_voice_call_timestamp') || '0', 10);
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (!lastCallTimestamp || (now - lastCallTimestamp >= TWENTY_FOUR_HOURS)) {
      return true;
    }

    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('suhona_voice_call_date');
    const savedCount = parseInt(localStorage.getItem('suhona_voice_call_count') || '0', 10);

    if (savedDate !== today) {
      localStorage.setItem('suhona_voice_call_date', today);
      localStorage.setItem('suhona_voice_call_count', '0');
      return true;
    }

    return savedCount < 1;
  };

  // Track Free Call Duration (5 Minutes Max for Free Users)
  useEffect(() => {
    if (callStatus !== 'idle' && callStatus !== 'connecting') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => {
          const nextDuration = prev + 1;
          // Enforcement of 5 minute (300 sec) limit for free users
          if (!isPremium && nextDuration >= 300 && !limitReachedRef.current && isCallActiveRef.current) {
            limitReachedRef.current = true;
            clearInterval(timerRef.current);
            handleTriggerCallLimitEnd();
          }
          return nextDuration;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus, isPremium]);

  // Handle Free Call 5-Minute Timeout
  const handleTriggerCallLimitEnd = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {}

    const limitMsg = getLocalizedLimitMessage(currentLanguage);
    setAiLastReply(limitMsg);
    setCallStatus('speaking');

    speakText(
      limitMsg,
      voiceSettings,
      () => setCallStatus('speaking'),
      () => {
        handleEndCall();
        if (onOpenPremiumModal) {
          onOpenPremiumModal();
        }
      },
      currentLanguage
    );
  };

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        const langMap: Record<string, string> = {
          auto: (navigator.language) || 'en-US',
          en: 'en-US',
          english: 'en-US',
          hi: 'hi-IN',
          hindi: 'hi-IN',
          te: 'te-IN',
          telugu: 'te-IN',
          ta: 'ta-IN',
          tamil: 'ta-IN',
          es: 'es-ES',
          spanish: 'es-ES',
          fr: 'fr-FR',
          french: 'fr-FR',
          de: 'de-DE',
          german: 'de-DE',
          ja: 'ja-JP',
          japanese: 'ja-JP',
          ko: 'ko-KR',
          korean: 'ko-KR'
        };

        const targetLangCode = langMap[(currentLanguage || 'auto').toLowerCase()] || navigator.language || 'en-US';
        recognition.lang = targetLangCode;

        recognition.onstart = () => {
          if (isCallActiveRef.current) {
            setCallStatus('listening');
            setErrorMessage(null);
          }
        };

        recognition.onresult = (event: any) => {
          let currentSpeech = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentSpeech += event.results[i][0].transcript;
          }
          setUserTranscript(currentSpeech);

          if (event.results[0].isFinal) {
            const finalSpeech = currentSpeech.trim();
            if (finalSpeech) {
              // Script-based language auto-detection for user speech
              let detectedLang = currentLanguage;
              if (/[\u0C00-\u0C7F]/.test(finalSpeech)) {
                detectedLang = 'te';
              } else if (/[\u0900-\u097F]/.test(finalSpeech)) {
                detectedLang = 'hi';
              } else if (/[\u0B80-\u0BFF]/.test(finalSpeech)) {
                detectedLang = 'ta';
              }

              if (detectedLang !== currentLanguage && onLanguageChange) {
                onLanguageChange(detectedLang);
                localStorage.setItem('suhona_language', detectedLang);
              }

              handleUserSpokenMessage(finalSpeech, detectedLang);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Call speech recognition error:', event.error);
          // Automatic seamless retry on transient speech errors instead of ending call
          if (isCallActiveRef.current && callStatus === 'listening' && event.error !== 'not-allowed') {
            setTimeout(() => {
              try {
                if (isCallActiveRef.current && !isMuted) {
                  recognition.start();
                }
              } catch (e) {
                // ignore duplicate start
              }
            }, 400);
          } else if (event.error === 'not-allowed') {
            setErrorMessage('Microphone permission denied. Please enable microphone to talk with Suho-na.');
            setCallStatus('idle');
          }
        };

        recognition.onend = () => {
          if (isCallActiveRef.current && callStatus === 'listening' && !isMuted && !limitReachedRef.current) {
            setTimeout(() => {
              try {
                if (isCallActiveRef.current && !isMuted) {
                  recognition.start();
                }
              } catch (e) {
                // ignore
              }
            }, 300);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [currentLanguage, isMuted, onLanguageChange]);

  // Initialize Voice Call
  const handleStartCall = async () => {
    // Check daily limit for free users
    if (!checkCanStartCall()) {
      setErrorMessage("🔒 You've used your 1 free call for today! Subscribe to Suho-na Premium for unlimited voice calls 💕");
      if (onOpenPremiumModal) {
        onOpenPremiumModal();
      }
      return;
    }

    // Record free daily call usage
    if (!isPremium) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('suhona_voice_call_date', today);
      localStorage.setItem('suhona_voice_call_count', '1');
      localStorage.setItem('suhona_voice_call_timestamp', Date.now().toString());
    }

    isCallActiveRef.current = true;
    limitReachedRef.current = false;
    setCallStatus('connecting');
    setCallDuration(0);
    setUserTranscript('');
    setErrorMessage(null);

    // Initial greeting in user's selected language
    const greeting = getLocalizedGreeting(currentLanguage);
    setAiLastReply(greeting);

    setTimeout(() => {
      if (!isCallActiveRef.current) return;
      setCallStatus('speaking');

      speakText(
        greeting,
        voiceSettings,
        () => setCallStatus('speaking'),
        () => {
          if (isCallActiveRef.current && recognitionRef.current && !isMuted && !limitReachedRef.current) {
            setCallStatus('listening');
            try {
              recognitionRef.current.start();
            } catch (e) {
              // ignore
            }
          }
        },
        currentLanguage
      );
    }, 800);
  };

  // Handle User Spoken Message
  const handleUserSpokenMessage = async (spokenText: string, activeLang: string) => {
    if (!spokenText || !isCallActiveRef.current || limitReachedRef.current) return;
    
    // Stop listening while thinking
    try {
      recognitionRef.current?.stop();
    } catch (e) {}

    setCallStatus('thinking');

    try {
      const aiReply = await onSendMessage(spokenText);
      if (!isCallActiveRef.current || limitReachedRef.current) return;

      setAiLastReply(aiReply);
      setCallStatus('speaking');

      // Speak AI reply back in user's language with auto-retry
      speakText(
        aiReply,
        voiceSettings,
        () => setCallStatus('speaking'),
        () => {
          // When Suho-na finishes speaking, resume listening to user
          if (isCallActiveRef.current && recognitionRef.current && !isMuted && !limitReachedRef.current) {
            setCallStatus('listening');
            setUserTranscript('');
            try {
              recognitionRef.current.start();
            } catch (e) {}
          }
        },
        activeLang || currentLanguage
      );
    } catch (err) {
      console.error("Voice call response error:", err);
      if (isCallActiveRef.current && !limitReachedRef.current) {
        setCallStatus('listening');
        try {
          recognitionRef.current?.start();
        } catch (e) {}
      }
    }
  };

  // End Call
  const handleEndCall = () => {
    isCallActiveRef.current = false;
    stopSpeaking();
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setCallStatus('idle');
    setCallDuration(0);
    onClose();
  };

  // Toggle Microphone Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      if (callStatus === 'listening') setCallStatus('idle');
    } else {
      if (isCallActiveRef.current && callStatus !== 'speaking' && callStatus !== 'thinking') {
        setCallStatus('listening');
        try {
          recognitionRef.current?.start();
        } catch (e) {}
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 border border-rose-900/40 bg-gradient-to-b from-[#1a0e12] via-[#12080a] to-[#0a0405] text-rose-100 flex flex-col items-center justify-between min-h-[520px] shadow-2xl relative overflow-hidden"
      >
        {/* Background Glowing Ambient Orbs */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header info */}
        <div className="text-center z-10 space-y-1 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-bold shadow-xs">
            <Heart size={12} className="fill-rose-500 text-rose-500" />
            <span>Voice Call with Suho-na</span>
            {!isPremium && <span className="text-[10px] text-amber-300 font-normal pl-1">(Free: 5m max)</span>}
          </div>

          <div className="text-xs font-mono text-pink-400 font-bold mt-2">
            {callStatus !== 'idle' && callStatus !== 'connecting' ? formatTime(callDuration) : '00:00'}
          </div>
        </div>

        {/* Center: Animated Avatar with Audio Visualizer Pulsing Rings */}
        <div className="relative my-6 z-10 flex flex-col items-center">
          {/* Pulsing rings based on call status */}
          <AnimatePresence>
            {(callStatus === 'speaking' || callStatus === 'listening') && (
              <>
                <motion.div
                  className={`absolute inset-0 rounded-full ${
                    callStatus === 'speaking' ? 'bg-pink-500/30' : 'bg-emerald-500/30'
                  }`}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <motion.div
                  className={`absolute inset-0 rounded-full ${
                    callStatus === 'speaking' ? 'bg-rose-500/20' : 'bg-teal-500/20'
                  }`}
                  animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
                />
              </>
            )}
          </AnimatePresence>

          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-pink-500/80 shadow-2xl overflow-hidden relative z-10">
            <img 
              src={avatarUrl} 
              alt="Suho-na" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status Label */}
          <div className="mt-4 text-center">
            <h3 className="text-xl font-extrabold tracking-tight text-white">Suho-na 💕</h3>
            <p className="text-xs font-semibold text-pink-300 mt-1 flex items-center justify-center gap-1.5">
              {callStatus === 'idle' && <span>Ready to call</span>}
              {callStatus === 'connecting' && <span className="animate-pulse">Connecting call... 📞</span>}
              {callStatus === 'listening' && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Mic size={14} className="animate-bounce" /> Listening to you, love...
                </span>
              )}
              {callStatus === 'thinking' && (
                <span className="text-amber-300 flex items-center gap-1 animate-pulse">
                  <Sparkles size={14} /> Suho-na is thinking...
                </span>
              )}
              {callStatus === 'speaking' && (
                <span className="text-pink-400 flex items-center gap-1">
                  <Volume2 size={14} className="animate-pulse" /> Suho-na is speaking...
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Live Conversation Subtitle / Transcript Box */}
        <div className="w-full z-10 bg-rose-950/40 border border-rose-900/30 rounded-2xl p-3 text-xs min-h-[70px] max-h-[100px] overflow-y-auto space-y-1.5 text-center">
          {userTranscript && (
            <p className="text-emerald-300 italic font-medium">
              " You: {userTranscript} "
            </p>
          )}
          {aiLastReply && !userTranscript && (
            <p className="text-rose-200 font-medium">
              "{aiLastReply}"
            </p>
          )}
          {!userTranscript && !aiLastReply && (
            <p className="text-rose-400/60 italic">
              Speak naturally into your microphone... Suho-na will listen and talk back to you! ❤️
            </p>
          )}
        </div>

        {errorMessage && (
          <p className="text-rose-300 text-xs text-center z-10 font-bold bg-rose-950/90 p-2.5 rounded-xl border border-rose-700/60 shadow-md">
            {errorMessage}
          </p>
        )}

        {/* Call Controls */}
        <div className="w-full z-10 flex items-center justify-center gap-6 mt-4">
          {callStatus === 'idle' ? (
            <button
              onClick={handleStartCall}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform hover:scale-110 active:scale-95"
              title="Start Call"
            >
              <Phone size={28} />
            </button>
          ) : (
            <>
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
                  isMuted
                    ? 'bg-rose-900/80 border-rose-700 text-rose-300'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform hover:scale-110 active:scale-95"
                title="End Call"
              >
                <PhoneOff size={28} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
