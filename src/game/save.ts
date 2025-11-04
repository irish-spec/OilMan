import { SAVE_VERSION } from './constants';
import type { SaveGame } from './types';

const STORAGE_KEY = 'idle-oil-inc-save';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const loadGame = (): SaveGame | null => {
  if (!isBrowser) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SaveGame;
    if (parsed.version !== SAVE_VERSION) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('failed to load save', error);
    return null;
  }
};

export const saveGame = (save: SaveGame): void => {
  if (!isBrowser) {
    return;
  }
  try {
    const payload: SaveGame = {
      ...save,
      version: SAVE_VERSION,
      lastSavedAt: Date.now()
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('failed to save game', error);
  }
};

export const clearSave = (): void => {
  if (!isBrowser) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};
