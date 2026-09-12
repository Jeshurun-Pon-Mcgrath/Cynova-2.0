"use client";

import { Award, Backpack, BookOpenCheck, ChevronLeft, CircleUserRound, Coins, Flame, History, LayoutDashboard, Menu, Settings, ShoppingBag, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useGameQuery } from "@/lib/query/game-query";
import { useUiStore } from "@/stores/ui-store";
import { Logo } from "./logo";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard], ["Quests", "/quests", BookOpenCheck], ["Character", "/character", CircleUserRound], ["Skills", "/skills", Sparkles], ["Rewards", "/rewards", ShoppingBag], ["Inventory", "/inventory", Backpack], ["Achievements", "/achievements", Award], ["Chronicle", "/history", History], ["Settings", "/settings", Settings],
] as const;
const subscribeMobile = (listener: () => void) => { const media = window.matchMedia("(max-width: 760px)"); media.addEventListener("change", listener); return () => media.removeEventListener("change", listener); };
const getMobile = () => window.matchMedia("(max-width: 760px)").matches;

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { data: game } = useGameQuery();
  const [open, setOpen] = useState(false);
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, () => false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const { navCollapsed, toggleNav } = useUiStore();

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && sidebarRef.current) { const focusable = [...sidebarRef.current.querySelectorAll<HTMLElement>('a,button:not([disabled])')]; const first = focusable[0]; const last = focusable.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
    };
    document.addEventListener("keydown", close);
    sidebarRef.current?.querySelector<HTMLAnchorElement>("nav a")?.focus();
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", close); trigger?.focus(); };
  }, [open]);

  const closeSidebar = () => setOpen(false);
  return <div className={`app-shell ${navCollapsed ? "rail" : ""}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <aside ref={sidebarRef} id="game-navigation" className={`sidebar ${open ? "open" : ""}`} aria-hidden={mobile && !open} inert={mobile && !open ? true : undefined}>
      <div className="sidebar-head"><Logo/><button className="icon-button desktop-only" onClick={toggleNav} aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}><ChevronLeft/></button><button className="icon-button mobile-only" onClick={closeSidebar} aria-label="Close navigation"><X/></button></div>
      <nav aria-label="Game destinations">{nav.map(([label, href, Icon]) => <Link key={href} href={href} onClick={closeSidebar} className={path.startsWith(href) ? "active" : ""} aria-current={path.startsWith(href) ? "page" : undefined}><Icon/><span>{label}</span></Link>)}</nav>
      <div className="sidebar-quest"><span>Daily challenge</span><strong>{game.progression.completedToday} / {game.player.dailyQuestTarget} quests</strong><div className="mini-bar"><i style={{ width: `${Math.min(100, game.progression.completedToday / game.player.dailyQuestTarget * 100)}%` }}/></div></div>
    </aside>
    <div className="app-stage"><header className="top-hud"><button ref={triggerRef} className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation" aria-controls="game-navigation" aria-expanded={open}><Menu/></button><div className="hud-spacer"/><span className="hud-player desktop-only">{game.player.name}</span><span className="hud-pill"><Flame/>{game.streak.days} <span className="desktop-only">day streak</span></span><span className="hud-pill"><Coins/>{game.progression.gold.toLocaleString()}</span><Link href="/character" className="avatar" aria-label={`Open ${game.player.name}'s character`}>{game.player.name.slice(0, 1).toUpperCase()}</Link></header><main id="main" className="game-main">{children}</main></div>
    {open && <button className="sidebar-backdrop mobile-only" aria-label="Close navigation" onClick={closeSidebar}/>}<nav className="bottom-nav" aria-label="Mobile primary destinations">{nav.slice(0, 5).map(([label, href, Icon]) => <Link key={href} href={href} className={path.startsWith(href) ? "active" : ""}><Icon/><span>{label}</span></Link>)}</nav>
  </div>;
}
