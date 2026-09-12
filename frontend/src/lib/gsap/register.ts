"use client";

import gsap from "gsap";
import { Flip, MotionPathPlugin, ScrollTrigger } from "gsap/all";

let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, Flip, MotionPathPlugin);
  registered = true;
  document.addEventListener("visibilitychange", () => gsap.globalTimeline.paused(document.hidden));
}

export { gsap, ScrollTrigger, Flip, MotionPathPlugin };
