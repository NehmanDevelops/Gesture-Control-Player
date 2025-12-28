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
  isOpenPalm: boolean;
  isHandDetected: boolean;
}

// Index finger detection thresholds - very sensitive for immediate response
const INDEX_FINGER_UP_THRESHOLD = 0.02; // Index tip must be this much above MCP to be considered "up" (very sensitive)
const INDEX_FINGER_DOWN_THRESHOLD = 0.01; // Index tip must be this much below MCP to be considered "down" (very sensitive)

const OPEN_PALM_DISTANCE_THRESHOLD = 0.16;

function dist2D(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function useHandTracking() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handResult, setHandResult] = useState<HandTrackingResult | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const isInitializedRef = useRef(false);
  const previousStateRef = useRef<{ up: boolean; down: boolean } | null>(null);
  const stableCountRef = useRef<{ up: number; down: number }>({ up: 0, down: 0 });

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
        const indexPIP = landmarks[6]; // Index finger PIP (middle joint)

        // Open palm detection (used as the neutral gesture)
        // MediaPipe coords are normalized; use finger extension + distance-from-palm heuristics.
        const wrist = landmarks[0];
        const middleMCP = landmarks[9];
        const palmCenter = {
          x: (wrist.x + middleMCP.x) / 2,
          y: (wrist.y + middleMCP.y) / 2,
        };

        const middleTip = landmarks[12];
        const middlePIP = landmarks[10];
        const ringTip = landmarks[16];
        const ringPIP = landmarks[14];
        const pinkyTip = landmarks[20];
        const pinkyPIP = landmarks[18];
        const thumbTip = landmarks[4];

        const extendedIndex = indexTip.y < indexPIP.y && dist2D(indexTip, palmCenter) > OPEN_PALM_DISTANCE_THRESHOLD;
        const extendedMiddle = middleTip.y < middlePIP.y && dist2D(middleTip, palmCenter) > OPEN_PALM_DISTANCE_THRESHOLD;
        const extendedRing = ringTip.y < ringPIP.y && dist2D(ringTip, palmCenter) > OPEN_PALM_DISTANCE_THRESHOLD;
        const extendedPinky = pinkyTip.y < pinkyPIP.y && dist2D(pinkyTip, palmCenter) > OPEN_PALM_DISTANCE_THRESHOLD;
        const extendedThumb = dist2D(thumbTip, palmCenter) > (OPEN_PALM_DISTANCE_THRESHOLD * 0.9);
        const isOpenPalm = [extendedIndex, extendedMiddle, extendedRing, extendedPinky].filter(Boolean).length >= 3 && extendedThumb;
        
        // Calculate if index finger is up or down
        // In MediaPipe, lower Y values = higher on screen
        // If index tip Y is significantly less than MCP Y, finger is raised
        const yDifference = indexMCP.y - indexTip.y; // Positive = finger is up
        
        // Simple, sensitive detection - no extension check needed for immediate response
        const rawIndexFingerUp = !isOpenPalm && yDifference > INDEX_FINGER_UP_THRESHOLD;
        const rawIndexFingerDown = !isOpenPalm && yDifference < -INDEX_FINGER_DOWN_THRESHOLD;

        stableCountRef.current.up = rawIndexFingerUp ? Math.min(3, stableCountRef.current.up + 1) : 0;
        stableCountRef.current.down = rawIndexFingerDown ? Math.min(3, stableCountRef.current.down + 1) : 0;
        
        // Apply minimal hysteresis to prevent flickering while keeping sensitivity
        let indexFingerUp = rawIndexFingerUp;
        let indexFingerDown = rawIndexFingerDown;
        
        if (previousStateRef.current) {
          // Very light hysteresis - only to prevent rapid flickering
          // Allow immediate activation, but require slightly more movement to deactivate
          if (rawIndexFingerUp) {
            indexFingerUp = true; // Immediate activation
          } else if (previousStateRef.current.up) {
            // Only deactivate if finger moves back significantly
            indexFingerUp = yDifference > (INDEX_FINGER_UP_THRESHOLD * 0.3);
          }
          
          if (rawIndexFingerDown) {
            indexFingerDown = true; // Immediate activation
          } else if (previousStateRef.current.down) {
            // Only deactivate if finger moves back significantly
            indexFingerDown = yDifference < -(INDEX_FINGER_DOWN_THRESHOLD * 0.3);
          }
        }

        if (stableCountRef.current.up < 2 && stableCountRef.current.down < 2) {
          indexFingerUp = false;
          indexFingerDown = false;
        } else if (stableCountRef.current.up >= 2 && stableCountRef.current.down >= 2) {
          if (stableCountRef.current.up > stableCountRef.current.down) {
            indexFingerDown = false;
          } else {
            indexFingerUp = false;
          }
        } else if (stableCountRef.current.up >= 2) {
          indexFingerDown = false;
        } else if (stableCountRef.current.down >= 2) {
          indexFingerUp = false;
        }

        if (isOpenPalm) {
          indexFingerUp = false;
          indexFingerDown = false;
        }
        
        previousStateRef.current = { up: indexFingerUp, down: indexFingerDown };

        setHandResult({
          landmarks: landmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          })),
          indexFingerUp,
          indexFingerDown,
          isOpenPalm,
          isHandDetected: true,
        });
      } else {
        setHandResult(null);
        previousStateRef.current = null;
        stableCountRef.current = { up: 0, down: 0 };
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

