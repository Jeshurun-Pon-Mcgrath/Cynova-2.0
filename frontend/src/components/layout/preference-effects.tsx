"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

export function PreferenceEffects() {
  const { reducedMotion, highContrast, graphics } = useUiStore();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", reducedMotion);
    root.classList.toggle("high-contrast", highContrast);
    root.dataset.graphics = graphics;
  }, [reducedMotion, highContrast, graphics]);
  return null;
}
