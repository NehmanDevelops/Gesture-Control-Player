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
    const wasUp = indexFingerUp;
    const wasDown = indexFingerDown;
    
    setIndexFingerUp(isUp);
    setIndexFingerDown(isDown);
    setIsActive(isUp || isDown);
    
    // Always clear existing interval first to prevent duplicates
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    
    // Gradually increase volume when index finger is up
    if (isUp) {
      // Start new interval - update more frequently for smoother control
      volumeIntervalRef.current = setInterval(() => {
        setVolume((prev) => {
          const newVol = Math.min(1, prev + 0.02); // Increase by 2% every 33ms
          return newVol;
        });
      }, 33); // ~30fps update rate for smooth control
    }
    // Gradually decrease volume when index finger is down
    else if (isDown) {
      // Start new interval
      volumeIntervalRef.current = setInterval(() => {
        setVolume((prev) => {
          const newVol = Math.max(0, prev - 0.02); // Decrease by 2% every 33ms
          return newVol;
        });
      }, 33); // ~30fps update rate for smooth control
    }
    // When neutral, volume stays the same (interval already cleared above)
  };
  
  useEffect(() => {
    return () => {
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Minority Report style gesture UI</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">Local demo</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-indigo-300 md:text-6xl">
              Gesture Control Player
            </h1>
            <p className="max-w-2xl text-pretty text-base text-slate-300 md:text-lg">
              Use your camera to control system volume with simple index-finger gestures. Turn it on, raise your hand, and watch the interface respond.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAppEnabled((v) => !v)}
                className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-colors ${
                  appEnabled
                    ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white'
                }`}
              >
                {appEnabled ? 'Disable Camera' : 'Enable Camera'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:bg-white/10"
              >
                How to use
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Left: Camera View */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:order-1"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur md:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Camera</div>
                  <div className="text-xs text-slate-400">Hand tracking overlay + gesture detection</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${appEnabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-300'}`}>
                  {appEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900/60 ring-1 ring-white/10">
                {appEnabled ? (
                  <>
                    <CameraView 
                      onVolumeChange={() => {}} 
                      onIndexFingerState={handleIndexFingerState}
                      isMobile={isMobile} 
                      enabled={appEnabled} 
                    />
                    {/* Volume Direction Indicator - Aesthetic Arrow */}
                    <AnimatePresence>
                      {indexFingerUp && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.9 }}
                          className="absolute top-5 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
                        >
                          <div className="bg-emerald-500/80 backdrop-blur-md px-5 py-3 rounded-xl border border-emerald-300/40 shadow-xl flex items-center gap-3">
                            <motion.svg
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-7 h-7 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                            </motion.svg>
                            <span className="text-white font-semibold">Increasing</span>
                          </div>
                        </motion.div>
                      )}
                      {indexFingerDown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute top-5 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
                        >
                          <div className="bg-red-500/80 backdrop-blur-md px-5 py-3 rounded-xl border border-red-300/40 shadow-xl flex items-center gap-3">
                            <motion.svg
                              animate={{ y: [0, 5, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-7 h-7 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                            </motion.svg>
                            <span className="text-white font-semibold">Decreasing</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-8"
                    >
                      <div className="text-6xl mb-4">👋</div>
                      <div className="text-slate-300 text-lg font-semibold mb-2">
                        Enable camera to start
                      </div>
                      <div className="text-slate-400 text-sm mb-6">
                        You can disable anytime. No data is uploaded.
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAppEnabled(true)}
                        className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-lg transition-all"
                      >
                        Enable Camera
                      </motion.button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Media Player Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:order-2"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur md:p-6 h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Dashboard</div>
                  <div className="text-xs text-slate-400">Audio demo + live volume feedback</div>
                </div>
                <motion.div
                  animate={{
                    color: isActive ? '#22c55e' : appEnabled ? '#94a3b8' : '#ef4444',
                  }}
                  className="flex items-center gap-2 text-xs font-semibold"
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <span>{isActive ? 'Active' : appEnabled ? 'Idle' : 'Off'}</span>
                </motion.div>
              </div>

              {/* Video Player for Testing */}
              <div className="flex-1 rounded-xl mb-6 relative overflow-hidden min-h-[280px] bg-slate-900/60 ring-1 ring-white/10">
                <VideoPlayer volume={volume} />
              </div>

              {/* Volume Control */}
              <VolumeControl volume={volume} isActive={isActive} />

              {/* Gesture Controls Panel */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-cyan-300 mb-3">Gesture Controls</h3>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-green-400">👆</span>
                      <span>Index finger up</span>
                    </span>
                    <span className="text-green-300 font-semibold">Volume ↑</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-red-400">👇</span>
                      <span>Index finger down</span>
                    </span>
                    <span className="text-red-300 font-semibold">Volume ↓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>✋</span>
                      <span>Neutral position</span>
                    </span>
                    <span className="text-slate-400">Hold</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-400">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500/25 rounded"></div>
                    <span>Top zone = High volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/25 rounded"></div>
                    <span>Bottom zone = Low volume</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-6 pt-6 border-t border-white/10">
                {appEnabled && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAppEnabled(false);
                      setIsActive(false);
                      setVolume(0.5);
                    }}
                    className="w-full bg-slate-700/70 hover:bg-slate-600/70 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
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
            className="bg-cyan-500/90 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg shadow-cyan-500/10 transition-all hover:scale-110 ring-1 ring-white/10"
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

