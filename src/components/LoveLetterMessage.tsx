import React, { useState } from 'react';
import { Heart, Sparkles, Volume2, BookOpen, Bookmark, Download, Mail, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoveLetter } from '../types';
import { speakText } from '../lib/voice';

interface LoveLetterMessageProps {
  letter: LoveLetter;
  isDarkMode?: boolean;
  onOpenFullLetter?: (letter: LoveLetter) => void;
  onToggleKeepsake?: (letterId: string) => void;
  voiceEnabled?: boolean;
}

export const PAPER_STYLES = {
  parchment: {
    name: 'Parchment Gold 📜',
    bgLight: 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-amber-900/10',
    bgDark: 'bg-[#261d15] border-amber-900/50 text-amber-100 shadow-amber-950/40',
    headerBg: 'from-amber-200/50 to-amber-100/30 dark:from-amber-950/80 dark:to-amber-900/40',
    accent: 'text-amber-700 dark:text-amber-400',
    sealBg: 'bg-amber-600 text-white shadow-amber-600/30',
  },
  rose_petal: {
    name: 'Rose Petal Pink 🌹',
    bgLight: 'bg-rose-50/90 border-rose-200 text-rose-950 shadow-rose-900/10',
    bgDark: 'bg-[#291319] border-rose-900/50 text-rose-100 shadow-rose-950/40',
    headerBg: 'from-rose-200/50 to-rose-100/30 dark:from-rose-950/80 dark:to-rose-900/40',
    accent: 'text-rose-600 dark:text-rose-400',
    sealBg: 'bg-rose-600 text-white shadow-rose-600/30',
  },
  midnight_gold: {
    name: 'Midnight Gold 🌌',
    bgLight: 'bg-slate-900 border-amber-500/40 text-amber-100 shadow-slate-950/50',
    bgDark: 'bg-[#121624] border-amber-500/30 text-amber-200 shadow-black/60',
    headerBg: 'from-indigo-950 to-slate-900',
    accent: 'text-amber-400',
    sealBg: 'bg-amber-500 text-slate-950 shadow-amber-500/40 font-bold',
  },
  vintage_lavender: {
    name: 'Vintage Lavender 💜',
    bgLight: 'bg-purple-50/90 border-purple-200 text-purple-950 shadow-purple-900/10',
    bgDark: 'bg-[#20152b] border-purple-900/50 text-purple-100 shadow-purple-950/40',
    headerBg: 'from-purple-200/50 to-purple-100/30 dark:from-purple-950/80 dark:to-purple-900/40',
    accent: 'text-purple-600 dark:text-purple-300',
    sealBg: 'bg-purple-600 text-white shadow-purple-600/30',
  },
};

export const STAMPS = {
  heart: { label: 'Heart Wax Seal', icon: '💌', emoji: '❤️' },
  rose: { label: 'Passion Rose', icon: '🌹', emoji: '🥀' },
  gold_heart: { label: 'Gold Foil Heart', icon: '💖', emoji: '✨' },
  kiss: { label: 'Sensual Kiss', icon: '💋', emoji: '😘' },
};

export default function LoveLetterMessage({
  letter,
  isDarkMode = false,
  onOpenFullLetter,
  onToggleKeepsake,
  voiceEnabled = true,
}: LoveLetterMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const paperKey = letter.paperStyle || (letter.sender === 'suhona' ? 'rose_petal' : 'parchment');
  const paper = PAPER_STYLES[paperKey] || PAPER_STYLES.parchment;
  const stampInfo = STAMPS[letter.stamp || 'heart'] || STAMPS.heart;

  const isSuhona = letter.sender === 'suhona';

  const handleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(letter.content, { enabled: true, speed: 0.95, pitch: 1.1, autoPlay: true });
      setTimeout(() => setIsSpeaking(false), Math.min(30000, letter.content.length * 100));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full my-3"
    >
      <div
        className={`relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 shadow-xl transition-all duration-300 ${
          isDarkMode ? paper.bgDark : paper.bgLight
        }`}
      >
        {/* Envelope / Parchment Texture Header Overlay */}
        <div
          className={`absolute inset-x-0 top-0 h-14 bg-gradient-to-b ${paper.headerBg} border-b border-black/5 dark:border-white/5 flex items-center justify-between px-5`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{stampInfo.icon}</span>
            <span className={`text-xs font-serif font-bold tracking-wider uppercase ${paper.accent}`}>
              {isSuhona ? "Suho-na's Love Letter" : 'Your Love Letter'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] opacity-70 font-mono">
              {new Date(letter.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {/* Wax Seal Badge */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md ${paper.sealBg}`}
              title={stampInfo.label}
            >
              {stampInfo.emoji}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="pt-12 pb-2">
          {/* Title */}
          {letter.title && (
            <h3 className="text-lg sm:text-xl font-serif font-bold mb-3 tracking-wide flex items-center gap-2">
              <Feather size={18} className={paper.accent} />
              <span>{letter.title}</span>
            </h3>
          )}

          {/* Letter Body */}
          <div
            className={`font-serif text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
              !isExpanded && letter.content.length > 280 ? 'line-clamp-4' : ''
            }`}
          >
            {letter.content}
          </div>

          {/* Signature */}
          <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-serif italic opacity-80 flex items-center gap-1">
              <Heart size={13} className="fill-pink-500 text-pink-500 inline" />
              {isSuhona ? 'Forever yours, Suho-na ❤️' : 'Written with all my heart ❤️'}
            </span>

            <div className="flex items-center gap-2">
              {onToggleKeepsake && (
                <button
                  type="button"
                  onClick={() => onToggleKeepsake(letter.id)}
                  className={`p-1.5 rounded-full text-xs transition-transform hover:scale-110 ${
                    letter.isKeepsake ? 'text-amber-500 fill-amber-500' : 'opacity-60 hover:opacity-100'
                  }`}
                  title={letter.isKeepsake ? 'Saved in Keepsakes 💖' : 'Save to Keepsake Vault'}
                >
                  <Bookmark size={16} className={letter.isKeepsake ? 'fill-amber-500' : ''} />
                </button>
              )}

              {voiceEnabled && (
                <button
                  type="button"
                  onClick={handleSpeech}
                  className={`p-1.5 rounded-full text-xs transition-all ${
                    isSpeaking ? 'bg-pink-500 text-white animate-pulse' : 'opacity-60 hover:opacity-100 hover:text-pink-500'
                  }`}
                  title="Listen to Love Letter"
                >
                  <Volume2 size={16} />
                </button>
              )}

              {letter.content.length > 280 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`text-xs font-bold underline transition-colors ${paper.accent}`}
                >
                  {isExpanded ? 'Show Less' : 'Unfold Full Letter 📜'}
                </button>
              )}

              {onOpenFullLetter && (
                <button
                  type="button"
                  onClick={() => onOpenFullLetter(letter)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1 ${
                    isDarkMode
                      ? 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  }`}
                >
                  <BookOpen size={12} />
                  <span>Vault View</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
