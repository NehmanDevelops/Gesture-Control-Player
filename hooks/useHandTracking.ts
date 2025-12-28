'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingResult {
  landmarks: HandLandmark[];
  handPosition: number; // Y position normalized (0 = top, 1 = bottom)
  volumeLevel: number; // 0 to 1, calculated from hand position
  movementDirection: 'up' | 'down' | 'neutral';
  isHandDetected: boolean;
}

// Volume control zones
const MIN_Y = 0.1; // Top of screen (volume = 1.0)
const MAX_Y = 0.9; // Bottom of screen (volume = 0.0)
const MOVEMENT_THRESHOLD = 0.02; // Minimum movement to register direction change

export function useHandTracking() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handResult, setHandResult] = useState<HandTrackingResult | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const isInitializedRef = useRef(false);
  const previousYRef = useRef<number | null>(null);

  const initializeHandLandmarker = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.11/wasm'
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: 'CPU', // Use CPU for better browser compatibility
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handLandmarkerRef.current = handLandmarker;
      isInitializedRef.current = true;
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MediaPipe';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Error initializing hand landmarker:', err);
    }
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current) {
      initializeHandLandmarker();
    }
  }, [initializeHandLandmarker]);

  const detectHands = useCallback((video: HTMLVideoElement, timestamp: number) => {
    if (!handLandmarkerRef.current || !isInitializedRef.current) {
      return;
    }

    try {
      const results = handLandmarkerRef.current.detectForVideo(video, timestamp);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Use wrist (landmark 0) as the reference point for hand position
        const wrist = landmarks[0];
        const handY = wrist.y; // Normalized Y position (0 = top, 1 = bottom)
        
        // Calculate volume based on hand position
        // Top of screen (low Y) = high volume (1.0)
        // Bottom of screen (high Y) = low volume (0.0)
        const clampedY = Math.max(MIN_Y, Math.min(MAX_Y, handY));
        const volumeLevel = 1 - (clampedY - MIN_Y) / (MAX_Y - MIN_Y);
        
        // Determine movement direction
        let movementDirection: 'up' | 'down' | 'neutral' = 'neutral';
        if (previousYRef.current !== null) {
          const deltaY = previousYRef.current - handY; // Positive = moving up, Negative = moving down
          if (Math.abs(deltaY) > MOVEMENT_THRESHOLD) {
            movementDirection = deltaY > 0 ? 'up' : 'down';
          }
        }
        previousYRef.current = handY;

        setHandResult({
          landmarks: landmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          })),
          handPosition: handY,
          volumeLevel,
          movementDirection,
          isHandDetected: true,
        });
      } else {
        setHandResult(null);
        previousYRef.current = null;
      }
    } catch (err) {
      console.error('Error detecting hands:', err);
    }
  }, []);

  return {
    isLoading,
    error,
    handResult,
    detectHands,
    isInitialized: isInitializedRef.current,
  };
}

