import React, { useState } from 'react';
import { Flame, Sparkles, Sun, Moon, Shirt, Phone, Trophy, Gift, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RelationshipStats, MoodType, OutfitType } from '../types';

interface RelationshipBarProps {
  stats: RelationshipStats;
  isDarkMode: boolean;
  onUpdateStats: (newStats: Partial<RelationshipStats>) => void;
  onQuickAction: (actionType: 'morning' | 'night' | 'compliment' | 'surprise') => void;
  onOpenRoleplay: () => void;
  onOpenGames: () => void;
  onOpenCall?: () => void;
  onOpenAchievements?: () => void;
  onOpenReferrals?: () => void;
  onOpenPremiumGallery?: () => void;
  currentLevel?: number;
}

const MOOD_EMOJIS: Record<MoodType, string> = {
  Happy: '🥰',
  Shy: '😳',
  Excited: '🤩',
  Sleepy: '😴',
  Sad: '🥺',
  Playful: '😜',
  Romantic: '💕',
  Spicy: '🔥'
};

const OUTFITS: { id: OutfitType; name: string; emoji: string; previewUrl: string }[] = [
  { id: 'casual', name: 'Casual Cozy', emoji: '👗', previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
  { id: 'elegant', name: 'Elegant Dress', emoji: '💃', previewUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300' },
  { id: 'beachwear', name: 'Summer Beachwear', emoji: '🏖️', previewUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300' },
  { id: 'pajamas', name: 'Cute Pajamas', emoji: '🌙', previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
  { id: 'romantic_red', name: 'Spicy Romance', emoji: '🌹', previewUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=300' }
];

export default function RelationshipBar({
  stats,
  isDarkMode,
  onUpdateStats,
  onQuickAction,
  onOpenRoleplay,
  onOpenGames,
  onOpenCall,
  onOpenAchievements,
  onOpenReferrals,
  onOpenPremiumGallery,
  currentLevel = 1
}: RelationshipBarProps) {
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);

  const currentOutfitObj = OUTFITS.find(o => o.id === stats.outfit) || OUTFITS[0];

  return (
    <div className={`py-2 px-3 sm:px-4 rounded-2xl shadow-sm border transition-all mb-2 ${
      isDarkMode 
        ? 'bg-[#1e1316]/90 border-rose-900/40 text-rose-100' 
        : 'bg-white/90 border-pink-100 text-slate-800'
    } backdrop-blur-md max-w-3xl mx-auto w-full`}>
      <div className="flex items-center justify-between gap-2">
        
        {/* Left: Mood & Outfit Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative group cursor-pointer" onClick={() => setIsOutfitModalOpen(true)} title="Change Suho-na's Outfit">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 border-pink-400 shadow-xs group-hover:scale-105 transition-transform">
              <img 
                src={currentOutfitObj.previewUrl} 
                alt="Suho-na Outfit" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-0.5 rounded-full text-[8px] shadow">
              <Shirt size={8} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight text-pink-600 dark:text-rose-300">Suho-na</span>
              {/* Mood Pill */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${
                isDarkMode ? 'bg-rose-950/60 border-rose-800/50 text-rose-200' : 'bg-pink-50 border-pink-200 text-pink-700'
              }`}>
                <span>{MOOD_EMOJIS[stats.mood] || '🥰'}</span>
                <span>{stats.mood}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Stats & Outfit trigger */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-pink-500 shrink-0">
          <span className="flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full text-[10px]">
            <Flame size={11} className="fill-orange-500" /> {stats.streakDays}d Streak
          </span>
          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px]">
            <Trophy size={11} className="fill-amber-400" /> LVL {currentLevel}
          </span>
          <button
            type="button"
            onClick={() => setIsOutfitModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full border border-pink-200 text-pink-600 text-[10px] hover:bg-pink-50 transition-colors"
          >
            <Shirt size={11} /> Change Outfit
          </button>
        </div>

      </div>

      {/* Outfit Customizer Modal */}
      <AnimatePresence>
        {isOutfitModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                isDarkMode ? 'bg-[#1a1012] border-rose-900/40 text-rose-100' : 'bg-white border-pink-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-rose-900/30">
                <div className="flex items-center gap-2">
                  <Shirt className="text-pink-500" size={20} />
                  <h3 className="font-bold text-base">Change Suho-na's Outfit</h3>
                </div>
                <button 
                  onClick={() => setIsOutfitModalOpen(false)}
                  className="text-xs font-bold text-pink-500 hover:bg-pink-50 dark:hover:bg-rose-900/40 px-2.5 py-1 rounded-full"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {OUTFITS.map((outfit) => {
                  const isSelected = stats.outfit === outfit.id;
                  return (
                    <button
                      key={outfit.id}
                      type="button"
                      onClick={() => {
                        onUpdateStats({ outfit: outfit.id });
                        setIsOutfitModalOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-400'
                          : isDarkMode
                          ? 'border-rose-900/30 bg-[#25181b] hover:bg-[#2d1d21]'
                          : 'border-pink-100 bg-pink-50/50 hover:bg-pink-50'
                      }`}
                    >
                      <img 
                        src={outfit.previewUrl} 
                        alt={outfit.name} 
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1">
                          <span>{outfit.emoji}</span>
                          <span>{outfit.name}</span>
                        </div>
                        {isSelected && <span className="text-[10px] text-pink-500 font-bold">Wearing Now</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
