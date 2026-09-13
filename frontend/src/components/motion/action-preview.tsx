"use client";

import { useGSAP } from "@gsap/react";
import { Check, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { gsap } from "@/lib/gsap/register";

export function ActionPreview() {
  const [complete, setComplete] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const check = useRef<HTMLSpanElement>(null);
  const message = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!complete || reducedMotion) return;
      const timeline = gsap.timeline({ defaults: { overwrite: true } });
      timeline
        .fromTo(
          card.current,
          { scale: 0.985 },
          { scale: 1, duration: 0.42, ease: "back.out(2)" },
        )
        .fromTo(
          check.current,
          { scale: 0, rotate: -18 },
          { scale: 1, rotate: 0, duration: 0.32, ease: "back.out(2.6)" },
          0.04,
        )
        .fromTo(
          message.current,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" },
          0.15,
        );
    },
    { scope: card, dependencies: [complete, reducedMotion] },
  );

  return (
    <div
      ref={card}
      className={`panel action-preview ${complete ? "is-complete" : ""}`}
    >
      <div className="action-preview-copy">
        <span className="eyebrow">Example quest</span>
        <h3>Plan tomorrow&apos;s three priorities</h3>
        <p>
          The completion response confirms the action, then settles. It does not
          interrupt the next task.
        </p>
      </div>
      <div className="action-preview-control">
        <button
          className="quest-check action-demo-check"
          type="button"
          aria-pressed={complete}
          onClick={() => setComplete(true)}
          disabled={complete}
        >
          {complete ? (
            <span ref={check} className="action-check-icon">
              <Check aria-hidden="true" />
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          <span>{complete ? "Completed" : "Mark complete"}</span>
        </button>
        <p
          ref={message}
          className="action-response"
          role="status"
          aria-live="polite"
        >
          {complete
            ? "Recorded. Your next action is ready."
            : "Select the control to try it."}
        </p>
        {complete && (
          <button
            className="button button-ghost button-sm"
            type="button"
            onClick={() => setComplete(false)}
          >
            <RotateCcw aria-hidden="true" /> Reset example
          </button>
        )}
      </div>
    </div>
  );
}
