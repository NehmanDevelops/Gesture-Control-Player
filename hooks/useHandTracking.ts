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
  indexFingerUp: boolean; // Index finger is raised
  indexFingerDown: boolean; // Index finger is down
  isHandDetected: boolean;
}

// Index finger detection thresholds
const INDEX_FINGER_UP_THRESHOLD = 0.15; // Index tip must be this much above MCP to be considered "up"
const INDEX_FINGER_DOWN_THRESHOLD = 0.05; // Index tip must be this much below MCP to be considered "down"

export function useHandTracking() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handResult, setHandResult] = useState<HandTrackingResult | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const isInitializedRef = useRef(false);

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
        
        // Get index finger landmarks
        const indexTip = landmarks[8]; // Index finger tip
        const indexMCP = landmarks[5]; // Index finger MCP (base)
        
        // Calculate if index finger is up or down
        // In MediaPipe, lower Y values = higher on screen
        // If index tip Y is significantly less than MCP Y, finger is raised
        const yDifference = indexMCP.y - indexTip.y; // Positive = finger is up
        
        const indexFingerUp = yDifference > INDEX_FINGER_UP_THRESHOLD;
        const indexFingerDown = yDifference < -INDEX_FINGER_DOWN_THRESHOLD;

        setHandResult({
          landmarks: landmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          })),
          indexFingerUp,
          indexFingerDown,
          isHandDetected: true,
        });
      } else {
        setHandResult(null);
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

