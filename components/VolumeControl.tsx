'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface VolumeControlProps {
  volume: number; // 0 to 1
  isActive: boolean;
}

export default function VolumeControl({ volume, isActive }: VolumeControlProps) {
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isActive && Math.abs(volume - previousVolume) > 0.05) {
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 500);
      return () => clearTimeout(timer);
    }
    setPreviousVolume(volume);
  }, [volume, isActive, previousVolume]);

  const volumePercentage = Math.round(volume * 100);
  const isIncreasing = volume > previousVolume;

  return (
    <div className="w-full space-y-6">
      {/* Volume Bar */}
      <div className="relative">
        <div className="text-sm text-slate-400 mb-2 flex justify-between">
          <span>Volume</span>
          <span className="text-cyan-400 font-semibold">{volumePercentage}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${volumePercentage}%` }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Volume Indicator */}
      <AnimatePresence>
        {showIndicator && isActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-2 text-cyan-400"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              {isIncreasing ? '🔊' : '🔉'}
            </motion.div>
            <span className="text-lg font-semibold">
              {isIncreasing ? 'Volume Up' : 'Volume Down'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visualizer Bars */}
      <div className="flex items-end justify-center gap-1 h-32">
        {Array.from({ length: 20 }).map((_, i) => {
          const barHeight = isActive
            ? Math.random() * volume * 100 + 20
            : 20;
          const delay = i * 0.05;
          
          return (
            <motion.div
              key={i}
              className="w-2 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t"
              initial={{ height: 20 }}
              animate={{
                height: isActive ? barHeight : 20,
              }}
              transition={{
                duration: 0.3,
                delay,
                ease: 'easeOut',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

