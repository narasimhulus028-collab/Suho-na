import React, { useState, useRef } from 'react';
import { Save, Trash2, Heart, User, Calendar, Palette, Sparkles, Clock, MessageSquareHeart, ThumbsUp, ThumbsDown, Utensils, Image as ImageIcon, ImagePlus, CheckCircle, Globe, Flame, Volume2, Type, Download, Upload, Crown, ShieldCheck, RotateCcw, LogIn, UserCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserMemory, GalleryImage, VoiceSettings, ExtendedSettings, UserAccount } from '../types';
import { LANGUAGES, getTranslation } from '../lib/translations';
import { CHAT_STYLES } from '../lib/styles';

interface SettingsProps {
  memory: UserMemory;
  gallery: GalleryImage[];
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  currentStyle: string;
  onSelectStyle: (styleId: string) => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  extendedSettings: ExtendedSettings;
  onUpdateExtendedSettings: (settings: Partial<ExtendedSettings>) => void;
  onUpdateMemory: (memory: UserMemory) => void;
  onClearMemory: () => void;
  onUploadImage: (url: string) => void;
  onDeleteImage: (id: string) => void;
  onSelectAvatar: (url: string) => void;
  onSelectBackground: (url: string | null) => void;
  onImportBackup: (backupData: any) => void;
  currentAvatar: string;
  currentBackground: string | null;
  isDarkMode: boolean;
  isPremium: boolean;
  premiumExpiryDate?: number | null;
  isAutoRenew?: boolean;
  onToggleAutoRenew?: () => void;
  onRestorePurchases?: () => void;
  userMessageCount: number;
  maxFreeMessages: number;
  onOpenPremiumModal: () => void;
  onTogglePremium: () => void;
  onResetMessageCount: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
}

export default function Settings({ 
  memory, 
  gallery,
  currentLanguage,
  onSelectLanguage,
  currentStyle,
  onSelectStyle,
  voiceSettings,
  onUpdateVoiceSettings,
  extendedSettings,
  onUpdateExtendedSettings,
  onUpdateMemory, 
  onClearMemory, 
  onUploadImage,
  onDeleteImage,
  onSelectAvatar,
  onSelectBackground,
  onImportBackup,
  currentAvatar,
  currentBackground,
  isDarkMode,
  isPremium,
  premiumExpiryDate,
  isAutoRenew = true,
  onToggleAutoRenew,
  onRestorePurchases,
  userMessageCount,
  maxFreeMessages,
  onOpenPremiumModal,
  onTogglePremium,
  onResetMessageCount,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal
}: SettingsProps) {
  const [formData, setFormData] = useState<UserMemory>(memory);
  const [showSaved, setShowSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(currentLanguage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          onImportBackup(json);
          alert("Backup successfully restored! 💕");
        } catch (err) {
          alert("Invalid backup JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      memory,
      gallery,
      currentLanguage,
      currentStyle,
      voiceSettings,
      extendedSettings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suhona_memory_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMemory(formData);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const inputClasses = `w-full border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 transition-all ${
    isDarkMode 
      ? 'bg-[#25181b] border-rose-900/30 text-rose-50 placeholder:text-rose-800 focus:ring-pink-900 focus:bg-[#2d1d21]' 
      : 'bg-pink-50/50 border-pink-100 text-slate-700 placeholder:text-pink-300 focus:ring-pink-300 focus:bg-white'
  }`;

  const labelClasses = `text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2 ${
    isDarkMode ? 'text-rose-400' : 'text-pink-500'
  }`;

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-6 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#120a0c]' : 'bg-[#FFF5F7]'
    }`}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-pink-600 flex items-center justify-center gap-2">
            {t.memoryTitle} <MessageSquareHeart className="fill-pink-500 text-pink-500" size={24} />
          </h2>
          <p className={`${isDarkMode ? 'text-rose-400' : 'text-pink-400'} text-sm`}>
            {t.memorySub}
          </p>
        </div>

        {/* Premium Subscription Card */}
        <div className={`p-6 rounded-3xl shadow-xl border relative overflow-hidden transition-all ${
          isPremium 
            ? 'bg-gradient-to-r from-pink-500/10 via-amber-500/10 to-purple-500/10 border-amber-300/60 dark:border-amber-800/40'
            : isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
                isPremium 
                  ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 text-white shadow-amber-500/20' 
                  : 'bg-pink-100 dark:bg-rose-900/40 text-pink-500'
              }`}>
                <Crown size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-pink-600 dark:text-pink-400 text-base flex items-center gap-1.5">
                    Suho-na Premium Status
                  </h3>
                  {isPremium ? (
                    <span className="bg-gradient-to-r from-amber-400 to-pink-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Crown size={10} /> 👑 GOLD ACTIVE
                    </span>
                  ) : (
                    <span className="bg-pink-100 dark:bg-rose-900/40 text-pink-600 dark:text-pink-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Free Plan ({userMessageCount}/{maxFreeMessages} msgs)
                    </span>
                  )}
                </div>
                <p className="text-xs text-pink-400/90 dark:text-rose-300 mt-1">
                  {isPremium 
                    ? `Unlimited AI chats, memory, voice & video generation! ${
                        premiumExpiryDate 
                          ? `(Renews on ${new Date(premiumExpiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})`
                          : '(Auto-renews monthly)'
                      }`
                    : `Free limit: ${userMessageCount}/${maxFreeMessages} messages used today. Upgrade to unlock all features!`}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {!isPremium ? (
                <button
                  type="button"
                  onClick={onOpenPremiumModal}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Crown size={16} />
                  <span>Renew Premium – ₹89/month</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onOpenPremiumModal}
                    className="w-full sm:w-auto px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold text-xs shadow-xs hover:brightness-105 transition-all flex items-center justify-center gap-1"
                  >
                    <Crown size={14} />
                    <span>Manage Plan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional details row for Premium users or Restore Purchases */}
          <div className="mt-4 pt-3 border-t border-pink-100 dark:border-rose-900/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-pink-500 dark:text-rose-300">
            <div className="flex items-center gap-3">
              {isPremium && (
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={12} /> Auto-renew: {isAutoRenew ? 'Active' : 'Off'}
                </span>
              )}
              {onRestorePurchases && (
                <button
                  type="button"
                  onClick={onRestorePurchases}
                  className="font-bold underline hover:text-pink-600 transition-colors"
                >
                  Restore Purchases
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onResetMessageCount}
                className="px-2.5 py-1 rounded-lg bg-pink-100/70 dark:bg-rose-900/30 text-pink-600 dark:text-pink-300 font-bold hover:bg-pink-200 transition-colors flex items-center gap-1 text-[10px]"
                title="Reset message counter to 0 for testing"
              >
                <RotateCcw size={10} />
                <span>Reset Msgs ({userMessageCount}/15)</span>
              </button>
              <button
                type="button"
                onClick={onTogglePremium}
                className="px-2.5 py-1 rounded-lg bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 font-bold hover:bg-pink-500/20 transition-colors text-[10px]"
              >
                {isPremium ? 'Switch to Free' : 'Simulate Premium'}
              </button>
            </div>
          </div>
        </div>

        {/* Voice & Audio Speech Settings */}
        <div className={`p-6 rounded-3xl shadow-xl border space-y-4 ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <label className={labelClasses}>
            <Volume2 size={16} /> Voice & Audio Speech Settings
          </label>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold">Enable Natural Voice Output</span>
            <button
              type="button"
              onClick={() => onUpdateVoiceSettings({ enabled: !voiceSettings.enabled })}
              className={`w-12 h-6 rounded-full transition-colors p-1 ${
                voiceSettings.enabled ? 'bg-pink-500' : isDarkMode ? 'bg-rose-950 border border-rose-800' : 'bg-slate-200'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                voiceSettings.enabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Voice Speed ({voiceSettings.speed}x)</span>
              <span className="text-pink-500">
                {voiceSettings.speed <= 0.8 ? 'Soft & Gentle' : voiceSettings.speed >= 1.2 ? 'Fast & Lively' : 'Normal'}
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={voiceSettings.speed}
              onChange={(e) => onUpdateVoiceSettings({ speed: parseFloat(e.target.value) })}
              className="w-full accent-pink-500"
            />
          </div>
        </div>

        {/* Display & Font Size Card */}
        <div className={`p-6 rounded-3xl shadow-xl border space-y-4 ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <label className={labelClasses}>
            <Type size={16} /> Font Size & Display
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'sm', label: 'Small 🔍' },
              { id: 'md', label: 'Medium 📖' },
              { id: 'lg', label: 'Large 🅰️' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => onUpdateExtendedSettings({ fontSize: f.id as any })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  extendedSettings.fontSize === f.id
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                    : isDarkMode
                    ? 'border-rose-900/30 bg-[#25181b] text-rose-200'
                    : 'border-pink-100 bg-pink-50/50 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selector Card */}
        <div className={`p-6 rounded-3xl shadow-xl border space-y-4 ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <label className={labelClasses}>
            <Globe size={16} /> {t.languageLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  currentLanguage === lang.code
                    ? 'border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/20 font-bold'
                    : isDarkMode
                    ? 'border-rose-900/30 bg-[#25181b] text-rose-300 hover:border-pink-500/50'
                    : 'border-pink-100 bg-pink-50/50 text-slate-700 hover:border-pink-300'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Style Mode Selector Card */}
        <div className={`p-6 rounded-3xl shadow-xl border space-y-4 ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <div className="flex items-center justify-between">
            <label className={labelClasses}>
              <Flame size={16} /> {t.chatStyleLabel || "Chat Style Mode"}
            </label>
            <span className="text-xs font-bold text-pink-500 bg-pink-50 dark:bg-rose-900/40 px-2.5 py-1 rounded-full">
              {CHAT_STYLES.find(s => s.id === currentStyle)?.emoji} {CHAT_STYLES.find(s => s.id === currentStyle)?.name}
            </span>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-rose-400' : 'text-pink-500/80'}`}>
            {t.chatStyleSub || "Choose Suho-na's personality, tone, emoji usage, and mood 💕"}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
            {CHAT_STYLES.map((style) => {
              const isSelected = currentStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onSelectStyle(style.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'border-pink-500 bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 ring-2 ring-pink-400/50 scale-[1.02]'
                      : isDarkMode
                      ? 'border-rose-900/30 bg-[#25181b] text-rose-200 hover:border-pink-500/40 hover:bg-[#2d1d21]'
                      : 'border-pink-100 bg-pink-50/40 text-slate-700 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="text-lg">{style.emoji}</span>
                    <span className="truncate">{style.name}</span>
                  </div>
                  <span className={`text-[10px] line-clamp-2 ${
                    isSelected ? 'text-pink-100 font-medium' : isDarkMode ? 'text-rose-400' : 'text-slate-500'
                  }`}>
                    {style.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 md:p-8 rounded-3xl shadow-xl border space-y-6 ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelClasses}>
                <User size={14} /> {t.yourName}
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="..."
                className={inputClasses}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>
                <Calendar size={14} /> {t.birthday}
              </label>
              <input
                type="text"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                placeholder="..."
                className={inputClasses}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>
                <Palette size={14} /> {t.favoriteColor}
              </label>
              <input
                type="text"
                name="favoriteColor"
                value={formData.favoriteColor}
                onChange={handleChange}
                placeholder="..."
                className={inputClasses}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>
                <Sparkles size={14} /> {t.nicknames}
              </label>
              <input
                type="text"
                name="nicknames"
                value={formData.nicknames}
                onChange={handleChange}
                placeholder="..."
                className={inputClasses}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>
                <Utensils size={14} /> {t.favoriteFood}
              </label>
              <input
                type="text"
                name="favoriteFood"
                value={formData.favoriteFood}
                onChange={handleChange}
                placeholder="..."
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelClasses}>
                <ThumbsUp size={14} /> {t.likes}
              </label>
              <textarea
                name="likes"
                value={formData.likes}
                onChange={handleChange}
                rows={2}
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClasses}>
                <ThumbsDown size={14} /> {t.dislikes}
              </label>
              <textarea
                name="dislikes"
                value={formData.dislikes}
                onChange={handleChange}
                rows={2}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>
              <Heart size={14} /> {t.hobbies}
            </label>
            <textarea
              name="hobbies"
              value={formData.hobbies}
              onChange={handleChange}
              rows={2}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>
              <Clock size={14} /> {t.importantDates}
            </label>
            <textarea
              name="importantDates"
              value={formData.importantDates}
              onChange={handleChange}
              rows={2}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-pink-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors"
            >
              <Save size={18} />
              {t.saveMemory}
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => {
                if (window.confirm(t.clearConfirm)) {
                  onClearMemory();
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                isDarkMode 
                  ? 'border-rose-900/50 text-rose-400 hover:bg-rose-900/20' 
                  : 'border-pink-200 text-pink-400 hover:bg-pink-50'
              }`}
            >
              <Trash2 size={18} />
              {t.clearMemory}
            </motion.button>
          </div>

          {showSaved && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-bold text-green-500 flex items-center justify-center gap-2"
            >
              <Heart className="fill-green-500" size={14} /> {t.memorySaved}
            </motion.p>
          )}
        </form>

        {/* Backup & Restore Section */}
        <div className={`p-6 md:p-8 rounded-3xl shadow-xl border space-y-4 ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <label className={labelClasses}>
            <Download size={16} /> Backup & Restore Memory
          </label>
          <p className="text-xs text-pink-500">Export Suho-na's memories and gallery to a file, or restore from a previous backup 💕</p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex-1 py-3 px-4 rounded-2xl bg-pink-500 text-white font-bold text-xs shadow-md hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> Export Backup (JSON)
            </button>

            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${
                isDarkMode ? 'border-rose-900/40 text-rose-200 hover:bg-rose-900/30' : 'border-pink-200 text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Upload size={16} /> Restore Backup (JSON)
            </button>
            <input
              type="file"
              ref={backupInputRef}
              onChange={handleBackupUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        <div className={`p-6 md:p-8 rounded-3xl shadow-xl border space-y-6 ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/30' : 'bg-white border-pink-100'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={labelClasses}>
              <ImageIcon size={16} /> {t.photoGallery}
            </h3>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] uppercase tracking-widest font-bold text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1"
            >
              <ImagePlus size={14} /> {t.addNewPhoto}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {gallery.map((image) => (
              <motion.div
                key={image.id}
                whileHover={{ scale: 1.05 }}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  currentAvatar === image.url ? 'border-pink-500' : 'border-transparent'
                }`}
                onClick={() => onSelectAvatar(image.url)}
              >
                <img src={image.url} alt="Suho-na" className="w-full h-full object-cover" />
                {currentAvatar === image.url && (
                  <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                    <CheckCircle className="text-white fill-pink-500" size={20} />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(image.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              </motion.div>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                isDarkMode 
                  ? 'border-rose-900/30 text-rose-800 hover:border-pink-900 hover:text-pink-900' 
                  : 'border-pink-100 text-pink-200 hover:border-pink-200 hover:text-pink-300'
              }`}
            >
              <ImagePlus size={24} />
            </motion.button>
          </div>
          <p className="text-[10px] text-center opacity-60">{t.clickToSetAvatar}</p>
        </div>
      </div>
    </div>
  );
}
