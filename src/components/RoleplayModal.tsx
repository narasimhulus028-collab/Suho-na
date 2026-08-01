import React from 'react';
import { Sparkles, MapPin, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ROLEPLAY_SCENARIOS } from '../lib/roleplay';
import { RoleplayScenario } from '../types';

interface RoleplayModalProps {
  isOpen: boolean;
  activeScenarioId: string | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: RoleplayScenario) => void;
  onExitScenario: () => void;
}

export default function RoleplayModal({
  isOpen,
  activeScenarioId,
  isDarkMode,
  onClose,
  onSelectScenario,
  onExitScenario
}: RoleplayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl max-h-[85vh] flex flex-col ${
          isDarkMode ? 'bg-[#1a1012] border-rose-900/40 text-rose-100' : 'bg-white border-pink-100 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-100 dark:border-rose-900/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Romantic Roleplay Dates</h2>
              <p className="text-xs text-pink-500">Pick a romantic scenario to act out together with Suho-na 💕</p>
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

        {/* Active Scenario Banner */}
        {activeScenarioId && (
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-pink-500/15 to-rose-500/15 border border-pink-300/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-rose-300">
              <span className="text-base">🎭</span>
              <span>Currently Playing: {ROLEPLAY_SCENARIOS.find(s => s.id === activeScenarioId)?.name}</span>
            </div>
            <button
              onClick={() => {
                onExitScenario();
                onClose();
              }}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Exit Date
            </button>
          </div>
        )}

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 overflow-y-auto pr-1 flex-1 scrollbar-hide">
          {ROLEPLAY_SCENARIOS.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <div
                key={scenario.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-400'
                    : isDarkMode
                    ? 'border-rose-900/30 bg-[#25181b] hover:border-pink-500/40 hover:bg-[#2d1d21]'
                    : 'border-pink-100 bg-pink-50/30 hover:border-pink-300 hover:bg-pink-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{scenario.emoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 dark:bg-rose-900/40 text-pink-600 dark:text-rose-300 flex items-center gap-1">
                      <MapPin size={10} /> {scenario.location}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm mb-1">{scenario.name}</h3>
                  <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-rose-300/80' : 'text-slate-600'}`}>
                    {scenario.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onSelectScenario(scenario);
                    onClose();
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                    isActive
                      ? 'bg-rose-500 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-105'
                  }`}
                >
                  <span>{isActive ? 'Continue Date' : 'Start Date'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
