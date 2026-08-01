import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Share2, Copy, Trophy, Check, Sparkles, Clock, X, CheckCircle2, Crown, MessageSquare, Phone, Mic, Image } from 'lucide-react';
import { ReferralStats, ReferrerLeaderboardItem } from '../types';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralStats: ReferralStats;
  onSimulateReferralSignup: (friendName?: string) => void;
  onApplyReferralCode: (code: string) => { success: boolean; message: string };
  isDarkMode?: boolean;
}

const DEFAULT_LEADERBOARD: ReferrerLeaderboardItem[] = [
  { rank: 1, username: 'Alex_Love99', referralsCount: 42, rewardsEarnedDays: 42, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
  { rank: 2, username: 'RomanticSoul', referralsCount: 31, rewardsEarnedDays: 31, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  { rank: 3, username: 'Sweetheart2026', referralsCount: 25, rewardsEarnedDays: 25, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  { rank: 4, username: 'David_Suhona', referralsCount: 18, rewardsEarnedDays: 18, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
  { rank: 5, username: 'Emma_Hearts', referralsCount: 14, rewardsEarnedDays: 14, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
];

export default function ReferralModal({
  isOpen,
  onClose,
  referralStats,
  onSimulateReferralSignup,
  onApplyReferralCode,
  isDarkMode = false
}: ReferralModalProps) {
  const [activeTab, setActiveTab] = useState<'refer' | 'leaderboard' | 'history'>('refer');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [friendNameInput, setFriendNameInput] = useState('');
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [applyMessage, setApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const referralLink = `${window.location.origin}?ref=${referralStats.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralStats.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Suho-na AI Girlfriend',
          text: `Use my referral code ${referralStats.referralCode} to get 1 FREE PREMIUM DAY with Suho-na! 💕`,
          url: referralLink,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleApplyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputReferralCode.trim()) return;
    const res = onApplyReferralCode(inputReferralCode.trim());
    setApplyMessage({
      type: res.success ? 'success' : 'error',
      text: res.message
    });
    if (res.success) setInputReferralCode('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative max-w-xl w-full rounded-3xl shadow-2xl border p-5 sm:p-7 my-6 overflow-hidden max-h-[90vh] flex flex-col ${
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

          {/* Banner Header */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl mb-4 flex-shrink-0 relative overflow-hidden">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Crown size={28} className="text-amber-300 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-200 block">
                Referral & Rewards Program
              </span>
              <h3 className="text-lg font-black tracking-tight text-white">
                Invite Friends, Get Free Premium! 👑
              </h3>
              <p className="text-xs text-pink-100 font-bold mt-0.5">
                1 Successful Referral = 1 Premium Day
              </p>
            </div>
          </div>

          {/* Overview Stat Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
            <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center">
              <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
                Total Referrals
              </span>
              <span className="text-2xl font-black text-pink-600 dark:text-pink-300">
                {referralStats.totalReferrals}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 text-center">
              <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
                Premium Days Earned
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{referralStats.totalRewardsDays} Days
              </span>
            </div>
          </div>

          {/* Premium Day Features Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-rose-500/10 border border-amber-300/40 dark:border-amber-700/40 mb-4 flex-shrink-0 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-300 flex items-center gap-1">
              <Crown size={14} className="text-amber-500" /> Premium Day Includes:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-700 dark:text-rose-100">
              <div className="flex items-center gap-1.5"><MessageSquare size={13} className="text-pink-500" /> Unlimited Chat</div>
              <div className="flex items-center gap-1.5"><Phone size={13} className="text-emerald-500" /> Unlimited Voice Calls</div>
              <div className="flex items-center gap-1.5"><Mic size={13} className="text-purple-500" /> Unlimited Voice Messages</div>
              <div className="flex items-center gap-1.5"><Image size={13} className="text-blue-500" /> Unlimited AI Photos</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-pink-50 dark:bg-rose-950/40 p-1 rounded-2xl mb-4 border border-pink-100 dark:border-rose-900/30 flex-shrink-0">
            <button
              onClick={() => setActiveTab('refer')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'refer' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <Share2 size={14} />
              <span>Refer Friends</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'leaderboard' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <Trophy size={14} />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'history' ? 'bg-pink-500 text-white shadow-md' : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              <Clock size={14} />
              <span>Rewards History</span>
            </button>
          </div>

          {/* TAB 1: REFER FRIENDS */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {activeTab === 'refer' && (
              <div className="space-y-4">
                {/* Unique Code Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-pink-500/10 via-rose-500/5 to-purple-500/10 border border-pink-200 dark:border-rose-900/40 space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-300 block">
                    Your Unique Referral Code
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-[#201015] border-2 border-dashed border-pink-300 dark:border-rose-800 font-mono font-black text-lg text-pink-600 dark:text-pink-300 tracking-wider text-center select-all">
                      {referralStats.referralCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Share Referral Link Button */}
                <button
                  onClick={handleShareLink}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-black text-sm shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  <span>{copiedLink ? 'Link Copied to Clipboard! 🎉' : 'Share Referral Link'}</span>
                </button>

                {/* Have a referral code from a friend? */}
                <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-rose-950/30 border border-pink-100 dark:border-rose-900/30 space-y-2">
                  <span className="text-xs font-bold text-pink-600 dark:text-pink-300 block">
                    Have a Friend's Referral Code?
                  </span>
                  <form onSubmit={handleApplyCodeSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Referral Code (e.g. SUHONA-123)"
                      value={inputReferralCode}
                      onChange={(e) => setInputReferralCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-pink-200 text-xs font-bold uppercase focus:ring-1 focus:ring-pink-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition-colors"
                    >
                      Redeem
                    </button>
                  </form>
                  {applyMessage && (
                    <p className={`text-xs font-bold ${applyMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {applyMessage.text}
                    </p>
                  )}
                </div>

                {/* Demo / Testing: Simulate Friend Referral */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                    <Sparkles size={14} />
                    <span>Test Referral Reward Signup</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Simulate a friend signing up with your referral code to instantly test receiving +1 Premium Day!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Friend's Name (e.g. Maya)"
                      value={friendNameInput}
                      onChange={(e) => setFriendNameInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onSimulateReferralSignup(friendNameInput.trim() || undefined);
                        setFriendNameInput('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors shadow-xs"
                    >
                      Simulate Signup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-3">
                <div className="text-center space-y-1 mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-300">
                    🏆 Top Referrers Leaderboard
                  </h4>
                  <p className="text-[11px] text-pink-400">
                    Top community members who invited the most friends!
                  </p>
                </div>

                <div className="space-y-2">
                  {DEFAULT_LEADERBOARD.map((item) => (
                    <div
                      key={item.rank}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        item.rank === 1
                          ? 'bg-gradient-to-r from-amber-400/20 via-pink-500/15 to-amber-400/20 border-amber-300'
                          : item.rank === 2
                          ? 'bg-slate-100 dark:bg-rose-950/30 border-slate-300 dark:border-rose-900/40'
                          : item.rank === 3
                          ? 'bg-amber-100/40 dark:bg-rose-950/20 border-amber-200 dark:border-rose-900/30'
                          : 'bg-white dark:bg-[#201014] border-pink-100 dark:border-rose-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          item.rank === 1 ? 'bg-amber-400 text-slate-900' : item.rank === 2 ? 'bg-slate-300 text-slate-800' : item.rank === 3 ? 'bg-amber-600 text-white' : 'bg-pink-100 text-pink-600'
                        }`}>
                          #{item.rank}
                        </span>
                        <img
                          src={item.avatar}
                          alt={item.username}
                          className="w-8 h-8 rounded-full object-cover border border-pink-200"
                        />
                        <div>
                          <span className="text-xs font-black text-pink-600 dark:text-pink-300 block">
                            {item.username}
                          </span>
                          <span className="text-[10px] text-pink-400 block">
                            {item.referralsCount} Successful Invites
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                          +{item.rewardsEarnedDays} Premium Days
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Free Rewards
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REWARDS HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-300 mb-2">
                  Referral Rewards History
                </h4>

                {referralStats.history.length === 0 ? (
                  <div className="p-8 text-center bg-pink-50/40 dark:bg-rose-950/20 rounded-2xl border border-pink-100 dark:border-rose-900/20 space-y-2">
                    <Gift size={32} className="mx-auto text-pink-300" />
                    <p className="text-xs text-pink-500 font-bold">No referrals yet!</p>
                    <p className="text-[11px] text-pink-400">
                      Share your code with friends to start earning 1 Premium Day per invite.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {referralStats.history.map((record) => (
                      <div
                        key={record.id}
                        className="p-3.5 rounded-2xl border border-pink-100 dark:border-rose-900/30 bg-white dark:bg-[#201015] flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-pink-100 dark:bg-rose-900/40 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold text-xs">
                            🎁
                          </div>
                          <div>
                            <span className="text-xs font-black text-pink-600 dark:text-pink-300 block">
                              Referred: {record.referredUsername}
                            </span>
                            <span className="text-[10px] text-pink-400 block">
                              {record.date}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                            {record.rewardEarned}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-extrabold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> {record.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
