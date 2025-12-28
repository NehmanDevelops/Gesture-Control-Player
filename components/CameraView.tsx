'use client';

import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useHandTracking } from '@/hooks/useHandTracking';
import { motion } from 'framer-motion';

interface CameraViewProps {
  onVolumeChange: (volume: number) => void;
  onIndexFingerState: (isUp: boolean, isDown: boolean) => void;
  onNeutralState?: (isNeutral: boolean) => void;
  isMobile?: boolean;
  enabled?: boolean;
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17], // Palm
];

export default function CameraView({ onVolumeChange, onIndexFingerState, onNeutralState, isMobile = false, enabled = true }: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const { isLoading, error, handResult, detectHands, isInitialized } = useHandTracking();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!enabled || !isInitialized || !webcamRef.current?.video) {
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    const updateCanvasSize = () => {
      if (video && canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }
    };

    updateCanvasSize();
    video.addEventListener('loadedmetadata', updateCanvasSize);

    const drawHand = () => {
      if (!handResult || !ctx) return;

      const { landmarks, indexFingerUp, indexFingerDown } = handResult;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw hand connections (skeleton)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)'; // Cyan-500 with opacity
      ctx.lineWidth = 2;
      ctx.beginPath();

      HAND_CONNECTIONS.forEach(([start, end]) => {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        if (startPoint && endPoint) {
          ctx.moveTo(startPoint.x * width, startPoint.y * height);
          ctx.lineTo(endPoint.x * width, endPoint.y * height);
        }
      });
      ctx.stroke();

      // Draw all landmarks as small circles
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      landmarks.forEach((landmark) => {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Highlight index finger tip prominently
      const indexTip = landmarks[8];
      const indexMCP = landmarks[5];
      
      // Draw index finger connection with highlight
      ctx.strokeStyle = indexFingerUp ? '#22c55e' : indexFingerDown ? '#ef4444' : 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = indexFingerUp || indexFingerDown ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(indexMCP.x * width, indexMCP.y * height);
      ctx.lineTo(indexTip.x * width, indexTip.y * height);
      ctx.stroke();
      
      // Highlight index finger tip with larger circle
      ctx.fillStyle = indexFingerUp ? '#22c55e' : indexFingerDown ? '#ef4444' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(indexTip.x * width, indexTip.y * height, indexFingerUp || indexFingerDown ? 15 : 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw white center dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(indexTip.x * width, indexTip.y * height, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Highlight other fingertips in Cyan (smaller)
      const otherFingertips = [4, 12, 16, 20]; // Thumb, Middle, Ring, Pinky tips
      ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
      otherFingertips.forEach((index) => {
        const tip = landmarks[index];
        ctx.beginPath();
        ctx.arc(tip.x * width, tip.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    const processFrame = () => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const timestamp = performance.now();
        detectHands(video, timestamp);
        drawHand();

        // Update index finger / neutral state
        if (handResult) {
          onIndexFingerState(handResult.indexFingerUp, handResult.indexFingerDown);
          onNeutralState?.(handResult.isOpenPalm);
        }
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      video.removeEventListener('loadedmetadata', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isInitialized, handResult, detectHands, onIndexFingerState, isPlaying]);

  const handleUserMedia = () => {
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-slate-900 rounded-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-cyan-500 text-xl font-semibold mb-2">Loading AI...</div>
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-slate-900 rounded-lg">
        <div className="text-red-500 text-center p-4">
          <div className="text-xl font-semibold mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <Webcam
        ref={webcamRef}
        audio={false}
        videoConstraints={{
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: isMobile ? 'user' : 'environment',
        }}
        onUserMedia={handleUserMedia}
        className="w-full h-full object-cover"
        mirrored
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      />
      {handResult && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
          <div className="text-cyan-400 flex items-center gap-2">
            {handResult.indexFingerUp && <span className="text-green-400">👆</span>}
            {handResult.indexFingerDown && <span className="text-red-400">👇</span>}
            {handResult.isOpenPalm && <span>🖐️</span>}
            {!handResult.isOpenPalm && !handResult.indexFingerUp && !handResult.indexFingerDown && <span>✋</span>}
            <span>Hand Detected</span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            {handResult.indexFingerUp && 'Index Finger: UP'}
            {handResult.indexFingerDown && 'Index Finger: DOWN'}
            {handResult.isOpenPalm && 'Neutral: OPEN PALM'}
            {!handResult.isOpenPalm && !handResult.indexFingerUp && !handResult.indexFingerDown && 'Neutral: Other'}
          </div>
        </div>
      )}
    </div>
  );
}

