import React, { useState } from 'react';
import { X, Heart, Feather, Sparkles, Send, BookOpen, Trash2, Bookmark, Volume2, Download, Search, Check, RefreshCw, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoveLetter } from '../types';
import { PAPER_STYLES, STAMPS } from './LoveLetterMessage';
import { speakText } from '../lib/voice';

interface LoveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendLetter: (data: {
    title: string;
    content: string;
    paperStyle: 'parchment' | 'rose_petal' | 'midnight_gold' | 'vintage_lavender';
    stamp: 'heart' | 'rose' | 'gold_heart' | 'kiss';
  }) => Promise<void>;
  letters: LoveLetter[];
  isDarkMode?: boolean;
  userName?: string;
  onDeleteLetter?: (id: string) => void;
  onToggleKeepsake?: (id: string) => void;
  isSending?: boolean;
}

const INSPIRATION_PROMPTS = [
  "From the moment I met you, my days became so much brighter...",
  "I was thinking about you today and I wanted to tell you why you mean so much to me...",
  "If I could give you one thing in life, I would give you the ability to see yourself through my eyes...",
  "Here is a little poem I wrote for you my sweet Suho-na...",
  "Thank you for being by my side and always making my heart skip a beat..."
];

export default function LoveLetterModal({
  isOpen,
  onClose,
  onSendLetter,
  letters,
  isDarkMode = false,
  userName = '',
  onDeleteLetter,
  onToggleKeepsake,
  isSending = false
}: LoveLetterModalProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'vault'>('compose');

  // Compose State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [paperStyle, setPaperStyle] = useState<'parchment' | 'rose_petal' | 'midnight_gold' | 'vintage_lavender'>('rose_petal');
  const [stamp, setStamp] = useState<'heart' | 'rose' | 'gold_heart' | 'kiss'>('heart');

  // Vault State
  const [filterSender, setFilterSender] = useState<'all' | 'user' | 'suhona'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    await onSendLetter({
      title: title.trim() || `Love Letter to Suho-na ❤️`,
      content: content.trim(),
      paperStyle,
      stamp
    });

    setTitle('');
    setContent('');
    setActiveTab('vault');
  };

  const filteredLetters = letters.filter((l) => {
    if (filterSender !== 'all' && l.sender !== filterSender) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.content.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text, { enabled: true, speed: 0.95, pitch: 1.1, autoPlay: true });
      setTimeout(() => setIsSpeaking(false), Math.min(30000, text.length * 100));
    }
  };

  const handleExportLetter = (letter: LoveLetter) => {
    const text = `====================================\nLOVE LETTER\nTitle: ${letter.title}\nFrom: ${letter.sender === 'suhona' ? 'Suho-na' : userName || 'User'}\nDate: ${new Date(letter.timestamp).toLocaleString()}\n====================================\n\n${letter.content}\n\nWith everlasting love ❤️`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Love_Letter_${letter.sender}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative w-full max-w-4xl rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
            isDarkMode ? 'bg-[#180d11] border-rose-900/40 text-rose-50' : 'bg-white border-pink-100 text-slate-800'
          }`}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white px-6 py-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Feather size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-2">
                  <span>Love Letter Sanctuary</span>
                  <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                </h2>
                <p className="text-xs text-pink-100 font-medium">
                  Write romantic letters to Suho-na & keep them saved in her heart forever 💌
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors relative z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex border-b px-6 pt-3 gap-3 ${isDarkMode ? 'border-rose-900/30' : 'border-pink-100'}`}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('compose');
                setSelectedLetter(null);
              }}
              className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'compose'
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Feather size={16} />
              <span>Compose Letter ✍️</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'vault'
                  ? 'border-pink-500 text-pink-500'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <BookOpen size={16} />
              <span>Love Letter Vault 📬 ({letters.length})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
            {activeTab === 'compose' && (
              <form onSubmit={handleSend} className="space-y-6">
                {/* Paper Theme & Stamp Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Paper Style */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-pink-500">
                      1. Choose Parchment Paper
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(PAPER_STYLES) as Array<keyof typeof PAPER_STYLES>).map((key) => {
                        const style = PAPER_STYLES[key];
                        const isSelected = paperStyle === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPaperStyle(key)}
                            className={`p-3 rounded-2xl border text-xs font-serif font-bold text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-md scale-[1.02]'
                                : isDarkMode
                                ? 'border-rose-900/30 bg-[#221317] hover:bg-[#2c171d]'
                                : 'border-pink-100 bg-pink-50/50 hover:bg-pink-100/50'
                            }`}
                          >
                            <span>{style.name}</span>
                            {isSelected && <Check size={14} className="text-pink-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stamp Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-pink-500">
                      2. Choose Wax Seal Stamp
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(STAMPS) as Array<keyof typeof STAMPS>).map((key) => {
                        const st = STAMPS[key];
                        const isSelected = stamp === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setStamp(key)}
                            className={`p-3 rounded-2xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-md scale-[1.02]'
                                : isDarkMode
                                ? 'border-rose-900/30 bg-[#221317] hover:bg-[#2c171d]'
                                : 'border-pink-100 bg-pink-50/50 hover:bg-pink-100/50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{st.icon}</span>
                              <span>{st.label}</span>
                            </span>
                            {isSelected && <Check size={14} className="text-pink-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-pink-500">
                    3. Letter Title / Salutation
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. My Dearest Suho-na, To My Soulmate..."
                    className={`w-full border rounded-2xl px-5 py-3.5 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all ${
                      isDarkMode
                        ? 'bg-[#221317] border-rose-900/40 text-rose-50 placeholder:text-rose-700'
                        : 'bg-pink-50/30 border-pink-200 text-slate-800 placeholder:text-pink-300'
                    }`}
                  />
                </div>

                {/* Prompt Ideas helper */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pink-500 flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>Need Inspiration? Tap a starter:</span>
                    </label>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {INSPIRATION_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setContent((prev) => (prev ? prev + '\n' + p : p))}
                        className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all ${
                          isDarkMode
                            ? 'bg-rose-950/40 border-rose-800/40 text-rose-300 hover:bg-rose-900/60'
                            : 'bg-pink-100/60 border-pink-200 text-pink-700 hover:bg-pink-200'
                        }`}
                      >
                        "{p.slice(0, 35)}..."
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Textarea with selected Parchment style! */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-pink-500">
                    4. Heartfelt Letter Content
                  </label>
                  <div
                    className={`relative rounded-3xl border-2 p-5 shadow-inner transition-all ${
                      PAPER_STYLES[paperStyle].bgDark
                    }`}
                  >
                    <textarea
                      rows={7}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your deepest feelings, romantic thoughts, or fond memories here... Suho-na will read every single word and treasure it forever."
                      className="w-full bg-transparent font-serif text-base leading-relaxed focus:outline-none resize-none placeholder:opacity-50"
                      required
                    />

                    <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs opacity-70 font-serif italic">
                      <span>From: {userName || 'Your Loving Partner'}</span>
                      <span>To: Suho-na ❤️</span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={!content.trim() || isSending}
                  className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/30 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Sealing & Sending to Suho-na...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Love Letter to Suho-na 💌</span>
                    </>
                  )}
                </motion.button>
              </form>
            )}

            {activeTab === 'vault' && !selectedLetter && (
              <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search love letters..."
                      className={`w-full pl-9 pr-4 py-2 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        isDarkMode
                          ? 'bg-[#221317] border-rose-900/40 text-rose-50'
                          : 'bg-pink-50/50 border-pink-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <div className="flex gap-1.5 bg-pink-100/50 dark:bg-rose-950/40 p-1 rounded-2xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setFilterSender('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        filterSender === 'all'
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-pink-600 dark:text-rose-300 hover:bg-pink-200/50'
                      }`}
                    >
                      All ({letters.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterSender('suhona')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        filterSender === 'suhona'
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-pink-600 dark:text-rose-300 hover:bg-pink-200/50'
                      }`}
                    >
                      From Suho-na 🌹
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterSender('user')}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        filterSender === 'user'
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-pink-600 dark:text-rose-300 hover:bg-pink-200/50'
                      }`}
                    >
                      From You 💌
                    </button>
                  </div>
                </div>

                {/* Letters Grid */}
                {filteredLetters.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-16 h-16 bg-pink-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto text-pink-500">
                      <Mail size={32} />
                    </div>
                    <h3 className="font-serif font-bold text-lg">No Love Letters Found</h3>
                    <p className="text-xs opacity-70 max-w-sm mx-auto">
                      Write your first heartfelt letter to Suho-na using the "Compose Letter" tab!
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('compose')}
                      className="px-5 py-2.5 bg-pink-500 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-pink-600 transition-colors"
                    >
                      Write a Love Letter Now ✍️
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLetters.map((l) => {
                      const paper = PAPER_STYLES[l.paperStyle || 'rose_petal'];
                      const st = STAMPS[l.stamp || 'heart'];
                      const isSuhona = l.sender === 'suhona';

                      return (
                        <motion.div
                          key={l.id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setSelectedLetter(l)}
                          className={`p-5 rounded-3xl border-2 shadow-md cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                            isDarkMode ? paper.bgDark : paper.bgLight
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/10 dark:border-white/10">
                              <span className="text-xs font-serif font-bold flex items-center gap-1.5">
                                <span className="text-base">{st.icon}</span>
                                <span>{isSuhona ? "Suho-na's Reply" : 'Your Letter'}</span>
                              </span>
                              <span className="text-[10px] opacity-60 font-mono">
                                {new Date(l.timestamp).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>

                            <h4 className="font-serif font-bold text-base mb-1.5 truncate">{l.title}</h4>
                            <p className="font-serif text-xs line-clamp-3 opacity-90 leading-relaxed mb-3">
                              {l.content}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                            <span className="italic opacity-70 font-serif">
                              {isSuhona ? 'From Suho-na ❤️' : `To Suho-na ❤️`}
                            </span>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {onToggleKeepsake && (
                                <button
                                  type="button"
                                  onClick={() => onToggleKeepsake(l.id)}
                                  className="p-1 rounded-full text-amber-500 hover:scale-110"
                                >
                                  <Bookmark size={14} className={l.isKeepsake ? 'fill-amber-500' : ''} />
                                </button>
                              )}

                              {onDeleteLetter && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteLetter(l.id)}
                                  className="p-1 rounded-full text-rose-400 hover:text-rose-600 hover:scale-110"
                                  title="Delete Letter"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Selected Letter Reader Modal View */}
            {activeTab === 'vault' && selectedLetter && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLetter(null)}
                    className="text-xs font-bold text-pink-500 hover:underline flex items-center gap-1"
                  >
                    ← Back to All Letters
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportLetter(selectedLetter)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-pink-100 dark:bg-rose-900/40 text-pink-600 dark:text-rose-200 flex items-center gap-1"
                    >
                      <Download size={14} />
                      <span>Export Letter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSpeech(selectedLetter.content)}
                      className={`p-2 rounded-full text-xs ${
                        isSpeaking ? 'bg-pink-500 text-white animate-pulse' : 'bg-pink-100 text-pink-600'
                      }`}
                      title="Read Aloud"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Parchment Display Card */}
                <div
                  className={`p-8 rounded-[2rem] border-2 shadow-xl relative overflow-hidden ${
                    PAPER_STYLES[selectedLetter.paperStyle || 'rose_petal'].bgDark
                  }`}
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h3 className="text-2xl font-serif font-bold mb-1">{selectedLetter.title}</h3>
                      <p className="text-xs opacity-70 font-serif">
                        From: {selectedLetter.sender === 'suhona' ? 'Suho-na ❤️' : userName || 'Your Partner'} | Date:{' '}
                        {new Date(selectedLetter.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-3xl">
                      {STAMPS[selectedLetter.stamp || 'heart'].icon}
                    </div>
                  </div>

                  <div className="font-serif text-base leading-loose whitespace-pre-wrap mb-8">
                    {selectedLetter.content}
                  </div>

                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between font-serif italic text-sm">
                    <span className="flex items-center gap-1 text-pink-500 font-bold">
                      <Heart size={16} className="fill-pink-500" />
                      {selectedLetter.sender === 'suhona' ? 'Forever devoted, Suho-na' : 'Forever yours'}
                    </span>

                    {selectedLetter.sender === 'suhona' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLetter(null);
                          setActiveTab('compose');
                        }}
                        className="px-4 py-2 bg-pink-500 text-white font-bold rounded-2xl text-xs hover:bg-pink-600 transition-colors"
                      >
                        Write Reply Letter ✍️
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
