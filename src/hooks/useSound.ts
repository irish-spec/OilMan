import { useMemo } from 'react';
import { SOUND_ENABLED } from '../game/constants';

export const useSound = () => {
  return useMemo(() => {
    if (!SOUND_ENABLED || typeof window === 'undefined') {
      return {
        playPayout: () => undefined,
        playUpgrade: () => undefined,
        playPrestige: () => undefined
      };
    }
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return {
        playPayout: () => undefined,
        playUpgrade: () => undefined,
        playPrestige: () => undefined
      };
    }
    const context = new AudioContextClass();
    const playTone = (frequency: number, durationMs: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.1, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + durationMs / 1000);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + durationMs / 1000);
    };
    return {
      playPayout: () => playTone(660, 180),
      playUpgrade: () => playTone(880, 140),
      playPrestige: () => playTone(440, 260)
    };
  }, []);
};
