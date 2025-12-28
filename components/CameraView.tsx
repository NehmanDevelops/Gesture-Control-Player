'use client';

import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useHandTracking } from '@/hooks/useHandTracking';
import { motion } from 'framer-motion';

interface CameraViewProps {
  onVolumeChange: (volume: number) => void;
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

export default function CameraView({ onVolumeChange, isMobile = false, enabled = true }: CameraViewProps) {
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

      const { landmarks, handPosition, volumeLevel, movementDirection } = handResult;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw volume zones (gradient background)
      const topZoneHeight = height * 0.1; // Top 10% = max volume
      const bottomZoneHeight = height * 0.9; // Bottom 90% = min volume
      
      // Top zone (high volume) - green gradient
      const topGradient = ctx.createLinearGradient(0, 0, 0, topZoneHeight);
      topGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)'); // Green-500
      topGradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, width, topZoneHeight);
      
      // Bottom zone (low volume) - red gradient
      const bottomGradient = ctx.createLinearGradient(0, bottomZoneHeight, 0, height);
      bottomGradient.addColorStop(0, 'rgba(34, 197, 94, 0.05)');
      bottomGradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)'); // Red-500
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, bottomZoneHeight, width, height - bottomZoneHeight);

      // Draw volume level indicator line
      const volumeY = height * handPosition;
      ctx.strokeStyle = volumeLevel > 0.5 ? '#22c55e' : '#ef4444'; // Green for high, red for low
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(0, volumeY);
      ctx.lineTo(width, volumeY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw movement direction arrows
      if (movementDirection !== 'neutral') {
        const wrist = landmarks[0];
        const wristX = wrist.x * width;
        const wristY = wrist.y * height;
        
        ctx.fillStyle = movementDirection === 'up' ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw arrow
        const arrowY = wristY - 60;
        if (movementDirection === 'up') {
          ctx.fillText('↑', wristX, arrowY);
        } else {
          ctx.fillText('↓', wristX, arrowY);
        }
        
        // Draw arrow background circle
        ctx.fillStyle = movementDirection === 'up' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(wristX, arrowY, 30, 0, 2 * Math.PI);
        ctx.fill();
        
        // Redraw arrow on top
        ctx.fillStyle = movementDirection === 'up' ? '#22c55e' : '#ef4444';
        ctx.fillText(movementDirection === 'up' ? '↑' : '↓', wristX, arrowY);
      }

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

      // Highlight fingertips in Cyan
      const fingertipIndices = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
      ctx.fillStyle = '#06b6d4'; // Cyan-500
      fingertipIndices.forEach((index) => {
        const tip = landmarks[index];
        ctx.beginPath();
        ctx.arc(tip.x * width, tip.y * height, 8, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw wrist position indicator (larger circle)
      const wrist = landmarks[0];
      ctx.fillStyle = volumeLevel > 0.5 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.arc(wrist.x * width, wrist.y * height, 15, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw center dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(wrist.x * width, wrist.y * height, 5, 0, 2 * Math.PI);
      ctx.fill();
    };

    const processFrame = () => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const timestamp = performance.now();
        detectHands(video, timestamp);
        drawHand();

        // Update volume based on hand position
        if (handResult) {
          onVolumeChange(handResult.volumeLevel);
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
  }, [enabled, isInitialized, handResult, detectHands, onVolumeChange, isPlaying]);

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
            {handResult.movementDirection === 'up' && <span className="text-green-400">↑</span>}
            {handResult.movementDirection === 'down' && <span className="text-red-400">↓</span>}
            {handResult.movementDirection === 'neutral' && <span>⚪</span>}
            <span>Hand Detected</span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Volume: {(handResult.volumeLevel * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {handResult.movementDirection === 'up' && 'Moving Up → Volume ↑'}
            {handResult.movementDirection === 'down' && 'Moving Down → Volume ↓'}
            {handResult.movementDirection === 'neutral' && 'Hold position'}
          </div>
        </div>
      )}
      
      {/* Volume zone labels */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
        <div className="text-green-400 font-semibold">↑ High Volume</div>
        <div className="text-slate-400 mt-1">Move hand up</div>
      </div>
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
        <div className="text-red-400 font-semibold">↓ Low Volume</div>
        <div className="text-slate-400 mt-1">Move hand down</div>
      </div>
    </div>
  );
}

