import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HEART_REACTIONS, HeartReaction } from '../types';

interface MessageReactionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReaction: (reactionKey: string) => void;
  activeReactions?: string[];
  isDarkMode?: boolean;
  alignRight?: boolean;
}

export default function MessageReactionPicker({
  isOpen,
  onClose,
  onSelectReaction,
  activeReactions = [],
  isDarkMode = false,
  alignRight = false,
}: MessageReactionPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay to close picker when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            onContextMenu={(e) => {
              e.preventDefault();
              onClose();
            }}
          />

          {/* Floating Heart Reaction Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`absolute z-50 -top-12 ${
              alignRight ? 'right-0' : 'left-0'
            } flex items-center gap-1 p-1.5 rounded-full shadow-xl border backdrop-blur-md transition-all ${
              isDarkMode
                ? 'bg-[#1a1012]/95 border-pink-500/30 text-rose-100 shadow-pink-950/50'
                : 'bg-white/95 border-pink-200 text-slate-800 shadow-pink-500/20'
            }`}
          >
            {HEART_REACTIONS.map((item: HeartReaction) => {
              const isActive = activeReactions.includes(item.id) || activeReactions.includes(item.emoji);
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ scale: 1.3, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectReaction(item.id);
                    onClose();
                  }}
                  className={`relative p-1.5 rounded-full text-lg sm:text-xl flex items-center justify-center transition-all group ${
                    isActive
                      ? 'bg-pink-500/20 ring-2 ring-pink-500/80 scale-110'
                      : 'hover:bg-pink-500/10'
                  }`}
                  title={`${item.label} (${item.emoji})`}
                >
                  <span>{item.emoji}</span>

                  {/* Tooltip Label */}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap z-10 shadow-sm">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
