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
    <div className={`p-3 sm:p-4 rounded-3xl shadow-lg border transition-all mb-3 ${
      isDarkMode 
        ? 'bg-[#1e1316]/90 border-rose-900/40 text-rose-100' 
        : 'bg-white/90 border-pink-100 text-slate-800'
    } backdrop-blur-md`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Mood & Avatar/Outfit Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer" onClick={() => setIsOutfitModalOpen(true)}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 border-pink-400 shadow-md group-hover:scale-105 transition-transform">
              <img 
                src={currentOutfitObj.previewUrl} 
                alt="Suho-na Outfit" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1 rounded-full text-[10px] shadow">
              <Shirt size={10} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-pink-600 dark:text-rose-300">Suho-na</span>
              {/* Mood Pill */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${
                isDarkMode ? 'bg-rose-950/60 border-rose-800/50 text-rose-200' : 'bg-pink-50 border-pink-200 text-pink-700'
              }`}>
                <span>{MOOD_EMOJIS[stats.mood] || '🥰'}</span>
                <span>{stats.mood}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-pink-500/80">
              <span className="flex items-center gap-0.5"><Flame size={12} className="text-orange-500 fill-orange-500" /> {stats.streakDays} Day Streak</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><Shirt size={12} /> {currentOutfitObj.name}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons using freed space smoothly */}
        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end flex-1 w-full sm:w-auto">
          {onOpenCall && (
            <button
              type="button"
              onClick={onOpenCall}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:brightness-105 hover:scale-105 active:scale-95"
              title="Start Real-time Voice Call"
            >
              <Phone size={14} className="animate-pulse" />
              <span>Call</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onQuickAction('morning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs hover:scale-105 active:scale-95 ${
              isDarkMode ? 'bg-amber-950/40 border-amber-800/40 text-amber-200 hover:bg-amber-900/50' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
            title="Send Good Morning Greeting"
          >
            <Sun size={14} className="text-amber-500" />
            <span>Good Morning</span>
          </button>

          <button
            type="button"
            onClick={() => onQuickAction('night')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs hover:scale-105 active:scale-95 ${
              isDarkMode ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-200 hover:bg-indigo-900/50' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
            title="Send Good Night Greeting"
          >
            <Moon size={14} className="text-indigo-400" />
            <span>Good Night</span>
          </button>

          <button
            type="button"
            onClick={onOpenRoleplay}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:brightness-105 hover:scale-105 active:scale-95"
          >
            <Sparkles size={14} />
            <span>Roleplay</span>
          </button>

          <button
            type="button"
            onClick={onOpenGames}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs hover:scale-105 active:scale-95 ${
              isDarkMode ? 'bg-rose-950/40 border-rose-800/40 text-rose-200 hover:bg-rose-900/50' : 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
            }`}
          >
            <span>🎮 Games</span>
          </button>

          {onOpenAchievements && (
            <button
              type="button"
              onClick={onOpenAchievements}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white shadow-md hover:brightness-105 hover:scale-105 active:scale-95"
              title="View Relationship Level & Achievements"
            >
              <Trophy size={14} className="text-amber-200 fill-amber-200 animate-pulse" />
              <span>LVL {currentLevel}</span>
            </button>
          )}

          {onOpenReferrals && (
            <button
              type="button"
              onClick={onOpenReferrals}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:brightness-105 hover:scale-105 active:scale-95"
              title="Refer Friends & Earn Free Rewards"
            >
              <Gift size={14} className="text-amber-200 animate-bounce" />
              <span>Refer & Earn</span>
            </button>
          )}

          {onOpenPremiumGallery && (
            <button
              type="button"
              onClick={onOpenPremiumGallery}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white shadow-md hover:brightness-105 hover:scale-105 active:scale-95"
              title="Open Premium Romantic Gallery"
            >
              <Crown size={14} className="text-amber-200 fill-amber-300" />
              <span>Romantic Gallery</span>
            </button>
          )}
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
