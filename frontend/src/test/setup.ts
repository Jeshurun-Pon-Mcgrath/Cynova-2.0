import "@testing-library/jest-dom/vitest";
import React from "react";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({ matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined, addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false }),
});
