"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useUiStore } from "@/stores/ui-store";

const RealmCanvas = dynamic(() => import("./hero-realm-canvas"), { ssr: false, loading: () => <CoreFallback/> });
export function CoreFallback() { return <div className="canvas-fallback" data-render-mode="fallback" role="img" aria-label="A glowing CSS Nova Core representing character progress"><span className="orbit"/><span className="fallback-core"/></div>; }

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { if (process.env.NODE_ENV === "development") console.warn("WebGL scene replaced with fallback", error, info.componentStack); }
  render() { return this.state.failed ? <CoreFallback/> : this.props.children; }
}

function supportsWebGL() { try { const canvas = document.createElement("canvas"); return !!(canvas.getContext("webgl2") || canvas.getContext("webgl")); } catch { return false; } }

export function SceneShell() {
  const reduced = useReducedMotion(); const graphics = useUiStore((state) => state.graphics); const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setWebgl(supportsWebGL()), 0); return () => window.clearTimeout(timer); }, []);
  if (reduced || graphics === "low" || webgl === false) return <CoreFallback/>;
  if (webgl === null) return <CoreFallback/>;
  return <WebGLErrorBoundary><RealmCanvas/></WebGLErrorBoundary>;
}
