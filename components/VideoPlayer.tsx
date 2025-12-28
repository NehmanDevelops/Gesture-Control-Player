'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  volume: number; // 0 to 1
}

export default function VideoPlayer({ volume }: VideoPlayerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startTestTone = () => {
    if (audioContextRef.current && !oscillatorRef.current) {
      try {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';
        gainNode.gain.value = volume * 0.3; // Start at current volume
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.start();
        
        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;
        setIsPlaying(true);
      } catch (error) {
        console.error('Error starting tone:', error);
      }
    }
  };

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        // Auto-start the test tone after a short delay (for user interaction)
        setTimeout(() => {
          startTestTone();
        }, 500);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Update audio volume when volume prop changes
  useEffect(() => {
    if (gainNodeRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      gainNodeRef.current.gain.value = clampedVolume * 0.3; // Keep it at reasonable level (30% max)
    }
  }, [volume]);

  const stopTestTone = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
      gainNodeRef.current = null;
      setIsPlaying(false);
    }
  };

  const toggleTone = () => {
    if (isPlaying) {
      stopTestTone();
    } else {
      startTestTone();
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
      {/* Audio Test Tone Visualizer */}
      <div className="text-center p-8">
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.2, 1] : 1,
            opacity: isPlaying ? [0.7, 1, 0.7] : 0.5,
          }}
          transition={{
            duration: 1,
            repeat: isPlaying ? Infinity : 0,
          }}
          className="text-8xl mb-6"
        >
          🔊
        </motion.div>
        
        <div className="text-2xl font-bold text-cyan-400 mb-4">
          Audio Test Tone
        </div>
        
        <div className="text-slate-300 mb-6">
          {isPlaying ? 'Playing 440 Hz tone' : 'Tone stopped'}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTone}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? '⏹ Stop Tone' : '▶ Play Tone'}
        </motion.button>
        
        <div className="mt-6 text-sm text-slate-400">
          Use your index finger gestures to control volume
        </div>
      </div>

      {/* Volume Indicator */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
        <div className="text-cyan-400 font-semibold">Audio Test</div>
        <div className="text-slate-300 mt-1">
          Volume: {Math.round(volume * 100)}%
        </div>
        <div className="text-slate-400 mt-1 text-[10px]">
          {isPlaying ? 'Tone is playing' : 'Click to start'}
        </div>
      </div>
    </div>
  );
}

