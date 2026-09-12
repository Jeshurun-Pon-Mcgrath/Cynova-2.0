"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { NovaCore } from "./nova-core";

export default function HeroRealmCanvas() {
  const [visible, setVisible] = useState(true); const [mobile, setMobile] = useState(false);
  useEffect(() => { const visibility = () => setVisible(!document.hidden); const media = window.matchMedia("(max-width: 760px)"); const size = () => setMobile(media.matches); visibility(); size(); document.addEventListener("visibilitychange", visibility); media.addEventListener("change", size); return () => { document.removeEventListener("visibilitychange", visibility); media.removeEventListener("change", size); }; }, []);
  return <div className="canvas-shell" data-render-mode="webgl" aria-hidden="true"><Canvas frameloop={visible ? "always" : "never"} dpr={[1, mobile ? 1.15 : 1.5]} camera={{ position: [0, .2, 6], fov: 42 }} gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}><ambientLight intensity={.7}/><pointLight position={[3, 4, 4]} intensity={28} color="#4DE8E0"/><pointLight position={[-4, -2, 3]} intensity={18} color="#8B5CF6"/><Suspense fallback={null}><NovaCore mobile={mobile}/></Suspense></Canvas></div>;
}
