"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { authService, gameService } from "@/services";
import { gameQueryKey } from "@/lib/query/game-query";

export function DemoRealmButton({
  className = "button button-secondary",
  children = "Enter Demo Realm",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_API !== "true") return null;
  return (
    <EnabledDemoRealmButton className={className}>
      {children}
    </EnabledDemoRealmButton>
  );
}

function EnabledDemoRealmButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        try {
          await authService.enterDemo();
          client.setQueryData(gameQueryKey, await gameService.getSnapshot());
          router.push("/dashboard");
        } catch {
          toast.error("The demo realm could not be opened.");
          setBusy(false);
        }
      }}
    >
      {busy ? "Opening realm…" : children}
    </button>
  );
}
