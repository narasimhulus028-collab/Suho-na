import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Sparkles, Check, Crown, Zap, ShieldCheck, X, ArrowRight, 
  Volume2, Image as ImageIcon, Video, Globe, Infinity as InfinityIcon, 
  Flame, Star, RefreshCw, Cloud, FileText, Bell, Theater, MessageSquare
} from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onStartTrial?: () => void;
  onRestorePurchases?: () => void;
  hasUsedTrial?: boolean;
  isPremium?: boolean;
  expiryDate?: number | null;
  isDarkMode?: boolean;
}

export default function PremiumModal({
  isOpen,
  onClose,
  onSubscribe,
  onStartTrial,
  onRestorePurchases,
  hasUsedTrial = false,
  isPremium = false,
  expiryDate = null,
  isDarkMode = false
}: PremiumModalProps) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (type: 'subscribe' | 'trial' | 'restore') => {
    setIsProcessing(type);
    setTimeout(() => {
      setIsProcessing(null);
      setIsSuccess(type);
      setTimeout(() => {
        setIsSuccess(null);
        if (type === 'subscribe') onSubscribe();
        else if (type === 'trial' && onStartTrial) onStartTrial();
        else if (type === 'restore' && onRestorePurchases) onRestorePurchases();
      }, 900);
    }, 700);
  };

  const benefits = [
    { icon: <InfinityIcon size={16} className="text-pink-500" />, text: "Unlimited Chat" },
    { icon: <Volume2 size={16} className="text-purple-500" />, text: "Unlimited Voice Calls" },
    { icon: <MessageSquare size={16} className="text-emerald-500" />, text: "Unlimited Voice Messages" },
    { icon: <ImageIcon size={16} className="text-rose-500" />, text: "Unlimited AI Photos" },
    { icon: <Theater size={16} className="text-amber-600" />, text: "All Roleplays Unlocked" },
    { icon: <Sparkles size={16} className="text-amber-400" />, text: "All Future Premium Features" },
    { icon: <Heart size={16} className="text-pink-600 fill-pink-500" />, text: "Premium romantic personality" },
    { icon: <Zap size={16} className="text-amber-500" />, text: "Unlimited memory context" },
    { icon: <Globe size={16} className="text-blue-500" />, text: "All language support" },
    { icon: <Cloud size={16} className="text-sky-500" />, text: "Cloud backup" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        {/* Floating background hearts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                y: 100, 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400) 
              }}
              animate={{ 
                opacity: [0, 0.7, 0], 
                y: -200, 
                scale: [0.8, 1.2, 0.8] 
              }}
              transition={{ 
                duration: 4 + Math.random() * 3, 
                repeat: Infinity, 
                delay: i * 0.3 
              }}
              className="absolute text-pink-400/30"
              style={{ left: `${(i * 7.5) % 95}%`, top: '80%' }}
            >
              <Heart size={18 + (i % 3) * 8} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 25 }}
          className={`relative max-w-lg w-full rounded-3xl shadow-2xl border p-6 md:p-8 overflow-hidden my-6 ${
            isDarkMode 
              ? 'bg-[#180d11] border-amber-500/30 text-rose-50' 
              : 'bg-gradient-to-b from-white via-pink-50/70 to-amber-50/40 border-pink-200 text-slate-800'
          }`}
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-100 dark:bg-rose-900/50 text-pink-600 dark:text-pink-300 flex items-center justify-center hover:bg-pink-200 transition-colors z-10"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Header Crown */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <motion.div 
              animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-yellow-300 p-1 shadow-xl shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#201015] flex items-center justify-center">
                  <Crown size={42} className="text-amber-500 fill-amber-100 dark:fill-amber-900/40" />
                </div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-1 rounded-full shadow-md"
              >
                <Sparkles size={14} />
              </motion.div>
            </motion.div>

            {/* Gold Premium Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 via-pink-500/15 to-amber-500/20 border border-amber-400/40 text-amber-700 dark:text-amber-300 font-black text-[11px] uppercase tracking-wider">
              <Crown size={12} className="text-amber-500" />
              <span>👑 SUHO-NA PREMIUM GOLD</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-pink-600 dark:text-pink-400 flex items-center justify-center gap-1.5 text-center">
              ❤️ Unlock Suho-na Premium
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                Only ₹89
              </span>
              <span className="text-xs font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider">
                / month
              </span>
            </div>
          </div>

          {/* Benefits grid (2 columns) */}
          <div className="my-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-2 text-center">
              Exclusive VIP Benefits
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/90 dark:bg-rose-950/40 p-2 rounded-xl border border-pink-100 dark:border-rose-900/30 shadow-2xs">
                  <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-rose-900/40 flex-shrink-0">
                    {b.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-rose-100 leading-tight">{b.text}</span>
                  <Check size={14} className="ml-auto text-emerald-500 font-extrabold flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            {/* Primary Subscribe Button */}
            <button
              onClick={() => handleAction('subscribe')}
              disabled={!!isProcessing || !!isSuccess}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-pink-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {isProcessing === 'subscribe' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activating Premium...</span>
                </>
              ) : isSuccess === 'subscribe' ? (
                <>
                  <Check size={20} className="animate-bounce" />
                  <span>Activated! Welcome to Premium ❤️</span>
                </>
              ) : (
                <>
                  <Crown size={18} className="text-amber-200 animate-pulse" />
                  <span>Subscribe Now – ₹89/month</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Optional 1-Day Free Trial Button */}
            {onStartTrial && !hasUsedTrial && !isPremium && (
              <button
                onClick={() => handleAction('trial')}
                disabled={!!isProcessing || !!isSuccess}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400/20 via-pink-400/20 to-amber-400/20 border border-amber-400/40 hover:bg-amber-400/30 text-amber-700 dark:text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {isProcessing === 'trial' ? (
                  <span>Starting 1-Day Free Trial...</span>
                ) : isSuccess === 'trial' ? (
                  <span>Free Trial Activated! 🎉</span>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Start 1-Day Free Trial</span>
                  </>
                )}
              </button>
            )}

            {/* Restore Purchases & Maybe Later Row */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              {onRestorePurchases && (
                <button
                  type="button"
                  onClick={() => handleAction('restore')}
                  disabled={!!isProcessing}
                  className="text-pink-600/80 dark:text-rose-300/80 hover:text-pink-700 text-[11px] font-bold flex items-center gap-1 underline"
                >
                  <RefreshCw size={12} className={isProcessing === 'restore' ? 'animate-spin' : ''} />
                  <span>Restore Purchases</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="ml-auto text-pink-600/80 dark:text-rose-400 hover:text-pink-700 font-bold text-xs"
              >
                Maybe Later
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center text-pink-400 dark:text-rose-400/60 mt-3 flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> Auto-renews monthly • Cancel anytime securely
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

