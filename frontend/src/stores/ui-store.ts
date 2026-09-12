"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  navCollapsed: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  graphics: "low" | "high";
  sound: boolean;
  toggleNav: () => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setGraphics: (value: "low" | "high") => void;
  setSound: (value: boolean) => void;
}

export const useUiStore = create<UiState>()(persist((set) => ({
  navCollapsed: false,
  reducedMotion: false,
  highContrast: false,
  graphics: "high",
  sound: false,
  toggleNav: () => set((state) => ({ navCollapsed: !state.navCollapsed })),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setHighContrast: (highContrast) => set({ highContrast }),
  setGraphics: (graphics) => set({ graphics }),
  setSound: (sound) => set({ sound }),
}), {
  name: "cynova-preferences",
  partialize: ({ reducedMotion, highContrast, graphics, sound }) => ({ reducedMotion, highContrast, graphics, sound }),
}));
