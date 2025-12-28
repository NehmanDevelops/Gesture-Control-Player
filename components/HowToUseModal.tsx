'use client';

import { motion, AnimatePresence } from 'framer-motion';
// Simple X icon component
const XIcon = ({ size = 24 }: { size?: number }) => (
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
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToUseModal({ isOpen, onClose }: HowToUseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-cyan-500/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">How to Use</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <XIcon size={24} />
                </button>
              </div>
              
              <div className="space-y-4 text-slate-300">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">Gesture Controls</h3>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-cyan-400 text-2xl">👋</div>
                  <div>
                    <div className="font-semibold text-cyan-400 mb-1">Raise Your Hand</div>
                    <div className="text-sm">Position your hand in front of the camera to begin tracking</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-2xl">👆</div>
                  <div>
                    <div className="font-semibold text-green-400 mb-1">Raise Index Finger</div>
                    <div className="text-sm">Point your index finger up and hold → <span className="text-green-400">Volume increases gradually</span></div>
                    <div className="text-xs text-slate-400 mt-1">Keep finger raised to continue increasing</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-red-400 text-2xl">👇</div>
                  <div>
                    <div className="font-semibold text-red-400 mb-1">Lower Index Finger</div>
                    <div className="text-sm">Point your index finger down and hold → <span className="text-red-400">Volume decreases gradually</span></div>
                    <div className="text-xs text-slate-400 mt-1">Keep finger down to continue decreasing</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-cyan-400 text-2xl">✋</div>
                  <div>
                    <div className="font-semibold text-cyan-400 mb-1">Neutral Position</div>
                    <div className="text-sm">Make a fist → <span className="text-slate-300">Volume stays the same</span></div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-400 space-y-2">
                    <div>
                      <strong className="text-cyan-400">Visual Indicators:</strong>
                    </div>
                    <div>• <span className="text-green-400">Green zone</span> at top = High volume area</div>
                    <div>• <span className="text-red-400">Red zone</span> at bottom = Low volume area</div>
                    <div>• <span className="text-cyan-400">Cyan skeleton</span> shows your hand tracking</div>
                    <div>• <span className="text-green-400">↑ arrow</span> appears when moving up</div>
                    <div>• <span className="text-red-400">↓ arrow</span> appears when moving down</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

