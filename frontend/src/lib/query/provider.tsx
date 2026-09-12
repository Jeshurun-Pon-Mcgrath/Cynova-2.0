"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { PreferenceEffects } from "@/components/layout/preference-effects";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 }, mutations: { retry: 0 } } }));
  return <QueryClientProvider client={client}><PreferenceEffects/>{children}<Toaster theme="dark" position="top-right" richColors /></QueryClientProvider>;
}
