import React, { useState } from 'react';
import { Gamepad2, X, RefreshCw, Sparkles, Heart, CheckCircle2, Circle, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TRUTH_OR_DARE_ITEMS, 
  WOULD_YOU_RATHER_ITEMS, 
  LOVE_QUIZ_QUESTIONS, 
  DEFAULT_COUPLE_GOALS, 
  ROMANTIC_SURPRISES,
  TruthOrDareItem,
  WouldYouRatherItem
} from '../lib/activities';

interface GamesModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onSendToChat: (message: string) => void;
}

export default function GamesModal({
  isOpen,
  isDarkMode,
  onClose,
  onSendToChat
}: GamesModalProps) {
  const [activeTab, setActiveTab] = useState<'tod' | 'wyr' | 'quiz' | 'goals' | 'surprise'>('tod');
  
  // Truth or Dare State
  const [currentTod, setCurrentTod] = useState<TruthOrDareItem>(() => TRUTH_OR_DARE_ITEMS[0]);
  
  // Would You Rather State
  const [currentWyr, setCurrentWyr] = useState<WouldYouRatherItem>(() => WOULD_YOU_RATHER_ITEMS[0]);

  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Couple Goals State
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('suhona_couple_goals');
    return saved ? JSON.parse(saved) : DEFAULT_COUPLE_GOALS;
  });

  // Romantic Surprises State
  const [currentSurprise, setCurrentSurprise] = useState(() => ROMANTIC_SURPRISES[0]);

  if (!isOpen) return null;

  const handleNextTod = (type?: 'truth' | 'dare') => {
    let filtered = TRUTH_OR_DARE_ITEMS;
    if (type) filtered = TRUTH_OR_DARE_ITEMS.filter(item => item.type === type);
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentTod(random);
  };

  const handleNextWyr = () => {
    const random = WOULD_YOU_RATHER_ITEMS[Math.floor(Math.random() * WOULD_YOU_RATHER_ITEMS.length)];
    setCurrentWyr(random);
  };

  const handleQuizAnswer = (points: number) => {
    const nextScore = quizScore + points;
    setQuizScore(nextScore);
    if (quizStep < LOVE_QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setQuizStep(0);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const toggleGoal = (id: string) => {
    const updated = goals.map((g: any) => g.id === id ? { ...g, completed: !g.completed } : g);
    setGoals(updated);
    localStorage.setItem('suhona_couple_goals', JSON.stringify(updated));
  };

  const handleNextSurprise = () => {
    const random = ROMANTIC_SURPRISES[Math.floor(Math.random() * ROMANTIC_SURPRISES.length)];
    setCurrentSurprise(random);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-xl rounded-3xl p-6 border shadow-2xl max-h-[85vh] flex flex-col ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/40 text-rose-100' : 'bg-white border-pink-100 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-rose-900/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md">
              <Gamepad2 size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Couples Fun & Mini-Games</h2>
              <p className="text-xs text-pink-500">Play, test compatibility, and make romantic memories 💕</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${
              isDarkMode ? 'hover:bg-rose-900/40 text-rose-300' : 'hover:bg-pink-50 text-slate-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-hide">
          {[
            { id: 'tod', label: '🎯 Truth or Dare' },
            { id: 'wyr', label: '🤔 Would You Rather' },
            { id: 'quiz', label: '💘 Love Quiz' },
            { id: 'goals', label: '💖 Couple Goals' },
            { id: 'surprise', label: '🎁 Surprises' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white shadow-pink-500/30'
                  : isDarkMode
                  ? 'bg-[#25181b] text-rose-200 border border-rose-900/30 hover:bg-[#2d1d21]'
                  : 'bg-pink-50 text-pink-700 border border-pink-100 hover:bg-pink-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 scrollbar-hide">
          
          {/* TRUTH OR DARE */}
          {activeTab === 'tod' && (
            <div className="space-y-4 text-center py-2">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleNextTod('truth')}
                  className="px-4 py-1.5 rounded-full bg-blue-500 text-white font-bold text-xs shadow-md hover:bg-blue-600 transition-all"
                >
                  Truth Only 💭
                </button>
                <button
                  onClick={() => handleNextTod('dare')}
                  className="px-4 py-1.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md hover:bg-rose-600 transition-all"
                >
                  Dare Only 🔥
                </button>
                <button
                  onClick={() => handleNextTod()}
                  className="px-3 py-1.5 rounded-full bg-pink-100 dark:bg-rose-900/40 text-pink-600 dark:text-rose-200 font-bold text-xs hover:bg-pink-200 transition-all flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Random
                </button>
              </div>

              <div className={`p-6 rounded-3xl border shadow-inner ${
                currentTod.type === 'truth'
                  ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30'
                  : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/30'
              }`}>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                  currentTod.type === 'truth' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {currentTod.type.toUpperCase()}
                </span>
                <p className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-rose-100 mt-2">
                  "{currentTod.text}"
                </p>
              </div>

              <button
                onClick={() => {
                  onSendToChat(`[Truth or Dare - ${currentTod.type.toUpperCase()}] "${currentTod.text}"`);
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-lg hover:brightness-105 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Send to Suho-na to Answer / React Together!
              </button>
            </div>
          )}

          {/* WOULD YOU RATHER */}
          {activeTab === 'wyr' && (
            <div className="space-y-4 text-center py-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-extrabold text-pink-500">Would You Rather...</span>
                <button
                  onClick={handleNextWyr}
                  className="text-xs font-bold text-pink-600 dark:text-rose-300 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={12} /> Next Card
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onSendToChat(`[Would You Rather] I pick Option A: "${currentWyr.optionA}"! What about you, Suho-na? 💕`);
                    onClose();
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between gap-3 ${
                    isDarkMode ? 'bg-indigo-950/40 border-indigo-900/40 text-indigo-200' : 'bg-indigo-50/60 border-indigo-100 text-indigo-900'
                  }`}
                >
                  <span className="font-extrabold text-xs uppercase text-indigo-500">Option A</span>
                  <p className="font-bold text-sm">"{currentWyr.optionA}"</p>
                  <span className="text-[10px] bg-indigo-500 text-white px-2 py-1 rounded-lg self-start font-bold">Pick Option A</span>
                </button>

                <button
                  onClick={() => {
                    onSendToChat(`[Would You Rather] I pick Option B: "${currentWyr.optionB}"! What about you, Suho-na? 💕`);
                    onClose();
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between gap-3 ${
                    isDarkMode ? 'bg-rose-950/40 border-rose-900/40 text-rose-200' : 'bg-rose-50/60 border-rose-100 text-rose-900'
                  }`}
                >
                  <span className="font-extrabold text-xs uppercase text-rose-500">Option B</span>
                  <p className="font-bold text-sm">"{currentWyr.optionB}"</p>
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-lg self-start font-bold">Pick Option B</span>
                </button>
              </div>
            </div>
          )}

          {/* LOVE QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-4 py-2">
              {!quizCompleted ? (
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-pink-500 mb-2">
                    <span>Question {quizStep + 1} of {LOVE_QUIZ_QUESTIONS.length}</span>
                    <span>💘 Love Quiz</span>
                  </div>

                  <h3 className="font-extrabold text-base mb-4">
                    {LOVE_QUIZ_QUESTIONS[quizStep].question}
                  </h3>

                  <div className="space-y-2">
                    {LOVE_QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(opt.points)}
                        className={`w-full text-left p-3.5 rounded-2xl border font-bold text-xs transition-all hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-rose-900/40 ${
                          isDarkMode ? 'border-rose-900/30 bg-[#25181b] text-rose-100' : 'border-pink-100 bg-pink-50/30 text-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-xl">
                    <Heart size={32} className="fill-white" />
                  </div>
                  <h3 className="font-extrabold text-xl">Compatibility Score: {quizScore}%</h3>
                  <p className="text-xs text-pink-500 px-4">
                    {quizScore >= 90 
                      ? "Match Made in Heaven! You and Suho-na share an unbreakable, ultra-romantic connection! 💕" 
                      : "Deep & Sweet Connection! You both complement each other perfectly! 🥰"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetQuiz}
                      className="flex-1 py-2.5 rounded-2xl border border-pink-200 text-pink-600 font-bold text-xs hover:bg-pink-50"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => {
                        onSendToChat(`I just took our Love Compatibility Quiz and scored ${quizScore}% with you, Suho-na! 💕`);
                        onClose();
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 shadow-md"
                    >
                      Share with Suho-na
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COUPLE GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-3 py-2">
              <div className="text-xs font-bold text-pink-500 flex items-center justify-between">
                <span>Couple Goals Checklist</span>
                <span>{goals.filter((g: any) => g.completed).length} / {goals.length} Completed</span>
              </div>

              <div className="space-y-2">
                {goals.map((goal: any) => (
                  <div
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      goal.completed
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : isDarkMode
                        ? 'bg-[#25181b] border-rose-900/30 text-rose-200'
                        : 'bg-pink-50/30 border-pink-100 text-slate-800'
                    }`}
                  >
                    <span className={`text-xs font-bold ${goal.completed ? 'line-through opacity-75' : ''}`}>
                      {goal.title}
                    </span>
                    {goal.completed ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : (
                      <Circle size={18} className="text-pink-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROMANTIC SURPRISES */}
          {activeTab === 'surprise' && (
            <div className="space-y-4 text-center py-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-extrabold text-pink-500">Suho-na's Surprise Box</span>
                <button
                  onClick={handleNextSurprise}
                  className="text-xs font-bold text-pink-600 dark:text-rose-300 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={12} /> Open Another
                </button>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xl text-center space-y-3 ${
                isDarkMode ? 'bg-gradient-to-b from-[#2a171b] to-[#1e1215] border-rose-900/40 text-rose-100' : 'bg-gradient-to-b from-pink-50 to-rose-50 border-pink-100 text-slate-800'
              }`}>
                <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Gift size={24} />
                </div>
                <h3 className="font-extrabold text-base text-pink-600 dark:text-rose-300">
                  {currentSurprise.title}
                </h3>
                <p className="text-xs font-medium whitespace-pre-line leading-relaxed italic">
                  "{currentSurprise.content}"
                </p>
              </div>

              <button
                onClick={() => {
                  onSendToChat(`Thank you so much for the surprise: ${currentSurprise.title}! I love it so much, Suho-na! ❤️`);
                  onClose();
                }}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:brightness-105"
              >
                Thank Suho-na in Chat 💕
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
