'use client';

import { useEffect, useRef } from 'react';

export function useSystemVolume(volume: number) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaElementAudioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    // Initialize Web Audio API for system volume control
    const initAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        // Create a silent audio element that we'll use to control system audio
        const audioElement = document.createElement('audio');
        // Use a data URL for a silent audio file
        audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        audioElement.loop = true;
        audioElement.volume = 0.0001; // Very quiet, but not silent
        
        // Create media element source
        const source = audioContext.createMediaElementSource(audioElement);
        mediaElementAudioSourceRef.current = source;
        
        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNodeRef.current = gainNode;
        gainNode.gain.value = volume;
        
        // Connect: source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start playing (this allows us to control the audio context)
        try {
          await audioElement.play();
        } catch (e) {
          console.log('Audio autoplay may be blocked - user interaction required');
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Update volume using gain node
    if (gainNodeRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      const currentTime = audioContextRef.current?.currentTime || 0;
      // Cancel any pending ramps; we update frequently (~30fps) so scheduled ramps can lag behind.
      gainNodeRef.current.gain.cancelScheduledValues(currentTime);
      // Set immediately for responsive gesture control.
      gainNodeRef.current.gain.setValueAtTime(
        Math.max(0.0001, clampedVolume),
        currentTime
      );
    }
  }, [volume]);
}

