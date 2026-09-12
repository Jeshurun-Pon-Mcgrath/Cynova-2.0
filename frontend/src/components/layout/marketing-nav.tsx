"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

const links = [["How It Works", "#how"], ["Features", "#features"], ["Attributes", "#attributes"], ["Rewards", "#rewards"]];
export function MarketingNav() { return <header className="marketing-nav"><nav className="nav-inner" aria-label="Primary"><Logo/><div className="desktop-links">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div><div className="nav-actions"><Link className="text-link desktop-only" href="/login">Log in</Link><Link className="button button-primary button-sm desktop-only" href="/register">Start your journey</Link><Dialog.Root><Dialog.Trigger asChild><button className="mobile-menu-trigger" aria-label="Open navigation"><Menu/></button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="mobile-menu"><Dialog.Title>Explore Cynova</Dialog.Title><Dialog.Close className="dialog-close" aria-label="Close navigation"><X/></Dialog.Close>{links.map(([label, href]) => <Dialog.Close key={href} asChild><Link href={href}>{label}</Link></Dialog.Close>)}<Dialog.Close asChild><Link href="/login">Log in</Link></Dialog.Close><Dialog.Close asChild><Link className="button button-primary" href="/register">Start your journey</Link></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root></div></nav></header>; }
