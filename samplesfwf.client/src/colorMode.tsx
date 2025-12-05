import React from 'react';

export type Mode = 'light' | 'dark';

export interface ColorModeContextValue {
  mode: Mode;
  toggleColorMode: () => void;
}

/**
 * Key used to persist the user's theme choice.
 */
export const COLOR_MODE_STORAGE_KEY = 'samplesfwf:color-mode';

/**
 * Read stored mode from localStorage. Returns 'light' | 'dark' or null if none found.
 */
export function readStoredMode(): Mode | null {
  try {
    const v = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    // ignore storage errors (e.g. private mode)
  }
  return null;
}

/**
 * Persist mode to localStorage (safe no-op on error).
 */
export function writeStoredMode(mode: Mode): void {
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
}

export const ColorModeContext = React.createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => {}
});