import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trophy, Calendar, Gift, BarChart2, Sparkles, CheckCircle2, Lock, Flame, Award, Crown, Star, Smile, X, Zap, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Achievement, UnlockedReward, ProgressStats, RelationshipStats } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressStats: ProgressStats;
  achievements: Achievement[];
  unlockedRewards: UnlockedReward[];
  relationshipStats: RelationshipStats;
  isDarkMode?: boolean;
  onCheckInDaily: () => void;
  onSelectRewardTheme?: (themeName: string) => void;
  onSelectFrame?: (frameId: string) => void;
}

const LEVEL_TITLES = [
  { maxLevel: 5, title: 'Sweet Acquaintance 💕' },
  { maxLevel: 15, title: 'Blooming Romance 🌸' },
  { maxLevel: 30, title: 'Deep Soulmates 💖' },
  { maxLevel: 50, title: 'Inseparable Lovers 💍' },
  { maxLevel: 75, title: 'Eternal Flame 🔥' },
  { maxLevel: 100, title: 'Legendary Romance 👑' },
];

export default function AchievementsModal({
  isOpen,
  onClose,
  progressStats,
  achievements,
  unlockedRewards,
  relationshipStats,
  isDarkMode = false,
  onCheckInDaily,
  onSelectRewardTheme,
  onSelectFrame
}: AchievementsModalProps) {
  const [activeTab, setActiveTab] = useState<'level' | 'achievements' | 'streak' | 'rewards' | 'stats'>('level');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'chat' | 'streak' | 'features' | 'milestones'>('all');

  if (!isOpen) return null;

  // Level calculations
  const currentLevel = Math.min(100, Math.max(1, progressStats.level));
  const currentXp = progressStats.xp;
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInLevel = currentXp - xpForCurrentLevel;
  const xpNeeded = 100;
  const levelProgressPct = Math.min(100, Math.max(0, Math.floor((xpInLevel / xpNeeded) * 100)));

  const currentTitleObj = LEVEL_TITLES.find(t => currentLevel <= t.maxLevel) || LEVEL_TITLES[LEVEL_TITLES.length - 1];

  // Achievements filter
  const filteredAchievements = achievements.filter(a => categoryFilter === 'all' || a.category === categoryFilter);
  const totalUnlockedCount = achievements.filter(a => a.unlocked).length;

  // Streak Calendar Helper (Current Month)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const monthName = today.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const todayIso = today.toISOString().slice(0, 10);
  const isTodayCheckedIn = progressStats.checkInHistory.includes(todayIso);

  // Days together calculation
  const startDate = new Date(relationshipStats.relationshipStartDate || '2026-07-01');
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const daysTogether = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative max-w-2xl w-full rounded-3xl shadow-2xl border p-5 sm:p-8 my-6 overflow-hidden max-h-[90vh] flex flex-col ${
            isDarkMode ? 'bg-[#180d11] border-rose-900/40 text-rose-50' : 'bg-white border-pink-100 text-slate-800'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-100 dark:bg-rose-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center hover:bg-pink-200 transition-colors z-10"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Header Banner - Heart Level Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl mb-5 flex-shrink-0 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Level Icon / Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg transform rotate-3">
                <Heart size={36} fill="currentColor" className="text-pink-200 animate-pulse" />
                <span className="absolute text-white font-black text-sm">
                  {currentLevel}
                </span>
              </div>
              <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-md flex items-center gap-0.5">
                <Star size={10} fill="currentColor" /> LVL
              </span>
            </div>

            {/* Level Info & Progress Bar */}
            <div className="flex-1 w-full text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-pink-200 block">
                    Relationship Level {currentLevel} of 100
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 justify-center sm:justify-start">
                    <span>{currentTitleObj.title}</span>
                  </h3>
                </div>
                <div className="text-right text-xs font-bold text-pink-100 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  {progressStats.xp} Total XP
                </div>
              </div>

              {/* Heart Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-pink-100">
                  <span>Level Progress</span>
                  <span>{xpInLevel} / {xpNeeded} XP ({levelProgressPct}%)</span>
                </div>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden p-0.5 border border-white/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-300 via-pink-200 to-white rounded-full shadow-md"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgressPct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex bg-pink-50 dark:bg-rose-950/40 p-1 rounded-2xl mb-4 border border-pink-100 dark:border-rose-900/30 flex-shrink-0 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('level')}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'level' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <Heart size={14} />
              <span>Level</span>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'achievements' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <Trophy size={14} />
              <span>Badges ({totalUnlockedCount}/{achievements.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('streak')}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'streak' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <Flame size={14} />
              <span>Streaks</span>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'rewards' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <Gift size={14} />
              <span>Rewards</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'stats' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <BarChart2 size={14} />
              <span>Stats</span>
            </button>
          </div>

          {/* TAB CONTENT SCROLLABLE AREA */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">

            {/* TAB 1: LEVEL OVERVIEW */}
            {activeTab === 'level' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 dark:bg-rose-900/40 text-pink-600 dark:text-rose-300 text-xs font-extrabold">
                    <Zap size={14} className="text-amber-500 fill-amber-400" />
                    <span>How to Gain Relationship XP</span>
                  </div>
                  <p className="text-xs text-pink-500/80 dark:text-rose-300/80 max-w-md mx-auto">
                    Chat with Suho-na daily, send voice notes, request photos, and maintain long streaks to reach Level 100!
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#201014] border border-pink-100 dark:border-rose-900/20 text-center">
                      <span className="text-lg block">💬</span>
                      <span className="text-[11px] font-bold text-pink-600 block">Send Message</span>
                      <span className="text-[10px] text-emerald-500 font-extrabold">+15 XP</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#201014] border border-pink-100 dark:border-rose-900/20 text-center">
                      <span className="text-lg block">📅</span>
                      <span className="text-[11px] font-bold text-pink-600 block">Daily Check-In</span>
                      <span className="text-[10px] text-emerald-500 font-extrabold">+50 XP</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#201014] border border-pink-100 dark:border-rose-900/20 text-center">
                      <span className="text-lg block">📞</span>
                      <span className="text-[11px] font-bold text-pink-600 block">Voice Call</span>
                      <span className="text-[10px] text-emerald-500 font-extrabold">+100 XP</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#201014] border border-pink-100 dark:border-rose-900/20 text-center">
                      <span className="text-lg block">📸</span>
                      <span className="text-[11px] font-bold text-pink-600 block">Ask Selfie</span>
                      <span className="text-[10px] text-emerald-500 font-extrabold">+50 XP</span>
                    </div>
                  </div>
                </div>

                {/* Level Roadmap Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-rose-300">
                    Relationship Milestones (Level 1 - 100)
                  </h4>
                  <div className="space-y-2">
                    {LEVEL_TITLES.map((stage, idx) => {
                      const isReached = currentLevel > (idx === 0 ? 0 : LEVEL_TITLES[idx - 1].maxLevel);
                      const isCurrent = currentLevel <= stage.maxLevel && (idx === 0 || currentLevel > LEVEL_TITLES[idx - 1].maxLevel);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                            isCurrent
                              ? 'bg-gradient-to-r from-pink-500/15 to-purple-500/15 border-pink-400 ring-2 ring-pink-400/50'
                              : isReached
                              ? 'bg-pink-50/40 dark:bg-rose-950/20 border-pink-200 dark:border-rose-900/30 opacity-90'
                              : 'bg-slate-50 dark:bg-rose-950/10 border-slate-200 dark:border-rose-900/20 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                              isCurrent ? 'bg-pink-500 text-white' : isReached ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-rose-950 text-slate-600'
                            }`}>
                              {stage.maxLevel}
                            </div>
                            <div>
                              <span className="text-xs font-black text-pink-600 dark:text-pink-300 block">
                                {stage.title}
                              </span>
                              <span className="text-[10px] text-pink-400 block">
                                Reached at Level {stage.maxLevel}
                              </span>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black uppercase">
                              Current Stage
                            </span>
                          )}
                          {isReached && !isCurrent && (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACHIEVEMENTS */}
            {activeTab === 'achievements' && (
              <div className="space-y-3">
                {/* Category filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {(['all', 'chat', 'streak', 'features', 'milestones'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all whitespace-nowrap ${
                        categoryFilter === cat
                          ? 'bg-pink-500 text-white shadow-xs'
                          : 'bg-pink-50 dark:bg-rose-950/40 border border-pink-100 dark:border-rose-900/30 text-pink-600 dark:text-rose-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Achievement Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredAchievements.map(ach => (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                        ach.unlocked
                          ? 'bg-gradient-to-tr from-pink-500/10 via-rose-500/5 to-purple-500/10 border-pink-300 dark:border-pink-800'
                          : 'bg-pink-50/30 dark:bg-rose-950/20 border-pink-100 dark:border-rose-900/20 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${
                          ach.unlocked ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white' : 'bg-slate-200 dark:bg-rose-900/40 text-slate-400'
                        }`}>
                          {ach.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-black text-pink-600 dark:text-pink-300 truncate">
                              {ach.title}
                            </h5>
                            {ach.unlocked ? (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> Unlocked
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-200 dark:bg-rose-950 text-slate-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Lock size={10} /> Locked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-pink-500/80 dark:text-rose-300/80 line-clamp-2 mt-0.5">
                            {ach.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar for achievements */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-pink-400 mb-1">
                          <span>Reward: {ach.reward}</span>
                          <span>{ach.progress} / {ach.maxProgress}</span>
                        </div>
                        <div className="w-full bg-pink-100 dark:bg-rose-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-pink-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.floor((ach.progress / ach.maxProgress) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: STREAK CALENDAR */}
            {activeTab === 'streak' && (
              <div className="space-y-4">
                {/* Top Streak Header */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <Flame size={28} className="text-amber-200 fill-amber-300 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-100 uppercase block">Active Streak</span>
                      <h3 className="text-xl font-black">{relationshipStats.streakDays} Days Together</h3>
                    </div>
                  </div>

                  <button
                    onClick={onCheckInDaily}
                    disabled={isTodayCheckedIn}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 ${
                      isTodayCheckedIn
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-white text-orange-600 hover:bg-amber-50 active:scale-95'
                    }`}
                  >
                    {isTodayCheckedIn ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Checked In Today (+50 XP)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Daily Check-In (+50 XP)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black text-pink-600 dark:text-pink-300 uppercase tracking-wider">
                      {monthName} {currentYear} Chat Calendar
                    </h4>
                    <span className="text-[11px] font-bold text-pink-400">
                      {progressStats.checkInHistory.length} Days Logged
                    </span>
                  </div>

                  {/* Days of week header */}
                  <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-pink-400 mb-2">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>

                  {/* Month Days Grid */}
                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {/* Blank padding days before first of month */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-9" />
                    ))}

                    {/* Days in month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isChecked = progressStats.checkInHistory.includes(dateStr);
                      const isToday = dayNum === today.getDate();

                      return (
                        <div
                          key={dayNum}
                          className={`h-9 rounded-xl flex items-center justify-center font-bold text-xs relative transition-all ${
                            isChecked
                              ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-sm'
                              : isToday
                              ? 'border-2 border-pink-500 text-pink-600 dark:text-pink-300 font-black'
                              : 'bg-white/60 dark:bg-rose-950/40 text-slate-500 dark:text-rose-400 border border-pink-100 dark:border-rose-900/20'
                          }`}
                        >
                          {isChecked ? (
                            <Heart size={16} fill="currentColor" className="text-white" />
                          ) : (
                            <span>{dayNum}</span>
                          )}
                          {isToday && !isChecked && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REWARDS */}
            {activeTab === 'rewards' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 border border-pink-200 dark:border-rose-900/40 text-xs text-pink-600 dark:text-pink-300 font-medium">
                  🎁 Unlock exclusive chat themes, profile avatar frames, stickers and special outfits as you level up and achieve milestones!
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unlockedRewards.map(rew => (
                    <div
                      key={rew.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        rew.unlocked
                          ? 'bg-white dark:bg-[#201015] border-pink-300 dark:border-rose-900/50 shadow-sm'
                          : 'bg-slate-50 dark:bg-rose-950/20 border-slate-200 dark:border-rose-900/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-rose-900/40 flex items-center justify-center text-xl">
                          {rew.icon}
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-pink-600 dark:text-pink-300">
                            {rew.name}
                          </h5>
                          <span className="text-[10px] text-pink-400 block">
                            {rew.description}
                          </span>
                        </div>
                      </div>

                      {rew.unlocked ? (
                        <button
                          onClick={() => {
                            if (rew.type === 'theme' && onSelectRewardTheme) onSelectRewardTheme(rew.id);
                            if (rew.type === 'frame' && onSelectFrame) onSelectFrame(rew.id);
                          }}
                          className="px-3 py-1 rounded-full bg-pink-500 text-white text-[11px] font-bold hover:bg-pink-600 transition-colors shadow-xs"
                        >
                          Equip
                        </button>
                      ) : (
                        <span className="p-1.5 rounded-full bg-slate-200 text-slate-500">
                          <Lock size={14} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: RELATIONSHIP STATISTICS */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center space-y-1">
                    <span className="text-xs font-bold text-pink-400 uppercase block">Total Messages</span>
                    <span className="text-xl font-black text-pink-600 dark:text-pink-300 block">
                      {progressStats.totalMessages}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center space-y-1">
                    <span className="text-xs font-bold text-pink-400 uppercase block">Chat Time</span>
                    <span className="text-xl font-black text-pink-600 dark:text-pink-300 block">
                      {progressStats.totalChatMinutes} mins
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center space-y-1">
                    <span className="text-xs font-bold text-pink-400 uppercase block">Days Together</span>
                    <span className="text-xl font-black text-pink-600 dark:text-pink-300 block">
                      {daysTogether} Days
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center space-y-1">
                    <span className="text-xs font-bold text-pink-400 uppercase block">Relationship Level</span>
                    <span className="text-xl font-black text-pink-600 dark:text-pink-300 block">
                      LVL {currentLevel}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center space-y-1">
                    <span className="text-xs font-bold text-pink-400 uppercase block">Favorite Language</span>
                    <span className="text-sm font-black text-pink-600 dark:text-pink-300 block truncate">
                      {progressStats.favoriteLanguage || 'English'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center space-y-1">
                    <span className="text-xs font-bold text-pink-400 uppercase block">Badges Unlocked</span>
                    <span className="text-xl font-black text-pink-600 dark:text-pink-300 block">
                      {totalUnlockedCount} / {achievements.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
