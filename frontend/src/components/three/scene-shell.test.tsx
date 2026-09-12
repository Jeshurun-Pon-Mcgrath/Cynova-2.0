import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { useUiStore } from "@/stores/ui-store";
import { SceneShell } from "./scene-shell";

describe("SceneShell fallbacks", () => {
  beforeEach(() => useUiStore.setState({ graphics: "high", reducedMotion: false }));
  it("exposes a fallback render indicator in low graphics mode", () => { useUiStore.setState({ graphics: "low" }); const { container } = render(<SceneShell/>); expect(container.querySelector('[data-render-mode="fallback"]')).toBeInTheDocument(); });
  it("uses the fallback when reduced motion is requested", () => { useUiStore.setState({ reducedMotion: true }); render(<SceneShell/>); expect(screen.getByRole("img", { name: /CSS Nova Core/i })).toHaveAttribute("data-render-mode", "fallback"); });
});
