import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Lock, Sparkles, X, Heart, ImageIcon, Wand2, ShieldAlert, Check, Maximize2, Download } from 'lucide-react';
import { getGalleryTranslation, PRESET_PREMIUM_ROMANTIC_IMAGES, PremiumRomanticImage } from '../lib/galleryTranslations';
import { fetchWithRetry } from '../lib/api';

interface PremiumRomanticGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  isPaidPremium: boolean;
  currentLanguage: string;
  onOpenPremiumModal: () => void;
  onSaveToGallery: (imageUrl: string, title?: string) => void;
  onSetBackground: (imageUrl: string) => void;
  isDarkMode: boolean;
}

export default function PremiumRomanticGalleryModal({
  isOpen,
  onClose,
  isPremium,
  isPaidPremium,
  currentLanguage,
  onOpenPremiumModal,
  onSaveToGallery,
  onSetBackground,
  isDarkMode
}: PremiumRomanticGalleryModalProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'couples' | 'ai_art' | 'cozy'>('all');
  const [images, setImages] = useState<PremiumRomanticImage[]>(PRESET_PREMIUM_ROMANTIC_IMAGES);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHdImage, setSelectedHdImage] = useState<PremiumRomanticImage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = getGalleryTranslation(currentLanguage);

  // Access rules:
  // Requirement 2: Only users with an active paid Premium subscription can access it.
  // Requirement 3: Users who unlocked Premium through referral rewards must NOT have access to this feature.
  const hasAccess = isPremium && isPaidPremium;
  const isReferralUser = isPremium && !isPaidPremium;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const handleGenerateAiPhoto = async () => {
    if (!customPrompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      // Safe, wholesome prompt construction
      const safePrompt = `ultra-realistic 8k UHD raw camera photograph of beautiful romantic couple, 22-year-old young South Asian Indian woman Suho-na and her partner, authentic warm natural Indian skin tone, high detail face, eyes, hair, natural lighting, safe for work, non-explicit, ${customPrompt.trim()}`;
      
      const res = await fetchWithRetry('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: safePrompt })
      }, 3, 1000);

      const data = await res.json();
      if (data.imageUrl) {
        const newImg: PremiumRomanticImage = {
          id: `ai_gen_${Date.now()}`,
          url: data.imageUrl,
          title: customPrompt.length > 25 ? customPrompt.substring(0, 25) + '...' : customPrompt,
          category: 'ai_art',
          description: `Custom AI Generated: ${customPrompt}`
        };
        setImages(prev => [newImg, ...prev]);
        setCustomPrompt('');
        showToast("✨ Custom AI Romantic Photo Generated!");
      } else {
        showToast("Failed to generate image. Please try again.");
      }
    } catch (err) {
      console.error("AI photo generation error", err);
      showToast("Generation error. Please check connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border ${
            isDarkMode 
              ? 'bg-[#180f12] text-rose-100 border-rose-900/40' 
              : 'bg-white text-slate-800 border-pink-100'
          }`}
        >
          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold px-4 py-2 rounded-full shadow-lg text-xs flex items-center gap-2 animate-bounce">
              <Sparkles size={14} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-pink-500/10 flex items-center justify-between shrink-0 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-rose-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-rose-500 flex items-center justify-center shadow-md text-white shrink-0">
                <Crown size={24} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500">
                    {t.title}
                  </h2>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    GOLD EXCLUSIVE
                  </span>
                </div>
                <p className="text-xs text-pink-500/80 font-medium">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-rose-950/60 text-rose-300' : 'hover:bg-pink-50 text-slate-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

            {/* RESTRICTED ACCESS VIEW FOR REFERRAL AND FREE USERS */}
            {!hasAccess ? (
              <div className="py-8 px-4 sm:px-8 text-center space-y-6 max-w-xl mx-auto">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-xl">
                  {isReferralUser ? <ShieldAlert size={40} /> : <Lock size={40} />}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500">
                    {isReferralUser ? t.referralNoticeTitle : t.freeNoticeTitle}
                  </h3>

                  <p className={`text-sm leading-relaxed font-medium p-4 rounded-2xl border ${
                    isDarkMode 
                      ? 'bg-rose-950/30 border-rose-900/40 text-rose-200' 
                      : 'bg-pink-50/80 border-pink-100 text-slate-700'
                  }`}>
                    {isReferralUser ? t.referralNoticeText : t.freeNoticeText}
                  </p>
                </div>

                {/* Preview Teaser Collage */}
                <div className="grid grid-cols-3 gap-2 opacity-50 blur-[1px] pointer-events-none rounded-2xl overflow-hidden border border-pink-500/20 p-2">
                  <img src={PRESET_PREMIUM_ROMANTIC_IMAGES[0].url} alt="Preview 1" className="w-full h-24 object-cover rounded-xl" />
                  <img src={PRESET_PREMIUM_ROMANTIC_IMAGES[1].url} alt="Preview 2" className="w-full h-24 object-cover rounded-xl" />
                  <img src={PRESET_PREMIUM_ROMANTIC_IMAGES[2].url} alt="Preview 3" className="w-full h-24 object-cover rounded-xl" />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPremiumModal();
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Crown size={20} />
                    <span>{t.upgradeBtn}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* FULL PAID PREMIUM GALLERY ACCESS */
              <>
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeCategory === 'all'
                        ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white shadow-md'
                        : isDarkMode ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/40' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    <span>{t.allCategory}</span>
                  </button>

                  <button
                    onClick={() => setActiveCategory('couples')}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeCategory === 'couples'
                        ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white shadow-md'
                        : isDarkMode ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/40' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    <span>{t.couplesCategory}</span>
                  </button>

                  <button
                    onClick={() => setActiveCategory('ai_art')}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeCategory === 'ai_art'
                        ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white shadow-md'
                        : isDarkMode ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/40' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    <span>{t.aiArtCategory}</span>
                  </button>

                  <button
                    onClick={() => setActiveCategory('cozy')}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeCategory === 'cozy'
                        ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white shadow-md'
                        : isDarkMode ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/40' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    <span>{t.cozyCategory}</span>
                  </button>
                </div>

                {/* AI Couple Image Generator Bar */}
                <div className={`p-4 rounded-3xl border shadow-sm ${
                  isDarkMode ? 'bg-rose-950/30 border-rose-900/40' : 'bg-pink-50/70 border-pink-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 size={16} className="text-pink-500" />
                    <span className="text-xs font-extrabold text-pink-600 dark:text-rose-300">
                      Create Custom AI Couple Art
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={t.promptPlaceholder}
                      className={`flex-1 px-4 py-2.5 rounded-2xl text-xs outline-none border transition-all ${
                        isDarkMode 
                          ? 'bg-[#1e1316] border-rose-900/50 text-rose-100 placeholder-rose-400/50 focus:border-pink-500' 
                          : 'bg-white border-pink-200 text-slate-800 placeholder-slate-400 focus:border-pink-500'
                      }`}
                    />
                    <button
                      onClick={handleGenerateAiPhoto}
                      disabled={!customPrompt.trim() || isGenerating}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t.generating}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>{t.generateBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Gallery Images Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredImages.map((img) => (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`group relative rounded-3xl overflow-hidden border shadow-md ${
                        isDarkMode ? 'bg-[#1e1316] border-rose-900/40' : 'bg-white border-pink-100'
                      }`}
                    >
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                        <img 
                          src={img.url} 
                          alt={img.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                        
                        {/* HD Expand Button */}
                        <button
                          onClick={() => setSelectedHdImage(img)}
                          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-pink-500 transition-colors"
                          title={t.previewHd}
                        >
                          <Maximize2 size={14} />
                        </button>

                        {/* Bottom Info & Quick Actions */}
                        <div className="absolute bottom-3 left-3 right-3 space-y-2">
                          <h4 className="text-xs font-bold text-white tracking-wide line-clamp-1">
                            {img.title}
                          </h4>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                onSaveToGallery(img.url, img.title);
                                showToast(t.savedToast);
                              }}
                              className="flex-1 py-1.5 px-2 rounded-xl bg-pink-500/90 text-white font-bold text-[10px] hover:bg-pink-600 transition-colors flex items-center justify-center gap-1 shadow"
                            >
                              <Heart size={11} className="fill-white" />
                              <span>{t.saveToGallery}</span>
                            </button>

                            <button
                              onClick={() => {
                                onSetBackground(img.url);
                                showToast(t.bgSetToast);
                              }}
                              className="py-1.5 px-2.5 rounded-xl bg-white/20 text-white backdrop-blur-md font-bold text-[10px] hover:bg-white/30 transition-colors flex items-center justify-center gap-1 shadow"
                              title={t.setAsBg}
                            >
                              <ImageIcon size={11} />
                              <span className="hidden sm:inline">Set BG</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

          </div>
        </motion.div>
      </div>

      {/* FULLSCREEN HD IMAGE MODAL */}
      {selectedHdImage && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setSelectedHdImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            <img 
              src={selectedHdImage.url} 
              alt={selectedHdImage.title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white space-y-2">
              <h3 className="text-lg font-bold">{selectedHdImage.title}</h3>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onSaveToGallery(selectedHdImage.url, selectedHdImage.title);
                    showToast(t.savedToast);
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-pink-600 shadow-lg"
                >
                  <Heart size={14} className="fill-white" />
                  <span>{t.saveToGallery}</span>
                </button>
                <button
                  onClick={() => {
                    onSetBackground(selectedHdImage.url);
                    showToast(t.bgSetToast);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-white/30 backdrop-blur-md shadow-lg"
                >
                  <ImageIcon size={14} />
                  <span>{t.setAsBg}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
