"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { mockAuthService, mockGameService } from "@/services/mock/game-service";
import { gameQueryKey } from "@/lib/query/game-query";

export function DemoRealmButton({ className = "button button-secondary", children = "Enter Demo Realm" }: { className?: string; children?: React.ReactNode }) {
  const router = useRouter(); const client = useQueryClient(); const [busy, setBusy] = useState(false);
  return <button className={className} disabled={busy} onClick={async () => { if (busy) return; setBusy(true); try { await mockAuthService.enterDemo(); client.setQueryData(gameQueryKey, await mockGameService.getSnapshot()); router.push("/dashboard"); } catch { toast.error("The demo realm could not be opened."); setBusy(false); } }}>{busy ? "Opening realm…" : children}</button>;
}
