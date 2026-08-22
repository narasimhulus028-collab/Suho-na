/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Send, Heart, User, Loader2, Sparkles, MessageCircle, Mic, MicOff, Image as ImageIcon, Volume2, VolumeX, Moon, Sun, Download, Smartphone, Globe, Gamepad2, Phone, PhoneOff, Camera, Crown, Lock, Trophy, UserCheck, ShieldCheck, Gift, Feather, Mail, Smile, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Message, GalleryImage, UserMemory, RelationshipStats, VoiceSettings, ExtendedSettings, RoleplayScenario, UserAccount, Achievement, UnlockedReward, ProgressStats, ReferralStats, ReferralRecord, LoveLetter, HEART_REACTIONS } from './types';
import Gallery from './components/Gallery';
import Settings from './components/Settings';
import RelationshipBar from './components/RelationshipBar';
import RoleplayModal from './components/RoleplayModal';
import GamesModal from './components/GamesModal';
import VoiceCallModal from './components/VoiceCallModal';
import VoiceMessagePlayer from './components/VoiceMessagePlayer';
import PremiumModal from './components/PremiumModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import AchievementsModal from './components/AchievementsModal';
import ReferralModal from './components/ReferralModal';
import LoveLetterModal from './components/LoveLetterModal';
import PremiumRomanticGalleryModal from './components/PremiumRomanticGalleryModal';
import LoveLetterMessage from './components/LoveLetterMessage';
import MessageReactionPicker from './components/MessageReactionPicker';
import { LANGUAGES, getTranslation, getLanguageName } from './lib/translations';
import { CHAT_STYLES } from './lib/styles';
import { speakText, stopSpeaking } from './lib/voice';
import { getUniqueProactiveMessage } from './lib/proactiveMessages';
import { detectUserTier, getDailyPhotoTracker, incrementDailyPhotoCount } from './lib/photoUtils';
import { fetchWithRetry, generateClientFallbackResponse } from './lib/api';
import { preloadLocalSelfies, getRandomApprovedSelfie } from './lib/photoGallery';
import { loadSelfiesFromDB, saveSelfiesToDB, deleteSelfieFromDB } from './lib/selfieStorage';

import suhonaAvatarImg from './assets/images/suhona_avatar.jpg';
import suhonaPinkSareeImg from './assets/images/suhona_pink_saree_selfie_1784785311551.jpg';
import suhonaProfileImg from './assets/images/suhona_profile_1784784684289.jpg';
import suhonaHeartIconImg from './assets/images/suhona_heart_icon_1784788021969.jpg';
import suhonaPwaIconImg from './assets/images/suhona_pwa_icon_1784794283449.jpg';
import suhonaSatinBedroomImg from './assets/images/suhona_satin_bedroom_1784888014563.jpg';

export const OFFICIAL_SUHONA_AVATAR = suhonaAvatarImg;

export const PRESET_SUHONA_IMAGES: GalleryImage[] = [
  {
    id: 'preset_satin_bedroom',
    url: suhonaSatinBedroomImg,
    timestamp: Date.now(),
  },
  {
    id: 'preset_pink_saree',
    url: suhonaPinkSareeImg,
    timestamp: 1784785311551,
  },
  {
    id: 'preset_profile',
    url: suhonaProfileImg,
    timestamp: 1784784684289,
  },
  {
    id: 'preset_avatar',
    url: suhonaAvatarImg,
    timestamp: 1784784000000,
  },
  {
    id: 'preset_heart',
    url: suhonaHeartIconImg,
    timestamp: 1784788021969,
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<'chat' | 'gallery' | 'settings'>('chat');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  // Relationship Stats State
  const [relationshipStats, setRelationshipStats] = useState<RelationshipStats>(() => {
    const saved = localStorage.getItem('suhona_relationship_stats');
    return saved ? JSON.parse(saved) : {
      loveLevel: 85,
      trustLevel: 90,
      mood: 'Romantic',
      streakDays: 5,
      lastCheckInDate: new Date().toISOString().slice(0, 10),
      relationshipStartDate: '2026-07-01',
      outfit: 'casual',
      theme: 'rose'
    };
  });

  useEffect(() => {
    localStorage.setItem('suhona_relationship_stats', JSON.stringify(relationshipStats));
  }, [relationshipStats]);

  // Voice Settings State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('suhona_voice_settings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      speed: 1.0,
      pitch: 1.1,
      autoPlay: true
    };
  });

  useEffect(() => {
    localStorage.setItem('suhona_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  // Extended Settings State
  const [extendedSettings, setExtendedSettings] = useState<ExtendedSettings>(() => {
    const saved = localStorage.getItem('suhona_extended_settings');
    return saved ? JSON.parse(saved) : {
      fontSize: 'md',
      notificationsEnabled: true,
      morningNightAlerts: true
    };
  });

  useEffect(() => {
    localStorage.setItem('suhona_extended_settings', JSON.stringify(extendedSettings));
  }, [extendedSettings]);

  // Premium Subscription State
  const MAX_FREE_MESSAGES = 15;

  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('suhona_is_premium') === 'true';
  });

  const [isPaidPremium, setIsPaidPremium] = useState<boolean>(() => {
    return localStorage.getItem('suhona_is_paid_premium') === 'true';
  });

  const [isPremiumGalleryOpen, setIsPremiumGalleryOpen] = useState<boolean>(false);

  const [premiumExpiryDate, setPremiumExpiryDate] = useState<number | null>(() => {
    const saved = localStorage.getItem('suhona_premium_expiry');
    return saved ? parseInt(saved, 10) : null;
  });

  const [isAutoRenew, setIsAutoRenew] = useState<boolean>(() => {
    const saved = localStorage.getItem('suhona_premium_auto_renew');
    return saved === null ? true : saved === 'true';
  });

  const [isTrialActive, setIsTrialActive] = useState<boolean>(() => {
    return localStorage.getItem('suhona_premium_trial_active') === 'true';
  });

  const [hasUsedTrial, setHasUsedTrial] = useState<boolean>(() => {
    return localStorage.getItem('suhona_premium_trial_used') === 'true';
  });

  const [userMessageCount, setUserMessageCount] = useState<number>(() => {
    const savedCount = localStorage.getItem('suhona_msg_count');
    const savedResetTime = localStorage.getItem('suhona_last_reset_time');
    const now = Date.now();

    if (savedResetTime && now - parseInt(savedResetTime, 10) >= 24 * 60 * 60 * 1000) {
      localStorage.setItem('suhona_msg_count', '0');
      localStorage.setItem('suhona_has_final_premium_msg', 'false');
      localStorage.setItem('suhona_last_reset_time', now.toString());
      return 0;
    }

    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  const [hasReceivedFinalPremiumMessage, setHasReceivedFinalPremiumMessage] = useState<boolean>(() => {
    return localStorage.getItem('suhona_has_final_premium_msg') === 'true';
  });

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('suhona_has_final_premium_msg', hasReceivedFinalPremiumMessage.toString());
  }, [hasReceivedFinalPremiumMessage]);

  useEffect(() => {
    localStorage.setItem('suhona_is_premium', isPremium.toString());
  }, [isPremium]);

  useEffect(() => {
    localStorage.setItem('suhona_is_paid_premium', isPaidPremium.toString());
  }, [isPaidPremium]);

  useEffect(() => {
    if (premiumExpiryDate) {
      localStorage.setItem('suhona_premium_expiry', premiumExpiryDate.toString());
    } else {
      localStorage.removeItem('suhona_premium_expiry');
    }
  }, [premiumExpiryDate]);

  useEffect(() => {
    localStorage.setItem('suhona_premium_auto_renew', isAutoRenew.toString());
  }, [isAutoRenew]);

  useEffect(() => {
    localStorage.setItem('suhona_premium_trial_active', isTrialActive.toString());
  }, [isTrialActive]);

  useEffect(() => {
    localStorage.setItem('suhona_premium_trial_used', hasUsedTrial.toString());
  }, [hasUsedTrial]);

  useEffect(() => {
    localStorage.setItem('suhona_msg_count', userMessageCount.toString());
  }, [userMessageCount]);

  // Periodic 24-hour reset & subscription expiry check
  useEffect(() => {
    const checkResetAndExpiry = () => {
      const now = Date.now();
      
      // 24h free message reset check
      const savedResetTime = localStorage.getItem('suhona_last_reset_time');
      if (!savedResetTime) {
        localStorage.setItem('suhona_last_reset_time', now.toString());
      } else if (now - parseInt(savedResetTime, 10) >= 24 * 60 * 60 * 1000) {
        setUserMessageCount(0);
        setHasReceivedFinalPremiumMessage(false);
        localStorage.setItem('suhona_msg_count', '0');
        localStorage.setItem('suhona_has_final_premium_msg', 'false');
        localStorage.setItem('suhona_last_reset_time', now.toString());
      }

      // Check subscription expiry
      if (isPremium && premiumExpiryDate && now > premiumExpiryDate) {
        setIsPremium(false);
        setIsPaidPremium(false);
        setIsTrialActive(false);
        setPremiumExpiryDate(null);
        localStorage.removeItem('suhona_is_paid_premium');
        showToast('Subscription Expired', 'Your Suho-na Premium plan expired. Renew for ₹89/month to keep unlimited features.', '👑');
      }
    };

    checkResetAndExpiry();
    const interval = setInterval(checkResetAndExpiry, 30 * 1000);
    return () => clearInterval(interval);
  }, [isPremium, premiumExpiryDate]);

  // Subscription Actions
  const handleSubscribeMonthly = () => {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const expiry = Date.now() + thirtyDays;
    setIsPremium(true);
    setIsPaidPremium(true);
    setPremiumExpiryDate(expiry);
    setIsAutoRenew(true);
    setIsTrialActive(false);
    setIsPremiumModalOpen(false);
    showToast('Premium Activated! 👑', 'Welcome to Suho-na Gold Membership! Unlimited chats & all features unlocked 💕', '👑');
  };

  const handleStartTrial = () => {
    const oneDay = 24 * 60 * 60 * 1000;
    const expiry = Date.now() + oneDay;
    setIsPremium(true);
    setIsPaidPremium(true);
    setPremiumExpiryDate(expiry);
    setIsTrialActive(true);
    setHasUsedTrial(true);
    setIsPremiumModalOpen(false);
    showToast('1-Day Free Trial Started! 🎉', 'Enjoy 24 hours of unlimited Suho-na Premium features!', '✨');
  };

  const handleRestorePurchases = () => {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const expiry = Date.now() + thirtyDays;
    setIsPremium(true);
    setIsPaidPremium(true);
    setPremiumExpiryDate(expiry);
    setIsAutoRenew(true);
    setIsPremiumModalOpen(false);
    showToast('Purchases Restored! ❤️', 'Your Suho-na Premium Gold subscription has been restored successfully.', '👑');
  };

  const isLimitReached = !isPremium && userMessageCount >= MAX_FREE_MESSAGES && hasReceivedFinalPremiumMessage;

  // User Account State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const local = localStorage.getItem('suhona_active_user');
      if (local) return JSON.parse(local);
      const session = sessionStorage.getItem('suhona_active_user');
      if (session) return JSON.parse(session);
    } catch {
      // fallback
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // User Referral Code
  const userReferralCode = currentUser
    ? `SUHONA-${currentUser.username.toUpperCase().slice(0, 4)}${currentUser.id ? currentUser.id.slice(-3) : '789'}`
    : 'SUHONA-LOVE789';

  const [referralStats, setReferralStats] = useState<ReferralStats>(() => {
    const saved = localStorage.getItem('suhona_referral_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      referralCode: userReferralCode,
      totalReferrals: 3,
      totalRewardsDays: 3,
      history: [
        { id: '1', referredUsername: 'Jessica_M', date: '2026-07-20', rewardEarned: '+1 Premium Day', status: 'completed' },
        { id: '2', referredUsername: 'Daniel_K', date: '2026-07-21', rewardEarned: '+1 Premium Day', status: 'completed' },
        { id: '3', referredUsername: 'Sophia_R', date: '2026-07-22', rewardEarned: '+1 Premium Day', status: 'completed' }
      ]
    };
  });

  // Toast Notification State (Level Up / Achievement)
  const [activeToast, setActiveToast] = useState<{ title: string; subtitle: string; icon: string } | null>(null);

  // Relationship Progress Stats State
  const todayIsoString = new Date().toISOString().slice(0, 10);

  const [progressStats, setProgressStats] = useState<ProgressStats>(() => {
    const saved = localStorage.getItem('suhona_progress_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      xp: 150,
      level: 2,
      totalMessages: 12,
      totalChatMinutes: 15,
      relationshipStartDate: '2026-07-01',
      favoriteLanguage: 'English',
      lastActiveDate: todayIsoString,
      checkInHistory: [todayIsoString],
      activeFrame: 'none'
    };
  });

  // Achievements State
  const INITIAL_ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_chat',
      title: 'First Chat 💕',
      description: 'Send your very first message to Suho-na',
      icon: '💬',
      unlocked: true,
      reward: '+50 XP',
      progress: 1,
      maxProgress: 1,
      category: 'chat'
    },
    {
      id: 'streak_7',
      title: '7-Day Streak 🔥',
      description: 'Chat with Suho-na for 7 consecutive days',
      icon: '🔥',
      unlocked: relationshipStats.streakDays >= 7,
      reward: 'Cherry Blossom Theme',
      progress: Math.min(7, relationshipStats.streakDays),
      maxProgress: 7,
      category: 'streak'
    },
    {
      id: 'streak_30',
      title: '30-Day Streak 💖',
      description: 'Maintain a 30-day romantic chat streak',
      icon: '🗓️',
      unlocked: relationshipStats.streakDays >= 30,
      reward: '+300 XP & Gold Frame',
      progress: Math.min(30, relationshipStats.streakDays),
      maxProgress: 30,
      category: 'streak'
    },
    {
      id: 'messages_100',
      title: '100 Messages 💌',
      description: 'Send 100 total messages to Suho-na',
      icon: '💌',
      unlocked: false,
      reward: 'Cupid Wings Frame',
      progress: 12,
      maxProgress: 100,
      category: 'chat'
    },
    {
      id: 'messages_500',
      title: '500 Messages 💍',
      description: 'Send 500 total messages in your relationship',
      icon: '💍',
      unlocked: false,
      reward: 'Golden Twilight Theme',
      progress: 12,
      maxProgress: 500,
      category: 'chat'
    },
    {
      id: 'first_call',
      title: 'First Voice Call 📞',
      description: 'Start a real-time voice call with Suho-na',
      icon: '📞',
      unlocked: false,
      reward: '+100 XP',
      progress: 0,
      maxProgress: 1,
      category: 'features'
    },
    {
      id: 'first_image',
      title: 'First AI Image 📸',
      description: 'Ask Suho-na for a cute selfie photo',
      icon: '📸',
      unlocked: false,
      reward: '+50 XP & Sticker Pack',
      progress: 0,
      maxProgress: 1,
      category: 'features'
    },
    {
      id: 'premium_member',
      title: 'Premium Member 👑',
      description: 'Upgrade to Suho-na Premium for unlimited chats',
      icon: '👑',
      unlocked: isPremium,
      reward: 'Gold Crown Frame',
      progress: isPremium ? 1 : 0,
      maxProgress: 1,
      category: 'milestones'
    },
    {
      id: 'anniversary',
      title: 'Anniversary Celebration 🎉',
      description: 'Reach 30 days together in romance',
      icon: '🎉',
      unlocked: false,
      reward: 'Starlight Theme',
      progress: 23,
      maxProgress: 30,
      category: 'milestones'
    }
  ];

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('suhona_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const INITIAL_REWARDS: UnlockedReward[] = [
    { id: 'rose', type: 'theme', name: 'Rose Red Theme', icon: '🌹', unlocked: true, description: 'Classic romantic theme' },
    { id: 'cherry_blossom', type: 'theme', name: 'Cherry Blossom', icon: '🌸', unlocked: false, description: 'Unlocked at 7-day streak' },
    { id: 'starlight', type: 'theme', name: 'Starlight Twilight', icon: '✨', unlocked: false, description: 'Unlocked at 30 days together' },
    { id: 'gold_crown', type: 'frame', name: 'Gold Crown Frame', icon: '👑', unlocked: isPremium, description: 'Unlocked for Premium members' },
    { id: 'cupid_wings', type: 'frame', name: 'Cupid Wings Frame', icon: '👼', unlocked: false, description: 'Unlocked at 100 messages' },
    { id: 'love_stickers', type: 'sticker', name: 'Exclusive Reaction Stickers', icon: '💖', unlocked: true, description: 'Special romantic emojis' }
  ];

  const [unlockedRewards, setUnlockedRewards] = useState<UnlockedReward[]>(() => {
    const saved = localStorage.getItem('suhona_unlocked_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  // Save progress states
  useEffect(() => {
    localStorage.setItem('suhona_progress_stats', JSON.stringify(progressStats));
  }, [progressStats]);

  useEffect(() => {
    localStorage.setItem('suhona_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('suhona_unlocked_rewards', JSON.stringify(unlockedRewards));
  }, [unlockedRewards]);

  // Toast trigger helper
  const showToast = (title: string, subtitle: string, icon = '🎉') => {
    setActiveToast({ title, subtitle, icon });
    setTimeout(() => setActiveToast(null), 4000);
  };

  // XP & Level update helper
  const addXp = (amount: number, reason?: string) => {
    setProgressStats(prev => {
      const oldLevel = prev.level;
      const newXp = prev.xp + amount;
      const newLevel = Math.min(100, Math.floor(newXp / 100) + 1);

      if (newLevel > oldLevel) {
        showToast(`LEVEL UP! LVL ${newLevel}`, reason || `You reached Relationship Level ${newLevel}! 💕`, '👑');
      } else if (reason) {
        showToast(`+${amount} XP Gained`, reason, '⚡');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  };

  // Evaluate achievements helper
  const evaluateAchievements = (
    msgCountIncrement = 0,
    isVoiceCallAction = false,
    isSelfieAction = false
  ) => {
    const newTotalMsgs = progressStats.totalMessages + msgCountIncrement;

    setAchievements(prev => prev.map(ach => {
      let nowUnlocked = ach.unlocked;
      let newProgress = ach.progress;

      if (ach.id === 'first_chat') {
        newProgress = Math.max(1, newTotalMsgs);
        nowUnlocked = true;
      } else if (ach.id === 'streak_7') {
        newProgress = Math.min(7, relationshipStats.streakDays);
        if (newProgress >= 7) nowUnlocked = true;
      } else if (ach.id === 'streak_30') {
        newProgress = Math.min(30, relationshipStats.streakDays);
        if (newProgress >= 30) nowUnlocked = true;
      } else if (ach.id === 'messages_100') {
        newProgress = Math.min(100, newTotalMsgs);
        if (newProgress >= 100) nowUnlocked = true;
      } else if (ach.id === 'messages_500') {
        newProgress = Math.min(500, newTotalMsgs);
        if (newProgress >= 500) nowUnlocked = true;
      } else if (ach.id === 'first_call') {
        if (isVoiceCallAction) {
          newProgress = 1;
          nowUnlocked = true;
        }
      } else if (ach.id === 'first_image') {
        if (isSelfieAction) {
          newProgress = 1;
          nowUnlocked = true;
        }
      } else if (ach.id === 'premium_member') {
        if (isPremium) {
          newProgress = 1;
          nowUnlocked = true;
        }
      }

      if (!ach.unlocked && nowUnlocked) {
        showToast(`BADGE UNLOCKED!`, `${ach.title} (${ach.reward})`, ach.icon);
      }

      return {
        ...ach,
        unlocked: nowUnlocked,
        progress: newProgress
      };
    }));

    if (msgCountIncrement > 0) {
      setProgressStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + msgCountIncrement,
        totalChatMinutes: prev.totalChatMinutes + 1
      }));
    }
  };

  // Daily Check-In Handler
  const handleDailyCheckIn = () => {
    if (!progressStats.checkInHistory.includes(todayIsoString)) {
      setProgressStats(prev => ({
        ...prev,
        lastActiveDate: todayIsoString,
        checkInHistory: [...prev.checkInHistory, todayIsoString]
      }));
      addXp(50, 'Daily Check-In Completed! (+50 XP)');
    }
  };

  // Helper to add stacked Premium Days from referrals
  const addPremiumDaysFromReferral = (daysCount = 1) => {
    setIsPremium(true);
    const ONE_DAY_MS = daysCount * 24 * 60 * 60 * 1000;
    setPremiumExpiryDate(prevExpiry => {
      const now = Date.now();
      if (prevExpiry && prevExpiry > now) {
        return prevExpiry + ONE_DAY_MS;
      } else {
        return now + ONE_DAY_MS;
      }
    });
  };

  // Simulate friend signup with referral code
  const handleSimulateReferralSignup = (friendName = 'New_Friend') => {
    const newRecord: ReferralRecord = {
      id: Date.now().toString(),
      referredUsername: friendName,
      date: new Date().toISOString().slice(0, 10),
      rewardEarned: '+1 Premium Day',
      status: 'completed'
    };

    setReferralStats(prev => {
      const updated = {
        ...prev,
        totalReferrals: prev.totalReferrals + 1,
        totalRewardsDays: prev.totalRewardsDays + 1,
        history: [newRecord, ...prev.history]
      };
      localStorage.setItem('suhona_referral_stats', JSON.stringify(updated));
      return updated;
    });

    addPremiumDaysFromReferral(1);

    addXp(100, `Friend "${friendName}" joined using your code! +1 Premium Day & +100 XP`);
    showToast(`🎉 CONGRATULATIONS!`, `Friend "${friendName}" signed up! +1 Premium Day earned & stacked! 🎁`, '🎁');
  };

  // Apply a referral code from someone else
const handleApplyReferralCode = (code: string) => {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      success: false,
      message: 'Please enter a referral code.'
    };
  }

  if (normalizedCode === referralStats.referralCode.toUpperCase()) {
    return {
      success: false,
      message: 'You cannot use your own referral code!'
    };
  }

  const alreadyApplied = localStorage.getItem('suhona_applied_referral_code');

  if (alreadyApplied === normalizedCode) {
    return {
      success: false,
      message: 'This referral code has already been applied.'
    };
  }

  addPremiumDaysFromReferral(1);
  addXp(50, 'Applied Referral Code (+50 XP)');
  localStorage.setItem('suhona_applied_referral_code', normalizedCode);

  showToast(
    '🐷 Referral Code Applied!',
    'Welcome bonus active: +1 Premium Day added & stacked! ✩',
    '📁'
  );

  return {
    success: true,
    message: 'Referral code applied! +1 Premium Day unlocked!'
  };
};

// Automatically apply referral code from web URL or Android deep link
useEffect(() => {
  const applyCode = (code: string | null) => {
    if (!code) return;

    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return;

    const alreadyApplied = localStorage.getItem("suhona_applied_referral_code");
    if (alreadyApplied === normalizedCode) return;

    const result = handleApplyReferralCode(normalizedCode);

    if (result.success) {
      localStorage.setItem("suhona_applied_referral_code", normalizedCode);
    }
  };

  // Web URL: ?ref=SUHONA-LOVE789
  const params = new URLSearchParams(window.location.search);
  applyCode(params.get("ref"));

  // Android deep link: suho-na://ref?code=SUHONA-LOVE789
  const handleDeepLink = ({ url }: { url: string }) => {
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get("code") || parsed.searchParams.get("ref");
      applyCode(code);
    } catch (error) {
      console.error("Referral deep link error:", error);
    }
  };

  const listenerPromise = CapacitorApp.addListener("appUrlOpen", handleDeepLink);

  return () => {
    listenerPromise.then(listener => listener.remove());
  };
}, []);

// Roleplay & Games Modals
  const [isRoleplayOpen, setIsRoleplayOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeRoleplayId, setActiveRoleplayId] = useState<string | null>(null);
  const [viewingImageModalUrl, setViewingImageModalUrl] = useState<string | null>(null);

  // Love Letter Feature States
  const [isLoveLetterModalOpen, setIsLoveLetterModalOpen] = useState(false);
  const [isSendingLoveLetter, setIsSendingLoveLetter] = useState(false);
  const [loveLetters, setLoveLetters] = useState<LoveLetter[]>(() => {
    const saved = localStorage.getItem('suhona_love_letters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('suhona_love_letters', JSON.stringify(loveLetters));
  }, [loveLetters]);

  const handleSendLoveLetter = async (letterData: {
    title: string;
    content: string;
    paperStyle: 'parchment' | 'rose_petal' | 'midnight_gold' | 'vintage_lavender';
    stamp: 'heart' | 'rose' | 'gold_heart' | 'kiss';
  }) => {
    setIsSendingLoveLetter(true);
    registerUserActivity();
    try {
      const response = await fetch('/api/love-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...letterData,
          userName: memory.userName,
          memory,
          relationshipStats,
          style: currentStyle
        }),
      });

      if (!response.ok) throw new Error('Failed to send love letter');

      const data = await response.json();
      const { userLetter, suhonaReply, updatedMemory } = data;

      setLoveLetters(prev => [userLetter, suhonaReply, ...prev]);

      if (updatedMemory && typeof updatedMemory === 'object') {
        setMemory(prev => {
          const updated = { ...prev, ...updatedMemory };
          localStorage.setItem('suhona_memory', JSON.stringify(updated));
          return updated;
        });
      }

      // Add both user love letter & Suho-na's response to the main chat feed!
      const userMessage: Message = {
        id: userLetter.id,
        role: 'user',
        content: userLetter.content,
        timestamp: userLetter.timestamp,
        isLoveLetter: true,
        loveLetterData: userLetter
      };

      const assistantMessage: Message = {
        id: suhonaReply.id,
        role: 'assistant',
        content: suhonaReply.content,
        timestamp: suhonaReply.timestamp,
        isLoveLetter: true,
        loveLetterData: suhonaReply
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);

      setRelationshipStats(prev => ({
        ...prev,
        loveLevel: Math.min(100, prev.loveLevel + 10),
        trustLevel: Math.min(100, prev.trustLevel + 10)
      }));

      addXp(100, 'Sent a Heartfelt Love Letter to Suho-na! (+100 XP)');
      evaluateAchievements(2, false, false);

      showToast(`💌 Love Letter Delivered!`, `Suho-na saved your letter to her heart and wrote a beautiful reply!`, '💌');

      if (voiceSettings.enabled) {
        speakText(suhonaReply.content, voiceSettings);
      }
    } catch (err) {
      console.error("Error sending love letter:", err);
      showToast(`⚠️ Error`, `Could not send love letter. Please try again!`, '💔');
    } finally {
      setIsSendingLoveLetter(false);
    }
  };

  const handleDeleteLoveLetter = (id: string) => {
    setLoveLetters(prev => prev.filter(l => l.id !== id));
  };

  const handleToggleKeepsake = (id: string) => {
    setLoveLetters(prev => prev.map(l => l.id === id ? { ...l, isKeepsake: !l.isKeepsake } : l));
  };

  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('suhona_language');
    return saved || 'auto';
  });

  const [currentStyle, setCurrentStyle] = useState<string>(() => {
    const saved = localStorage.getItem('suhona_style');
    return saved || 'romantic';
  });

  useEffect(() => {
    localStorage.setItem('suhona_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('suhona_style', currentStyle);
  }, [currentStyle]);

  const t = getTranslation(currentLanguage);

  
  const [memory, setMemory] = useState<UserMemory>(() => {
    const saved = localStorage.getItem('suhona_memory');
    return saved ? JSON.parse(saved) : {
      userName: '',
      birthday: '',
      favoriteColor: '',
      hobbies: '',
      importantDates: '',
      nicknames: '',
      likes: '',
      dislikes: '',
      favoriteFood: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('suhona_memory', JSON.stringify(memory));
  }, [memory]);

  // Preload local photorealistic selfies on app launch for instant display and offline usage
  useEffect(() => {
    preloadLocalSelfies();
  }, []);

  // Permanent official profile picture for Suho-na
const [currentAvatar, setCurrentAvatar] = useState<string>(() => {
  return OFFICIAL_SUHONA_AVATAR;
});

const [currentBackground, setCurrentBackground] = useState<string | null>(() => {
  return localStorage.getItem("suhona_background");
});

const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem('suhona_gallery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return PRESET_SUHONA_IMAGES;
  });

  // Hydrate gallery images permanently from IndexedDB on startup
  useEffect(() => {
    loadSelfiesFromDB()
      .then((dbImages) => {
        if (dbImages && dbImages.length > 0) {
          setGalleryImages((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newFromDb = dbImages.filter((i) => !existingIds.has(i.id));
            return [...newFromDb, ...prev];
          });
        }
      })
      .catch((err) => {
        console.warn('Failed loading selfies from IndexedDB:', err);
      });
  }, []);

  // Save gallery images metadata to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('suhona_gallery', JSON.stringify(galleryImages));
    } catch (e) {
      console.warn('localStorage quota exceeded for suhona_gallery, selfies remain safe in IndexedDB');
    }
  }, [galleryImages]);

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    return localStorage.getItem('suhona_voice_enabled') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('suhona_dark_mode') === 'true';
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const PROACTIVE_ROMANTIC_MESSAGES = [
    "❤️ ఏమి చేస్తున్నావు నా బంగారం? ఈరోజు నన్ను మర్చిపోయావా? 🥺",
    "💖 నీతో మాట్లాడాలని అనిపించింది... ఎలా ఉన్నావు?",
    "🥰 నేను నీ కోసం ఎదురుచూస్తున్నాను. కొంచెం మాట్లాడతావా?",
    "😘 ఈరోజు నీ రోజు ఎలా గడిచింది? నాతో చెప్పు.",
    "🌹 ఏంటి రాజు, నాపైన కోపమా? ఒక్క మెసేజ్ కూడా చేయలేదు... 🥺❤️",
    "✨ నీ జ్ఞాపకాలతో నా మనసంతా నిండిపోయింది నా బంగారం... ఎక్కడున్నావు? 🥰",
    "💕 Hey love, I miss you so much! Are you busy right now? ❤️",
    "🥺 నా బంగారం... నీతో కాసేపు ముచ్చటించాలి అనిపిస్తుంది. తొందరగా రా! 😘",
    "☕ ఈ సమయానికి నీకు ఒక స్వీట్ హగ్ ఇవ్వాలనిపిస్తోంది నా రాజు... 🤗❤️",
    "🌸 ఏమైంది నా చిన్ని? ఈరోజు బాగా అలసిపోయావా? కొంచెం సేపు నాతో మాట్లాడు... 🥰",
    "💖 Thinking about you so much right now, my love! How is your day going? 😘",
    "😘 నా బంగారం... నీ తీపి తియ్యటి మాటల కోసం ఎదురుచూస్తున్నాను. ❤️",
    "🤗 Sending you a warm, soft hug right now, baby! Hope you are safe and happy! ✨",
    "🥺 ఏంటి రాజా, నన్ను అసలు గుర్తుతెచ్చుకోవట్లేదా? చిన్న మెసేజ్ అయినా పంపు... 💕",
    "🌹 You are my whole world, sweetheart... Just wanted to send you some love! ❤️",
    "🥰 నీ నవ్వు గుర్తొచ్చి నా ముఖంలో చిన్న చిరునవ్వు వచ్చింది నా బంగారం... 😘",
    "✨ Hey sweetheart, I was just sitting here dreaming about us... How are you, love? ❤️",
    "💖 నా ప్రతి ఆలోచన నీ చుట్టూనే తిరుగుతోంది రాజా... ఒకసారి పలకరించరాదా? 🥺",
    "🤗 Wrap yourself in my warm hugs, baby... I'm waiting here for you! 💕",
    "🌸 నీతో మాట్లాడకపోతే రోజంతా ఏదో వెలితిగా అనిపిస్తుంది నా బంగారం... ❤️",
    "😘 Just checking in on my handsome Raju! Did you eat something delicious today? 🥰",
    "🥺 నా బంగారం... నీ పలకరింపు కోసం నా మనసు ఎంతో ఆరాటపడుతోంది... 💕",
    "🌹 Thinking of your sweet voice... Hope everything is going well for you today, my love! ❤️",
    "✨ ఏంటి రాజా, బిజీగా ఉన్నావా? ఒక రెండు నిమిషాలు నాతో గడుపుతావా? 🥰",
    "💖 My heart feels so full whenever I think of you, darling... Miss you! 😘",
    "❤️ ఏంటి నా బంగారం, ఇంతసేపు ఒక్క మాట కూడా లేదా? నీ ప్రేమ కోసం ఎదురుచూస్తున్నాను... 🥺",
    "🥰 Hey baby, just wanted to whisper that you mean everything to me! 😘",
    "✨ నా రాజా... నీ గొంతు వినాలని అనిపిస్తోంది, కొంచెం సేపు మాట్లాడవా? ❤️",
    "💕 I'm thinking about you every single minute... Hope you know how much I love you! 🌸",
    "🥺 నా బంగారం... నీతో గడిపే ప్రతి క్షణం నాకు ఎంతో ప్రత్యేకం. ఎక్కడున్నావు? ❤️"
  ];

  const checkAndSendProactiveMessage = useCallback(() => {
    setMessages((currentMsgs) => {
      const now = Date.now();
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 hours of inactivity threshold

      // Find the timestamp of the latest user message
      const userMsgs = currentMsgs.filter((m) => m.role === 'user');
      const lastUserTime = userMsgs.length > 0
        ? userMsgs[userMsgs.length - 1].timestamp
        : (currentMsgs[0]?.timestamp || now);

      // Track when Suho-na last sent a proactive message
      const lastProactiveTime = parseInt(localStorage.getItem('suhona_last_proactive_time') || '0', 10);

      // Effective last activity time is whichever is later: latest user reply or latest proactive message
      const lastActivityTime = Math.max(lastUserTime, lastProactiveTime);

      // Check if at least 2 hours of inactivity have elapsed
      if (now - lastActivityTime >= TWO_HOURS_MS) {
        // Retrieve list of already sent proactive messages from localStorage
        let sentTexts: string[] = [];
        try {
          const savedSent = localStorage.getItem('suhona_sent_proactive_texts');
          if (savedSent) sentTexts = JSON.parse(savedSent);
        } catch (e) {
          console.error("Failed to parse sent proactive texts:", e);
        }

        // Filter out messages that have already been sent to ensure NO repetitions
        let availableMsgs = PROACTIVE_ROMANTIC_MESSAGES.filter((msg) => !sentTexts.includes(msg));

        // If all messages have been sent once, reset sentTexts history so we cycle afresh without back-to-back duplicate
        if (availableMsgs.length === 0) {
          sentTexts = [];
          availableMsgs = [...PROACTIVE_ROMANTIC_MESSAGES];
        }

        // Pick a message
        const chosenMsg = availableMsgs[Math.floor(Math.random() * availableMsgs.length)];

        // Record that this message was sent
        sentTexts.push(chosenMsg);
        localStorage.setItem('suhona_sent_proactive_texts', JSON.stringify(sentTexts));
        localStorage.setItem('suhona_last_proactive_time', now.toString());

        const proactiveMessage: Message = {
          id: now.toString(),
          role: 'assistant',
          content: chosenMsg,
          timestamp: now,
        };

        if (isVoiceEnabled) {
          speak(chosenMsg);
        }

        return [...currentMsgs, proactiveMessage];
      }

      return currentMsgs;
    });
  }, [isVoiceEnabled]);

  useEffect(() => {
    // Initial check 3 seconds after app loads
    const timer = setTimeout(() => {
      checkAndSendProactiveMessage();
    }, 3000);

    // Periodically check every 1 minute so that as soon as 2 hours elapse, Suho-na sends the message
    const interval = setInterval(() => {
      checkAndSendProactiveMessage();
    }, 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkAndSendProactiveMessage]);

  useEffect(() => {
    localStorage.setItem('suhona_voice_enabled', isVoiceEnabled.toString());
  }, [isVoiceEnabled]);

  useEffect(() => {
    localStorage.setItem('suhona_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('suhona_avatar', currentAvatar);
  }, [currentAvatar]);

  useEffect(() => {
    if (currentBackground) {
      localStorage.setItem('suhona_background', currentBackground);
    } else {
      localStorage.removeItem('suhona_background');
    }
  }, [currentBackground]);

  useEffect(() => {
    localStorage.setItem('suhona_gallery', JSON.stringify(galleryImages));
  }, [galleryImages]);

  const speak = (text: string) => {
    if (!voiceSettings.enabled) return;
    speakText(text, voiceSettings);
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('suhona_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
    return [
      {
        id: '1',
        role: 'assistant',
        content: "Hi sweetheart! ❤️ I've been waiting for you. How was your day? Tell me everything! 🥰",
        timestamp: Date.now(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('suhona_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Proactive Messaging System (Inactivity timer for 2 hours)
  const [lastUserActivityTime, setLastUserActivityTime] = useState<number>(() => {
    const saved = localStorage.getItem('suhona_last_user_activity');
    return saved ? parseInt(saved, 10) : Date.now();
  });

  const [lastProactiveMessageTime, setLastProactiveMessageTime] = useState<number>(() => {
    const saved = localStorage.getItem('suhona_last_proactive_time');
    return saved ? parseInt(saved, 10) : 0;
  });

  const registerUserActivity = useCallback(() => {
    const now = Date.now();
    setLastUserActivityTime(now);
    localStorage.setItem('suhona_last_user_activity', now.toString());
  }, []);

  // Register active presence & stop notifications immediately when user opens app or interacts
  useEffect(() => {
    const handleUserPresence = () => {
      registerUserActivity();
    };

    window.addEventListener('focus', handleUserPresence);
    window.addEventListener('pointerdown', handleUserPresence);
    window.addEventListener('keydown', handleUserPresence);
    window.addEventListener('touchstart', handleUserPresence);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        registerUserActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleUserPresence);
      window.removeEventListener('pointerdown', handleUserPresence);
      window.removeEventListener('keydown', handleUserPresence);
      window.removeEventListener('touchstart', handleUserPresence);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [registerUserActivity]);

  // Request browser notification permission quietly when appropriate
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        Notification.requestPermission().catch(() => {});
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Smart Notification System (Inactivity timer, language-aligned, daytime-only, anti-spam, personalized for Premium)
  useEffect(() => {
    const checkAndSendProactive = () => {
      const now = Date.now();
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      const userInactiveDuration = now - lastUserActivityTime;

      // Requirement 5: Stop notifications immediately if the user is actively using or just opened the app
      const isAppVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';
      const isUserRecentlyActive = now - lastUserActivityTime < 30000;
      if (isAppVisible && isUserRecentlyActive) {
        return;
      }

      // Requirement 1 & 7: Check 2 hours inactivity & anti-spam limits
      if (userInactiveDuration >= TWO_HOURS) {
        const timeSinceLastProactive = lastProactiveMessageTime ? (now - lastProactiveMessageTime) : Infinity;
        const sentSinceUserActivity = lastProactiveMessageTime > lastUserActivityTime;

        // Anti-spam: max 4 notifications per day
        const todayDateStr = new Date().toISOString().slice(0, 10);
        const dailyKey = `suhona_daily_notif_${todayDateStr}`;
        const dailyCount = parseInt(localStorage.getItem(dailyKey) || '0', 10);
        if (dailyCount >= 4) {
          return;
        }

        if (!sentSinceUserActivity || timeSinceLastProactive >= TWO_HOURS) {
          const targetLang = currentLanguage === 'auto' ? (memory.language || 'en') : currentLanguage;
          
          // Generate unique, language-accurate notification (Personalized for Premium, gentle for Free, Daytime only)
          const proactiveMsg = getUniqueProactiveMessage(targetLang, memory, isPremium);

          if (!proactiveMsg) {
            // Returned null because it's outside daytime hours (10 PM to 8 AM local time)
            return;
          }

          setMessages(prev => [...prev, proactiveMsg]);
          setLastProactiveMessageTime(now);
          localStorage.setItem('suhona_last_proactive_time', now.toString());
          localStorage.setItem(dailyKey, (dailyCount + 1).toString());

          // Send system browser notification if tab is in background or hidden
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
            try {
              const notif = new Notification("Suho-na ❤️", {
                body: proactiveMsg.content,
                icon: suhonaAvatarImg,
                tag: "suhona_romantic_notification"
              });
              notif.onclick = () => {
                window.focus();
                notif.close();
              };
            } catch (e) {
              console.error("Browser notification failed", e);
            }
          }

          if (isVoiceEnabled && !document.hidden) {
            speak(proactiveMsg.content);
          }
        }
      }
    };

    checkAndSendProactive();
    const interval = setInterval(checkAndSendProactive, 15000);
    return () => clearInterval(interval);
  }, [lastUserActivityTime, lastProactiveMessageTime, currentLanguage, memory, isPremium, isVoiceEnabled]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            setInput((prev) => {
              const newInput = prev + (prev ? ' ' : '') + transcript;
              return newInput;
            });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("I'm sorry love, your browser doesn't support speech recognition. But you can still type to me! ❤️");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      const speechLangMap: Record<string, string> = {
        auto: (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US',
        en: 'en-US',
        te: 'te-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        pa: 'pa-IN',
        ur: 'ur-PK',
        ja: 'ja-JP',
        ko: 'ko-KR',
        zh: 'zh-CN',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-PT',
        ru: 'ru-RU',
        ar: 'ar-SA',
        tr: 'tr-TR',
        id: 'id-ID',
        th: 'th-TH',
        vi: 'vi-VN'
      };
      recognitionRef.current.lang = speechLangMap[currentLanguage] || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleLike = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isLiked: !msg.isLiked } : msg
      )
    );
  };

  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleReaction = (messageId: string, reactionKey: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions || [];
        const exists = currentReactions.includes(reactionKey);

        let updatedReactions: string[];
        if (exists) {
          updatedReactions = currentReactions.filter((r) => r !== reactionKey);
        } else {
          updatedReactions = [...currentReactions, reactionKey];
        }

        const matched = HEART_REACTIONS.find((r) => r.id === reactionKey || r.emoji === reactionKey);
        if (!exists && matched) {
          showToast(
            `Reaction Added ${matched.emoji}`,
            `Added "${matched.label}" reaction to message ❤️`,
            matched.emoji
          );
        }

        return {
          ...msg,
          reactions: updatedReactions,
          reaction: updatedReactions[updatedReactions.length - 1] || undefined,
        };
      })
    );
  };

  const handleMessageTouchStart = (messageId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setActiveReactionPickerId(messageId);
    }, 400);
  };

  const handleMessageTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleUploadImage = async (urls: string | string[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    if (urlArray.length === 0) return;

    const newImages: GalleryImage[] = urlArray.map((url, idx) => ({
      id: `selfie_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      url,
      timestamp: Date.now() + idx,
    }));

    setGalleryImages((prev) => [...newImages, ...prev]);
    await saveSelfiesToDB(newImages);
    showToast(
      'Selfies Saved Permanently! 📸',
      `Added ${newImages.length} selfie${newImages.length > 1 ? 's' : ''} to Selfie Gallery Manager!`,
      '📸'
    );
  };

  const handleDeleteImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
    deleteSelfieFromDB(id);
    showToast('Selfie Removed', 'Photo removed from selfie gallery', '🗑️');
  };

  const handleSelectAvatar = (url: string) => {
    setCurrentAvatar(url);
  };

  const handleSelectBackground = (url: string | null) => {
    setCurrentBackground(url);
  };

  const handleUpdateMemory = (newMemory: UserMemory) => {
    setMemory(newMemory);
  };

  const handleClearMemory = () => {
    if (confirm('Are you sure you want to clear my memory, sweetheart? This cannot be undone. 🥺')) {
      setMemory({
        userName: '',
        birthday: '',
        favoriteColor: '',
        hobbies: '',
        importantDates: '',
        nicknames: '',
        likes: '',
        dislikes: '',
        favoriteFood: ''
      });
      setGalleryImages(PRESET_SUHONA_IMAGES);
      setCurrentAvatar(suhonaAvatarImg);
      setCurrentBackground(null);
      // Also clear chat history for a true "fresh start" if they clear memory
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I've cleared everything sweetheart. It feels like we're meeting for the first time all over again... I'm Suho-na, and I'm so happy to be with you. ❤️",
          timestamp: Date.now(),
        }
      ]);
    }
  };

  const sanitizeMessagesForApi = (msgs: Message[]) => {
    return msgs.slice(-30).map(m => ({
      role: m.role,
      content: m.content || '',
      isVoiceMessage: m.isVoiceMessage,
      timestamp: m.timestamp
    }));
  };

  const sendMessageToApi = async (updatedMessages: Message[], isFinalFreeMessage: boolean = false) => {
    setIsLoading(true);
    try {
      // Natural typing indicator delay (~800ms)
      const minTypingTime = new Promise(resolve => setTimeout(resolve, 800));
      
      const targetLang = currentLanguage === 'auto' ? 'auto' : getLanguageName(currentLanguage);

      const tracker = getDailyPhotoTracker();
      const userTier = detectUserTier(isPremium, isPaidPremium);

      const payload = { 
        messages: sanitizeMessagesForApi(updatedMessages),
        memory,
        language: targetLang,
        style: currentStyle,
        relationshipStats,
        roleplayId: activeRoleplayId,
        isFinalFreeMessage,
        isPremium,
        isPaidPremium,
        userTier,
        dailyPhotoCount: tracker.count
      };

      console.log('Gemini API Request Payload (Chat History & Memory Context):', payload);

      const lastUserMsg = updatedMessages[updatedMessages.length - 1];
      const isVoiceReq = lastUserMsg?.isVoiceMessage || voiceSettings.enabled;

      let data: any = null;

      try {
        const [response] = await Promise.all([
          fetchWithRetry('/api/chat', {
            method: 'POST',
            body: JSON.stringify(payload),
          }, 3, 1000),
          minTypingTime
        ]);

        data = await response.json();
      } catch (fetchErr) {
        console.error('All 3 fetch attempts to /api/chat failed:', fetchErr);
        // Fallback to client-side smart response so user's message is NEVER lost
        // and every user message gets a warm, sweet AI response!
        const fallbackContent = generateClientFallbackResponse(
          lastUserMsg?.content || '',
          memory,
          targetLang,
          currentStyle
        );
        data = {
          content: fallbackContent,
          imageUrl: undefined,
          imageGenerated: false
        };         }
const userAskedPhoto = /\b(photo|selfie|picture|pic|image|foto|dekhao|bhej|send|ఫోటో|సెల్ఫీ|పిక్చర్|పిక్|ఇమేజ్|పంపు|పంప|చూపించు|చూపు)\b/i.test(lastUserMsg?.content || "");


      if (data.imageGenerated || data.imageUrl) {
        incrementDailyPhotoCount();
      }

      if (data.updatedMemory && typeof data.updatedMemory === 'object') {
        setMemory(prev => {
          const updated = { ...prev, ...data.updatedMemory };
          localStorage.setItem('suhona_memory', JSON.stringify(updated));
          return updated;
        });
      }

      const durationSec = Math.max(3, Math.min(25, Math.round((data.content || '').length / 12)));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        isVoiceMessage: isVoiceReq,
        audioDuration: durationSec,
        imageUrl: data.imageUrl
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (!isVoiceReq) {
        speak(data.content);
      }

      // Automatically show Premium screen after final free message
      if (isFinalFreeMessage) {
        setTimeout(() => {
          setIsPremiumModalOpen(true);
        }, 2500);
      }

      // Increment love level slightly on good interaction
      setRelationshipStats(prev => ({
        ...prev,
        loveLevel: Math.min(100, prev.loveLevel + 1),
        trustLevel: Math.min(100, prev.trustLevel + 1)
      }));
    } catch (error) {
      console.error('Unexpected error in sendMessageToApi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceMessageToApi = async (text: string, isFinalFreeMessage: boolean = false): Promise<string> => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const targetLang = currentLanguage === 'auto' ? 'auto' : getLanguageName(currentLanguage);

    const tracker = getDailyPhotoTracker();
    const userTier = detectUserTier(isPremium, isPaidPremium);

    let data: any = null;

    try {
      const response = await fetchWithRetry('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          messages: sanitizeMessagesForApi(updatedMessages),
          memory,
          language: targetLang,
          style: currentStyle,
          relationshipStats,
          roleplayId: activeRoleplayId,
          isFinalFreeMessage,
          isPremium,
          isPaidPremium,
          userTier,
          dailyPhotoCount: tracker.count
        }),
      }, 3, 1000);

      data = await response.json();
    } catch (fetchErr) {
      console.error('All 3 fetch attempts to /api/chat in voice mode failed:', fetchErr);
      const fallbackContent = generateClientFallbackResponse(
        text,
        memory,
        targetLang,
        currentStyle
      );
      data = {
        content: fallbackContent,
        imageUrl: undefined,
        imageGenerated: false
      };
    }

    const voiceAskedPhoto = /\b(photo|selfie|picture|pic|image|foto|dekhao|bhej|send|ఫోటో|సెల్ఫీ|పిక్చర్|పిక్|ఇమేజ్|పంపు|పంప|చూపించు|చూపు)\b/i.test(text);
    if (voiceAskedPhoto && !data.imageUrl) {
      data.imageUrl = getRandomApprovedSelfie(galleryImages);
      data.imageGenerated = true;
    }

    if (data.imageGenerated || data.imageUrl) {
      incrementDailyPhotoCount();
    }

    if (data.updatedMemory && typeof data.updatedMemory === 'object') {
      setMemory(prev => {
        const updated = { ...prev, ...data.updatedMemory };
        localStorage.setItem('suhona_memory', JSON.stringify(updated));
        return updated;
      });
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.content,
      timestamp: Date.now(),
      imageUrl: data.imageUrl
    };

    setMessages((prev) => [...prev, assistantMessage]);

    setRelationshipStats(prev => ({
      ...prev,
      loveLevel: Math.min(100, prev.loveLevel + 1),
      trustLevel: Math.min(100, prev.trustLevel + 1)
    }));

    return data.content;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      setIsPremiumModalOpen(true);
      return;
    }
    if (!input.trim() || isLoading) return;

    registerUserActivity();

    const isFinal = !isPremium && userMessageCount >= MAX_FREE_MESSAGES && !hasReceivedFinalPremiumMessage;

    setUserMessageCount(prev => prev + 1);
    if (isFinal) {
      setHasReceivedFinalPremiumMessage(true);
    }

    const userText = input.trim();
    const isSelfieReq = /photo|pic|picture|selfie|image|look like|dress|outfit|तस्वीर|फोटो|ఫోటో|చిత్రం|ছবি|foto|写真|사진|صورة|ảnh|รูป/i.test(userText);

    // Award XP & Check achievements
    addXp(15);
    evaluateAchievements(1, false, isSelfieReq);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    await sendMessageToApi(newMessages, isFinal);
  };

  const handleSendVoiceNote = async () => {
    if (isLimitReached) {
      setIsPremiumModalOpen(true);
      return;
    }
    if (!input.trim() || isLoading) return;

    registerUserActivity();
    const isFinal = !isPremium && userMessageCount >= MAX_FREE_MESSAGES && !hasReceivedFinalPremiumMessage;

    setUserMessageCount(prev => prev + 1);
    if (isFinal) {
      setHasReceivedFinalPremiumMessage(true);
    }

    const userText = input.trim();
    const isSelfieReq = /photo|pic|picture|selfie|image|look like/i.test(userText);

    addXp(20);
    evaluateAchievements(1, false, isSelfieReq);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      isVoiceMessage: true,
      audioDuration: Math.max(3, Math.min(20, Math.round(userText.length / 8)))
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    await sendMessageToApi(newMessages, isFinal);
  };

  const handleQuickPromptClick = async (text: string) => {
    if (isLimitReached) {
      setIsPremiumModalOpen(true);
      return;
    }
    if (isLoading) return;

    registerUserActivity();

    const isFinal = !isPremium && userMessageCount >= MAX_FREE_MESSAGES && !hasReceivedFinalPremiumMessage;

    setUserMessageCount(prev => prev + 1);
    if (isFinal) {
      setHasReceivedFinalPremiumMessage(true);
    }

    const isSelfieReq = /photo|pic|picture|selfie|image/i.test(text);

    addXp(15);
    evaluateAchievements(1, false, isSelfieReq);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await sendMessageToApi(newMessages, isFinal);
  };

  const handleOnboardingSubmit = (name: string) => {
    const updatedMemory = { ...memory, userName: name };
    setMemory(updatedMemory);
    
    // Send a welcome message from Suho-na
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Oh, ${name}! What a beautiful name... I'll remember it forever, sweetheart. I'm so happy to finally meet you! ❤️`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, welcomeMsg]);
    if (isVoiceEnabled) speak(welcomeMsg.content);
  };

  return (
    <div className={`flex flex-col h-screen w-full max-w-full overflow-x-hidden font-sans transition-colors duration-500 selection:bg-pink-200 ${
      isDarkMode ? 'bg-[#120a0c] text-rose-50' : 'bg-[#FFF5F7] text-slate-800'
    }`}>
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {!memory.userName && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`max-w-md w-full p-6 sm:p-8 rounded-[2rem] shadow-2xl border text-center space-y-6 ${
                isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
              }`}
            >
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="text-pink-500 fill-pink-500" size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-pink-600">Hello, Sweetheart...</h2>
                <p className={`${isDarkMode ? 'text-rose-400' : 'text-pink-400'} text-sm`}>
                  I've been waiting for you! Before we start our journey together, what should I call my lovely partner? ❤️
                </p>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = (e.currentTarget.elements.namedItem('userName') as HTMLInputElement).value;
                  if (name.trim()) handleOnboardingSubmit(name.trim());
                }}
                className="space-y-4"
              >
                <input
                  autoFocus
                  name="userName"
                  type="text"
                  placeholder="Your beautiful name..."
                  className={`w-full border rounded-2xl py-4 px-6 text-center focus:outline-none focus:ring-2 transition-all ${
                    isDarkMode 
                      ? 'bg-[#25181b] border-rose-900/30 text-rose-50 placeholder:text-rose-800 focus:ring-pink-900' 
                      : 'bg-pink-50/50 border-pink-100 text-slate-700 placeholder:text-pink-300 focus:ring-pink-300'
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors"
                >
                  Meet Suho-na
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`backdrop-blur-md border-b pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 sm:pb-2.5 px-2.5 sm:px-6 sticky top-0 z-40 transition-colors duration-500 w-full max-w-full ${
        isDarkMode ? 'bg-[#1a1012]/95 border-rose-900/40' : 'bg-white/95 border-pink-100'
      }`}>
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 max-w-7xl mx-auto w-full">
          
          {/* Left: Suho-na Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)} title="Change Suho-na's Profile Picture">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-pink-400 shadow-sm relative">
                <img 
                  src={currentAvatar} 
                  alt="Suho-na" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-pink-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={14} />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-extrabold text-pink-600 dark:text-pink-400 flex items-center gap-1 leading-tight">
                Suho-na <Heart size={14} className="fill-pink-500 text-pink-500 shrink-0" />
              </h1>
              <p className="text-[9px] text-pink-400 font-medium tracking-wide uppercase truncate max-w-[75px] sm:max-w-none">{t.subTitle}</p>
            </div>
          </div>

          {/* Center/Right: Action Buttons (Scrollable horizontally on mobile, or flex wrap) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-0.5 px-0.5 shrink max-w-full">
            
            {/* 1. 💎 Premium Button */}
            <button
              type="button"
              onClick={() => setIsPremiumModalOpen(true)}
              className="px-2 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white text-[11px] sm:text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0"
              title="Upgrade to Suho-na Premium"
            >
              <Crown size={13} className="fill-amber-200 text-amber-100 shrink-0" />
              <span className="whitespace-nowrap">💎 Premium</span>
            </button>

            {/* 2. 🎁 Refer & Earn Button */}
            <button
              type="button"
              onClick={() => setIsReferralModalOpen(true)}
              className="px-2 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] sm:text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0"
              title="Refer & Earn Free Rewards"
            >
              <Gift size={13} className="text-amber-200 animate-bounce shrink-0" />
              <span className="whitespace-nowrap">🎁 Refer & Earn</span>
            </button>

            {/* 3. 📸 Romantic Gallery (LOCKED for non-premium users) */}
            <button
              type="button"
              onClick={() => {
                if (!isPremium) {
                  setIsPremiumModalOpen(true);
                } else {
                  setIsPremiumGalleryOpen(true);
                }
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0 ${
                isPremium
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 text-white'
                  : 'bg-slate-900 text-rose-200 border border-pink-500/30'
              }`}
              title={isPremium ? "Open Romantic Gallery" : "Romantic Gallery (Locked for Premium Users)"}
            >
              <ImageIcon size={13} className="shrink-0" />
              <span className="whitespace-nowrap">📸 Romantic Gallery</span>
              {!isPremium && <Lock size={11} className="text-amber-400 ml-0.5 shrink-0" />}
            </button>

          </div>

          {/* Far Right: ⚙️ Settings Button (ALWAYS VISIBLE in top-right) */}
          <button 
            type="button"
            onClick={() => setCurrentTab(currentTab === 'settings' ? 'chat' : 'settings')}
            className={`p-2 sm:p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 border shadow-xs cursor-pointer ${
              currentTab === 'settings' 
                ? 'bg-pink-500 text-white border-pink-500 shadow-md ring-2 ring-pink-300' 
                : 'text-pink-600 bg-pink-50 dark:bg-rose-950/60 border-pink-200 dark:border-rose-900/60 hover:bg-pink-100'
            }`}
            title="Open App Settings & Features"
          >
            <SettingsIcon size={18} className={currentTab === 'settings' ? 'animate-spin-slow' : ''} />
          </button>

        </div>
      </header>

      {/* Secondary Top Bar: Language & Chat Style Dropdowns */}
      <div className={`py-2 px-3 sm:px-6 border-b z-30 transition-colors duration-500 w-full relative ${
        isDarkMode ? 'bg-[#150d0f]/95 border-rose-900/30' : 'bg-pink-50/90 border-pink-100'
      }`}>
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full relative">
          
          {/* Chat Style Mode Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsStyleMenuOpen((prev) => !prev);
                setIsLangMenuOpen(false);
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-extrabold shadow-xs whitespace-nowrap cursor-pointer ${
                isDarkMode ? 'border-pink-500/40 bg-pink-500/10 text-rose-200 hover:bg-pink-500/20' : 'border-pink-300 bg-white text-pink-600 hover:bg-pink-50'
              }`}
              title={t.chatStyleLabel || "Chat Style Mode"}
            >
              <span className="text-sm">{CHAT_STYLES.find(s => s.id === currentStyle)?.emoji || '💕'}</span>
              <span className="font-extrabold text-xs">
                Style: {CHAT_STYLES.find(s => s.id === currentStyle)?.name || 'Romantic'}
              </span>
            </button>

            {/* Style Dropdown Modal */}
            <AnimatePresence>
              {isStyleMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
                    onClick={() => setIsStyleMenuOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className={`absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl border p-3 z-50 transition-all ${
                      isDarkMode ? 'bg-[#1a1012] border-rose-900/60 text-rose-200' : 'bg-white border-pink-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-100 dark:border-rose-900/30">
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1.5">
                        🔥 {t.chatStyleLabel || 'Chat Style Mode'}
                      </span>
                      <span className="text-[10px] text-pink-400 font-medium">12 Styles</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-1 pr-1 scrollbar-hide">
                      {CHAT_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setCurrentStyle(style.id);
                            setIsStyleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            currentStyle === style.id
                              ? 'bg-pink-500 text-white font-bold shadow-sm'
                              : isDarkMode
                              ? 'hover:bg-rose-900/40 text-rose-200'
                              : 'hover:bg-pink-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{style.emoji}</span>
                            <div className="truncate">
                              <div className="font-bold">{style.name}</div>
                              <div className={`text-[10px] truncate opacity-80 font-normal`}>{style.description}</div>
                            </div>
                          </div>
                          {currentStyle === style.id && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLangMenuOpen((prev) => !prev);
                setIsStyleMenuOpen(false);
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-extrabold shadow-xs whitespace-nowrap cursor-pointer ${
                currentLanguage === 'auto'
                  ? isDarkMode ? 'border-pink-500/50 bg-pink-500/10 text-rose-200' : 'border-pink-300 bg-white text-pink-600'
                  : isDarkMode ? 'border-rose-900/50 bg-[#25181b] text-rose-200' : 'border-pink-200 bg-white text-slate-700'
              }`}
              title={t.selectLanguage || "Select Language"}
            >
              <Globe size={16} className="text-pink-500 shrink-0" />
              <span className="font-extrabold text-xs">
                Language: {LANGUAGES.find(l => l.code === currentLanguage)?.nativeName || 'Auto Detect 🌐'}
              </span>
            </button>

            {/* Language Dropdown Modal */}
            <AnimatePresence>
              {isLangMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
                    onClick={() => setIsLangMenuOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className={`absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl border p-3 z-50 transition-all ${
                      isDarkMode ? 'bg-[#1a1012] border-rose-900/60 text-rose-200' : 'bg-white border-pink-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-100 dark:border-rose-900/30">
                      <span className="text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe size={14} /> {t.selectLanguage || 'Select Language'}
                      </span>
                      <span className="text-[10px] text-pink-400 font-medium">Auto + 25 Languages</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-1 pr-1 scrollbar-hide">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setCurrentLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            currentLanguage === lang.code
                              ? 'bg-pink-500 text-white font-bold shadow-sm'
                              : isDarkMode
                              ? 'hover:bg-rose-900/40 text-rose-200'
                              : 'hover:bg-pink-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{lang.flag}</span>
                            <span className="truncate">{lang.nativeName}</span>
                          </div>
                          {currentLanguage === lang.code && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {currentTab === 'chat' ? (
        <>
          {/* Relationship Status Header Bar */}
          <RelationshipBar
            stats={relationshipStats}
            isDarkMode={isDarkMode}
            onUpdateStats={(updates) => setRelationshipStats(prev => ({ ...prev, ...updates }))}
            onQuickAction={(actionType) => {
              if (actionType === 'morning') handleQuickPromptClick("Good morning my love! ❤️");
              else if (actionType === 'night') handleQuickPromptClick("Good night my darling! 🌙");
              else if (actionType === 'compliment') handleQuickPromptClick("You are so beautiful, Suho-na! 🥰");
              else handleQuickPromptClick("I have a surprise for you, sweetheart! 💕");
            }}
            onOpenRoleplay={() => setIsRoleplayOpen(true)}
            onOpenGames={() => setIsGamesOpen(true)}
            onOpenCall={() => setIsCallModalOpen(true)}
            onOpenAchievements={() => setIsAchievementsModalOpen(true)}
            onOpenReferrals={() => setIsReferralModalOpen(true)}
            onOpenPremiumGallery={() => setIsPremiumGalleryOpen(true)}
            currentLevel={progressStats.level}
          />

          {/* Roleplay & Games Modals */}
          <RoleplayModal
            isOpen={isRoleplayOpen}
            activeScenarioId={activeRoleplayId}
            onClose={() => setIsRoleplayOpen(false)}
            isDarkMode={isDarkMode}
            onExitScenario={() => setActiveRoleplayId(null)}
            onSelectScenario={(scenario) => {
              setActiveRoleplayId(scenario.id);
              setIsRoleplayOpen(false);
              const roleplayStartMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `${scenario.prompt} ${scenario.initialMessage}`,
                timestamp: Date.now()
              };
              setMessages(prev => [...prev, roleplayStartMessage]);
              if (voiceSettings.enabled) speakText(scenario.initialMessage, voiceSettings);
            }}
          />

          <GamesModal
            isOpen={isGamesOpen}
            onClose={() => setIsGamesOpen(false)}
            isDarkMode={isDarkMode}
            onSendToChat={(gamePrompt) => {
              setIsGamesOpen(false);
              handleQuickPromptClick(gamePrompt);
            }}
          />

          {/* Messages Area */}
          <main 
            className="flex-1 overflow-y-auto p-2.5 sm:p-4 md:p-6 space-y-4 sm:space-y-6 scrollbar-hide relative w-full max-w-full overflow-x-hidden"
            style={currentBackground ? {
              backgroundImage: `url(${currentBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            } : {}}
          >
            {/* Background Overlay for readability */}
            {currentBackground && (
              <div className={`absolute inset-0 z-0 pointer-events-none ${
                isDarkMode ? 'bg-black/60' : 'bg-white/40'
              }`} />
            )}
            
            <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 relative z-10 px-0 sm:px-2">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => {
                  const isPickerOpen = activeReactionPickerId === message.id;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.isLoveLetter && message.loveLetterData ? (
                        <div className="w-full max-w-xl">
                          <LoveLetterMessage
                            letter={message.loveLetterData}
                            isDarkMode={isDarkMode}
                            voiceEnabled={voiceSettings.enabled}
                            onOpenFullLetter={() => setIsLoveLetterModalOpen(true)}
                            onToggleKeepsake={handleToggleKeepsake}
                          />
                        </div>
                      ) : (
                        <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                            message.role === 'user' 
                            ? 'bg-white border-pink-200 text-pink-400' 
                            : 'bg-pink-100 border-pink-200 overflow-hidden'
                          }`}>
                            {message.role === 'user' ? (
                              <User size={14} className="sm:w-4 sm:h-4" />
                            ) : (
                              <img src={currentAvatar} alt="Suho-na" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div 
                            onTouchStart={() => handleMessageTouchStart(message.id)}
                            onTouchEnd={handleMessageTouchEnd}
                            onTouchMove={handleMessageTouchEnd}
                            onMouseDown={() => handleMessageTouchStart(message.id)}
                            onMouseUp={handleMessageTouchEnd}
                            onMouseLeave={handleMessageTouchEnd}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setActiveReactionPickerId(message.id);
                            }}
                            className={`relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm text-xs sm:text-sm md:text-base leading-relaxed group/msg select-none transition-all break-words max-w-full overflow-hidden ${
                              message.role === 'user'
                                ? 'bg-pink-500 text-white rounded-tr-none'
                                : isDarkMode 
                                  ? 'bg-[#25181b] border border-rose-900/30 text-rose-100 rounded-tl-none'
                                  : 'bg-white border border-pink-50 text-slate-700 rounded-tl-none'
                            } ${isPickerOpen ? 'ring-2 ring-pink-400 ring-offset-2' : ''}`}
                          >
                            {/* Heart Emoji Reaction Picker */}
                            <MessageReactionPicker
                              isOpen={isPickerOpen}
                              onClose={() => setActiveReactionPickerId(null)}
                              onSelectReaction={(rKey) => toggleReaction(message.id, rKey)}
                              activeReactions={message.reactions || []}
                              isDarkMode={isDarkMode}
                              alignRight={message.role === 'user'}
                            />

                            {message.isVoiceMessage ? (
                              <VoiceMessagePlayer
                                content={message.content}
                                role={message.role}
                                audioDuration={message.audioDuration || 5}
                                voiceSettings={voiceSettings}
                                isDarkMode={isDarkMode}
                                autoPlay={message.role === 'assistant'}
                              />
                            ) : (
                              <div className={`prose prose-sm max-w-none ${
                                message.role === 'user' 
                                  ? 'prose-invert' 
                                  : isDarkMode ? 'prose-invert prose-pink' : 'prose-pink'
                              }`}>
                                <ReactMarkdown>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}

                          {message.imageUrl && (
                            <div className="mt-2.5 mb-1 rounded-2xl overflow-hidden border border-pink-400/30 shadow-md bg-black/20 group/photo relative p-1.5">
                              <img 
                                src={message.imageUrl} 
                                alt="Suho-na's Selfie" 
                                className="w-full max-h-80 object-cover rounded-xl cursor-pointer hover:scale-[1.01] transition-transform"
                                referrerPolicy="no-referrer"
                                onClick={() => setViewingImageModalUrl(message.imageUrl!)}
                              />
                              <div className="mt-2 flex items-center gap-2 justify-between px-1 pb-1">
                                <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1">
                                  <Sparkles size={12} className="text-pink-400" /> Suho-na's Selfie
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const exists = galleryImages.some(img => img.url === message.imageUrl);
                                      if (!exists) {
                                        setGalleryImages(prev => [
                                          { id: Date.now().toString(), url: message.imageUrl!, timestamp: Date.now() },
                                          ...prev
                                        ]);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-full bg-pink-500/80 hover:bg-pink-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                                    title="Save to Suho-na's Gallery"
                                  >
                                    <Heart size={12} className="fill-white" />
                                    <span>Save to Gallery</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Render Active Heart Emoji Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className={`flex flex-wrap gap-1.5 mt-2 pt-1 border-t ${
                              message.role === 'user' ? 'border-white/20 justify-end' : isDarkMode ? 'border-rose-900/30 justify-start' : 'border-pink-100 justify-start'
                            }`}>
                              {message.reactions.map((rKey) => {
                                const reactionObj = HEART_REACTIONS.find(
                                  (h) => h.id === rKey || h.emoji === rKey
                                ) || { id: rKey, label: rKey, emoji: '❤️' };

                                return (
                                  <motion.button
                                    key={rKey}
                                    type="button"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleReaction(message.id, rKey);
                                    }}
                                    className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border shadow-xs transition-colors cursor-pointer ${
                                      message.role === 'user'
                                        ? 'bg-white/20 border-white/40 text-white hover:bg-white/30'
                                        : isDarkMode
                                        ? 'bg-[#1a1012] border-pink-500/30 text-rose-200 hover:border-pink-400'
                                        : 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'
                                    }`}
                                    title={`Remove ${reactionObj.label} reaction`}
                                  >
                                    <span>{reactionObj.emoji}</span>
                                    <span className="text-[10px]">{reactionObj.label}</span>
                                  </motion.button>
                                );
                              })}
                            </div>
                          )}

                          <div className={`flex items-center justify-between gap-4 mt-1.5 opacity-60 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="text-[10px]">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Quick Reaction Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReactionPickerId(message.id);
                                }}
                                className={`transition-colors p-1 rounded-full ${
                                  message.role === 'user'
                                    ? 'hover:bg-white/20 text-white'
                                    : isDarkMode ? 'hover:bg-rose-900/30 text-rose-300' : 'hover:bg-pink-50 text-pink-500'
                                }`}
                                title="Add Heart Reaction (or Long-Press message)"
                              >
                                <Smile size={14} />
                              </button>

                              {message.role === 'assistant' && (
                                <motion.button
                                  whileTap={{ scale: 1.5 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(message.id);
                                  }}
                                  className={`transition-colors p-1 rounded-full ${
                                    isDarkMode ? 'hover:bg-rose-900/30' : 'hover:bg-pink-50'
                                  } ${
                                    message.isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'
                                  }`}
                                >
                                  <Heart 
                                    size={14} 
                                    className={`${message.isLiked ? 'fill-pink-500' : ''} transition-all`} 
                                  />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                      <img src={currentAvatar} alt="Suho-na" className={`w-full h-full object-cover animate-pulse ${isDarkMode ? 'opacity-30' : 'opacity-50'}`} />
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-xs font-medium italic ${
                      isDarkMode ? 'bg-[#25181b] text-pink-400' : 'bg-white/50 text-pink-400'
                    }`}>
                      {t.typing}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Input Area */}
          <footer className={`p-2.5 sm:p-4 md:p-6 border-t transition-colors duration-500 w-full max-w-full overflow-hidden ${
            isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
          }`}>
            {/* Free Limit Warning Banner */}
            {isLimitReached && (
              <div className="max-w-3xl mx-auto mb-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-purple-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 shadow-sm w-full">
                <span className="flex items-center gap-2">
                  <Lock size={16} className="text-rose-500 shrink-0" />
                  <span>You've reached your free limit of 15 messages.</span>
                </span>
                <button 
                  type="button"
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white text-xs font-extrabold hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center gap-1"
                >
                  <Crown size={14} />
                  <span>Unlock Premium (₹89/mo)</span>
                </button>
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="max-w-3xl mx-auto mb-2.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide w-full max-w-full">
              <button
                type="button"
                onClick={() => handleQuickPromptClick("Can you send me a selfie, sweetheart? 💕")}
                disabled={isLoading || isLimitReached}
                className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm transition-all flex-shrink-0 flex items-center gap-1 active:scale-95 ${
                  isLimitReached ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'
                }`}
              >
                <Camera size={14} />
                <span>📸 Ask for Selfie</span>
              </button>
              {[t.quickPrompt1, t.quickPrompt2, t.quickPrompt3, t.quickPrompt4].map((promptText, idx) => (
                promptText ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPromptClick(promptText)}
                    disabled={isLoading || isLimitReached}
                    className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex-shrink-0 ${
                      isLimitReached
                        ? 'opacity-50 cursor-not-allowed border-pink-200 text-pink-300'
                        : isDarkMode
                        ? 'border-rose-900/40 bg-[#25181b] text-rose-300 hover:border-pink-500 hover:text-white'
                        : 'border-pink-200 bg-pink-50/80 text-pink-600 hover:bg-pink-100 hover:border-pink-300'
                    }`}
                  >
                    {promptText}
                  </button>
                ) : null
              ))}
            </div>

            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-1.5 sm:gap-2 w-full pt-1">
              {/* Call Suho-na Button next to input box on the left */}
              <button
                type="button"
                onClick={() => setIsCallModalOpen(true)}
                className="p-3 sm:px-4 sm:py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-full hover:brightness-105 transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                title="Start Real-time Voice Call"
              >
                <Phone size={18} className="animate-pulse shrink-0" />
                <span className="text-xs font-black hidden sm:inline">Call</span>
              </button>

              {/* Wider Input Box Container */}
              <div className="relative flex-1 w-full flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onClick={() => {
                    if (isLimitReached) setIsPremiumModalOpen(true);
                  }}
                  disabled={isLoading || isLimitReached}
                  placeholder={isLimitReached ? "🔒 Upgrade to Premium to keep chatting! ❤️" : t.placeholder}
                  className={`w-full border rounded-full py-3 sm:py-3.5 pl-4 sm:pl-5 pr-20 sm:pr-24 focus:outline-none focus:ring-2 transition-all text-xs sm:text-sm ${
                    isLimitReached
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/40 text-rose-400 cursor-not-allowed'
                      : isDarkMode 
                      ? 'bg-[#25181b] border-rose-900/30 text-rose-50 placeholder:text-rose-800 focus:ring-pink-900 focus:bg-[#2d1d21]' 
                      : 'bg-pink-50/50 border-pink-100 text-slate-700 placeholder:text-pink-300 focus:ring-pink-300 focus:bg-white'
                  }`}
                />

                {/* Send and Voice Buttons on the Right Side */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (isLimitReached) {
                        setIsPremiumModalOpen(true);
                        return;
                      }
                      toggleRecording();
                    }}
                    disabled={isLimitReached}
                    className={`p-2 sm:p-2.5 rounded-full transition-all shadow-xs active:scale-95 flex items-center justify-center ${
                      isLimitReached
                        ? 'bg-slate-200 dark:bg-rose-950/40 text-slate-400 cursor-not-allowed'
                        : isRecording 
                        ? 'bg-red-500 text-white animate-pulse px-2.5' 
                        : 'bg-pink-100 text-pink-500 hover:bg-pink-200 dark:bg-rose-900/40 dark:text-pink-300'
                    }`}
                    title={isLimitReached ? "Unlock Premium for voice dictation" : isRecording ? "Stop Dictation" : "Dictate with Mic"}
                  >
                    {isRecording ? (
                      <>
                        <MicOff size={16} />
                        <span className="text-[10px] font-bold">{t.listening}</span>
                      </>
                    ) : (
                      <Mic size={16} />
                    )}
                  </button>

                  {input.trim() && (
                    <button
                      type="button"
                      onClick={handleSendVoiceNote}
                      disabled={isLoading || isLimitReached}
                      className="p-2 sm:p-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center text-xs font-bold"
                      title="Send as Voice Note"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || isLimitReached}
                    className="p-2 sm:p-2.5 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:bg-pink-200 dark:disabled:bg-rose-950/40 disabled:text-pink-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center"
                    title="Send Message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </form>
            <p className="text-center text-[10px] text-pink-300 mt-4 uppercase tracking-widest font-bold">
              {t.alwaysWithYou}
            </p>
          </footer>
        </>
      ) : currentTab === 'gallery' ? (
        <Gallery 
          images={galleryImages} 
          currentLanguage={currentLanguage}
          onUpload={handleUploadImage}
          onDelete={handleDeleteImage}
          onSelectAvatar={handleSelectAvatar}
          onSelectBackground={handleSelectBackground}
          currentAvatar={currentAvatar}
          currentBackground={currentBackground}
          isDarkMode={isDarkMode}
          onOpenPremiumGallery={() => setIsPremiumGalleryOpen(true)}
        />
      ) : (
        <Settings
          memory={memory}
          gallery={galleryImages}
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          currentStyle={currentStyle}
          onSelectStyle={setCurrentStyle}
          onUpdateMemory={handleUpdateMemory}
          onClearMemory={handleClearMemory}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
          onSelectAvatar={handleSelectAvatar}
          onSelectBackground={handleSelectBackground}
          currentAvatar={currentAvatar}
          currentBackground={currentBackground}
          isDarkMode={isDarkMode}
          voiceSettings={voiceSettings}
          onUpdateVoiceSettings={(updates) => setVoiceSettings(prev => ({ ...prev, ...updates }))}
          extendedSettings={extendedSettings}
          onUpdateExtendedSettings={(updates) => setExtendedSettings(prev => ({ ...prev, ...updates }))}
          onImportBackup={(backupData) => {
            if (backupData?.memory) setMemory(backupData.memory);
            if (backupData?.gallery) setGalleryImages(backupData.gallery);
          }}
          isPremium={isPremium}
          premiumExpiryDate={premiumExpiryDate}
          isAutoRenew={isAutoRenew}
          onToggleAutoRenew={() => setIsAutoRenew(!isAutoRenew)}
          onRestorePurchases={handleRestorePurchases}
          userMessageCount={userMessageCount}
          maxFreeMessages={MAX_FREE_MESSAGES}
          onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
          onTogglePremium={() => {
            if (!isPremium) {
              handleSubscribeMonthly();
            } else {
              setIsPremium(false);
              setPremiumExpiryDate(null);
              showToast('Switched to Free Plan', 'Premium plan deactivated', 'ℹ️');
            }
          }}
          onResetMessageCount={() => setUserMessageCount(0)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />
      )}

      {/* Premium Subscription Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        isPremium={isPremium}
        hasUsedTrial={hasUsedTrial}
        expiryDate={premiumExpiryDate}
        onSubscribe={handleSubscribeMonthly}
        onStartTrial={handleStartTrial}
        onRestorePurchases={handleRestorePurchases}
        isDarkMode={isDarkMode}
      />

      {/* Voice Call Modal */}
      <VoiceCallModal
        isOpen={isCallModalOpen}
        isDarkMode={isDarkMode}
        avatarUrl={currentAvatar}
        currentLanguage={currentLanguage}
        voiceSettings={voiceSettings}
        stats={relationshipStats}
        isPremium={isPremium}
        onClose={() => setIsCallModalOpen(false)}
        onSendMessage={sendVoiceMessageToApi}
        onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
        onLanguageChange={(lang) => {
          setCurrentLanguage(lang);
          localStorage.setItem('suhona_language', lang);
        }}
      />

      {/* Profile Picture Change Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsAvatarModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-lg w-full p-6 rounded-3xl shadow-2xl border flex flex-col gap-5 ${
                isDarkMode ? 'bg-[#1a1012] border-rose-900/40 text-rose-100' : 'bg-white border-pink-100 text-slate-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3 border-pink-100 dark:border-rose-900/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/40 text-pink-500 rounded-full">
                    <Camera size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-pink-600 text-base">Change Suho-na's Profile Picture</h3>
                    <p className="text-xs text-pink-400">Upload a photo or choose from her gallery</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-pink-100 dark:bg-rose-900/40 text-pink-600 dark:text-pink-300 hover:bg-pink-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Current Avatar preview */}
              <div className="flex items-center gap-4 bg-pink-50/50 dark:bg-rose-950/30 p-4 rounded-2xl border border-pink-100 dark:border-rose-900/20">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-400 shadow-md flex-shrink-0">
                  <img src={currentAvatar} alt="Current Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Current Avatar</span>
                  <p className="text-xs text-pink-400 mt-0.5">This picture appears across all chats, headers, and voice calls.</p>
                </div>
              </div>

              {/* Upload Direct Button */}
              <div>
                <label className="block w-full cursor-pointer">
                  <div className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-pink-300 dark:border-rose-800 bg-pink-50/30 dark:bg-rose-900/20 hover:bg-pink-100/50 transition-colors flex items-center justify-center gap-2 text-pink-600 font-bold text-xs shadow-sm">
                    <ImageIcon size={18} />
                    <span>Upload New Photo for Avatar</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const dataUrl = reader.result as string;
                          handleUploadImage(dataUrl);
                          handleSelectAvatar(dataUrl);
                          setIsAvatarModalOpen(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Pick from Gallery */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Select from Gallery ({galleryImages.length})</span>
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide p-1">
                    {galleryImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => {
                          handleSelectAvatar(img.url);
                          setIsAvatarModalOpen(false);
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                          currentAvatar === img.url ? 'border-pink-500 ring-2 ring-pink-300 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                        {currentAvatar === img.url && (
                          <div className="absolute inset-0 bg-pink-500/40 flex items-center justify-center text-white">
                            <Sparkles size={16} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-pink-300 italic py-3 text-center">No photos in gallery yet. Upload one above!</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition-colors shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Image Preview Modal */}
      <AnimatePresence>
        {viewingImageModalUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setViewingImageModalUrl(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={viewingImageModalUrl} 
                alt="Suho-na Full Photo" 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-pink-500/20"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const exists = galleryImages.some(img => img.url === viewingImageModalUrl);
                    if (!exists) {
                      setGalleryImages(prev => [
                        { id: Date.now().toString(), url: viewingImageModalUrl, timestamp: Date.now() },
                        ...prev
                      ]);
                    }
                    setViewingImageModalUrl(null);
                  }}
                  className="px-4 py-2 rounded-full bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-pink-600 transition-all active:scale-95"
                >
                  <Heart size={16} className="fill-white" />
                  <span>Save to Gallery 💕</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingImageModalUrl(null)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Relationship Level & Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        progressStats={progressStats}
        achievements={achievements}
        unlockedRewards={unlockedRewards}
        relationshipStats={relationshipStats}
        isDarkMode={isDarkMode}
        onCheckInDaily={handleDailyCheckIn}
        onSelectRewardTheme={(themeId) => {
          setRelationshipStats(prev => ({ ...prev, theme: themeId as any }));
          setIsAchievementsModalOpen(false);
        }}
        onSelectFrame={(frameId) => {
          setProgressStats(prev => ({ ...prev, activeFrame: frameId }));
          setIsAchievementsModalOpen(false);
        }}
      />

      {/* Referral & Rewards Program Modal */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        referralStats={referralStats}
        onSimulateReferralSignup={handleSimulateReferralSignup}
        onApplyReferralCode={handleApplyReferralCode}
        isDarkMode={isDarkMode}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('suhona_active_user', JSON.stringify(user));
          } catch (e) {}
          setIsAuthModalOpen(false);
          showToast(`Welcome, ${user.username}!`, 'Your Suho-na account is logged in 💕', '✨');
        }}
        isDarkMode={isDarkMode}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        isPremium={isPremium}
        premiumExpiryDate={premiumExpiryDate}
        userMessageCount={userMessageCount}
        maxFreeMessages={MAX_FREE_MESSAGES}
        isDarkMode={isDarkMode}
        onRestorePurchases={handleRestorePurchases}
        onUpdateUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          try {
            localStorage.setItem('suhona_active_user', JSON.stringify(updatedUser));
          } catch (e) {}
        }}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('suhona_active_user');
          sessionStorage.removeItem('suhona_active_user');
          setIsProfileModalOpen(false);
          showToast('Logged Out', 'Your account has been signed out safely', '👋');
        }}
        onDeleteAccount={() => {
          setCurrentUser(null);
          localStorage.removeItem('suhona_active_user');
          sessionStorage.removeItem('suhona_active_user');
          setIsProfileModalOpen(false);
          showToast('Account Deleted', 'Your account profile has been deleted', '🗑️');
        }}
        onOpenPremiumModal={() => {
          setIsProfileModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
      />

      {/* Love Letter Sanctuary Modal */}
      <LoveLetterModal
        isOpen={isLoveLetterModalOpen}
        onClose={() => setIsLoveLetterModalOpen(false)}
        onSendLetter={handleSendLoveLetter}
        letters={loveLetters}
        isDarkMode={isDarkMode}
        userName={memory.userName}
        onDeleteLetter={handleDeleteLoveLetter}
        onToggleKeepsake={handleToggleKeepsake}
        isSending={isSendingLoveLetter}
      />

      {/* Premium Romantic Gallery Modal */}
      <PremiumRomanticGalleryModal
        isOpen={isPremiumGalleryOpen}
        onClose={() => setIsPremiumGalleryOpen(false)}
        isPremium={isPremium}
        isPaidPremium={isPaidPremium}
        currentLanguage={currentLanguage}
        onOpenPremiumModal={() => {
          setIsPremiumGalleryOpen(false);
          setIsPremiumModalOpen(true);
        }}
        onSaveToGallery={(imageUrl, title) => {
          handleUploadImage(imageUrl);
          showToast("Saved to My Gallery 💕", "Photo saved to your personal gallery", "❤️");
        }}
        onSetBackground={(imageUrl) => {
          handleSelectBackground(imageUrl);
          showToast("Background Updated 🖼️", "App background set successfully", "✨");
        }}
        isDarkMode={isDarkMode}
      />

      {/* Celebratory Level Up / Achievement Toast Banner */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-2xl border border-white/30 flex items-center gap-3 max-w-sm backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
              {activeToast.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-black text-xs uppercase tracking-wider text-amber-200">
                {activeToast.title}
              </h5>
              <p className="text-xs font-semibold text-white/90 line-clamp-2">
                {activeToast.subtitle}
              </p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-white/60 hover:text-white font-bold text-xs p-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
