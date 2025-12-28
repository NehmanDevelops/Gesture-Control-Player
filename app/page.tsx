'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraView from '@/components/CameraView';
import VolumeControl from '@/components/VolumeControl';
import VideoPlayer from '@/components/VideoPlayer';
import HowToUseModal from '@/components/HowToUseModal';
import { useSystemVolume } from '@/hooks/useSystemVolume';
// Simple HelpCircle icon component
const HelpCircleIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default function Home() {
  const [volume, setVolume] = useState(0.5);
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [appEnabled, setAppEnabled] = useState(false);
  const [indexFingerUp, setIndexFingerUp] = useState(false);
  const [indexFingerDown, setIndexFingerDown] = useState(false);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Control system volume
  useSystemVolume(volume);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleIndexFingerState = (isUp: boolean, isDown: boolean) => {
    setIndexFingerUp(isUp);
    setIndexFingerDown(isDown);
    setIsActive(isUp || isDown);
    
    // Clear any existing interval
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    
    // Gradually increase volume when index finger is up
    if (isUp) {
      volumeIntervalRef.current = setInterval(() => {
        setVolume((prev) => {
          const newVol = Math.min(1, prev + 0.01); // Increase by 1% every 100ms
          return newVol;
        });
      }, 100);
    }
    // Gradually decrease volume when index finger is down
    else if (isDown) {
      volumeIntervalRef.current = setInterval(() => {
        setVolume((prev) => {
          const newVol = Math.max(0, prev - 0.01); // Decrease by 1% every 100ms
          return newVol;
        });
      }, 100);
    }
  };
  
  useEffect(() => {
    return () => {
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 mb-2">
            Gesture Control Player
          </h1>
          <p className="text-slate-400 text-lg md:text-xl">
            Minority Report Style Interface
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left: Camera View */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:order-1"
          >
            <div className="relative aspect-video w-full">
              {appEnabled ? (
                <>
                  <CameraView 
                    onVolumeChange={() => {}} 
                    onIndexFingerState={handleIndexFingerState}
                    isMobile={isMobile} 
                    enabled={appEnabled} 
                  />
                  {/* Big Volume Indicator */}
                  <AnimatePresence>
                    {indexFingerUp && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                      >
                        <div className="bg-green-500/90 backdrop-blur-md px-12 py-8 rounded-2xl border-4 border-green-400 shadow-2xl">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-6xl mb-4 text-center"
                          >
                            🔊
                          </motion.div>
                          <div className="text-5xl md:text-7xl font-bold text-white text-center">
                            INCREASING VOLUME
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {indexFingerDown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                      >
                        <div className="bg-red-500/90 backdrop-blur-md px-12 py-8 rounded-2xl border-4 border-red-400 shadow-2xl">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-6xl mb-4 text-center"
                          >
                            🔉
                          </motion.div>
                          <div className="text-5xl md:text-7xl font-bold text-white text-center">
                            DECREASING VOLUME
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="relative w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8"
                  >
                    <div className="text-6xl mb-4">👋</div>
                    <div className="text-slate-400 text-lg mb-6">
                      Ready to start gesture control
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAppEnabled(true)}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all"
                    >
                      Turn On App
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Media Player Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:order-2"
          >
            <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-cyan-500/20 shadow-2xl h-full flex flex-col">
              {/* Video Player for Testing */}
              <div className="flex-1 bg-slate-900 rounded-lg mb-6 relative overflow-hidden min-h-[300px]">
                <VideoPlayer volume={volume} />
              </div>

              {/* Volume Control */}
              <VolumeControl volume={volume} isActive={isActive} />

              {/* Gesture Controls Panel */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Gesture Controls</h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-green-400">👆</span>
                      <span>Index finger up</span>
                    </span>
                    <span className="text-green-400 font-semibold">→ Volume ↑</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-red-400">👇</span>
                      <span>Index finger down</span>
                    </span>
                    <span className="text-red-400 font-semibold">→ Volume ↓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>✋</span>
                      <span>Neutral position</span>
                    </span>
                    <span className="text-slate-400">→ Hold volume</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500/30 rounded"></div>
                    <span>Top zone = High volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/30 rounded"></div>
                    <span>Bottom zone = Low volume</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-400">Status</span>
                  <motion.div
                    animate={{
                      color: isActive ? '#22c55e' : appEnabled ? '#64748b' : '#ef4444',
                    }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 1,
                        repeat: isActive ? Infinity : 0,
                      }}
                      className="w-2 h-2 rounded-full bg-current"
                    />
                    <span>{isActive ? 'Active' : appEnabled ? 'Idle' : 'Off'}</span>
                  </motion.div>
                </div>
                {appEnabled && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAppEnabled(false);
                      setIsActive(false);
                      setVolume(0.5);
                    }}
                    className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Turn Off App
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Help Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 z-30"
        >
          <button
            onClick={() => setShowModal(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="How to use"
          >
            <HelpCircleIcon size={24} />
          </button>
        </motion.div>

        {/* How to Use Modal */}
        <HowToUseModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </main>
  );
}

