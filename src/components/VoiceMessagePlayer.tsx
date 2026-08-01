import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Mic, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { VoiceSettings } from '../types';
import { speakText, stopSpeaking, isSpeaking } from '../lib/voice';

interface VoiceMessagePlayerProps {
  content: string;
  role: 'user' | 'assistant';
  audioDuration?: number;
  voiceSettings: VoiceSettings;
  isDarkMode: boolean;
  autoPlay?: boolean;
}

export default function VoiceMessagePlayer({
  content,
  role,
  audioDuration = 5,
  voiceSettings,
  isDarkMode,
  autoPlay = false
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Clean duration string (0:05)
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (autoPlay && role === 'assistant' && voiceSettings.enabled) {
      handlePlay();
    }
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      setPlaybackProgress(0);
      return;
    }

    setIsPlaying(true);
    setPlaybackProgress(0);

    const interval = setInterval(() => {
      setPlaybackProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (audioDuration * 10));
      });
    }, 100);

    speakText(
      content,
      voiceSettings,
      () => setIsPlaying(true),
      () => {
        setIsPlaying(false);
        setPlaybackProgress(100);
        clearInterval(interval);
      }
    );
  };

  return (
    <div className="space-y-2 py-1">
      {/* Voice Message Badge */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-80">
        <Mic size={12} className={role === 'assistant' ? 'text-pink-300' : 'text-white'} />
        <span>{role === 'assistant' ? "Suho-na's Voice Note 💕" : "Your Voice Message 🎙️"}</span>
      </div>

      {/* Voice Player Controls & Waveform Bar */}
      <div className={`p-3 rounded-2xl flex items-center gap-3 border shadow-sm ${
        role === 'user'
          ? 'bg-pink-600/40 border-pink-400/40 text-white'
          : isDarkMode
          ? 'bg-rose-950/50 border-rose-800/40 text-rose-100'
          : 'bg-pink-50/80 border-pink-100 text-slate-800'
      }`}>
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handlePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md flex-shrink-0 ${
            role === 'user'
              ? 'bg-white text-pink-600 hover:bg-pink-50'
              : 'bg-pink-500 text-white hover:bg-pink-600'
          }`}
          title={isPlaying ? "Pause Voice Message" : "Play Voice Message"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        {/* Audio Waveform Graphic */}
        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-0.5 h-6">
            {[35, 65, 40, 90, 75, 45, 80, 50, 100, 60, 40, 70, 85, 30, 95, 50, 75, 40].map((height, i) => (
              <motion.div
                key={i}
                className={`w-1 rounded-full ${
                  role === 'user'
                    ? 'bg-white'
                    : isDarkMode
                    ? 'bg-rose-400'
                    : 'bg-pink-500'
                }`}
                animate={isPlaying ? {
                  height: [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`]
                } : {
                  height: `${height * 0.5}%`
                }}
                transition={isPlaying ? {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.05
                } : { duration: 0.2 }}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] opacity-75 font-mono font-medium">
            <span>{isPlaying ? 'Playing...' : 'Tap to listen'}</span>
            <span>{formatSeconds(audioDuration)}</span>
          </div>
        </div>
      </div>

      {/* Transcript text */}
      <p className="text-xs opacity-90 italic pl-1 border-l-2 border-pink-400/50">
        "{content}"
      </p>
    </div>
  );
}
