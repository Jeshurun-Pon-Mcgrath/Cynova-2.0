"use client";

import { useEffect, useState } from "react";
import { useUiStore } from "@/stores/ui-store";

export function useReducedMotion() {
  const preference = useUiStore((state) => state.reducedMotion);
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const sync = () => setSystemReduced(media.matches); sync(); media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }, []);
  return preference || systemReduced;
}
