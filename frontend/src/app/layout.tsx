import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import { Providers } from "@/lib/query/provider";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
export const metadata: Metadata = { title: { default: "Cynova — Life RPG", template: "%s | Cynova" }, description: "Turn real-life actions into quests, grow your character, and build a life worth leveling up.", metadataBase: getSiteUrl(), icons: { icon: "/icon.svg" }, openGraph: { title: "Cynova — Life RPG", description: "Turn your real life into your greatest adventure.", type: "website", images: ["/opengraph-image"] }, manifest: "/manifest.webmanifest" };
export const viewport: Viewport = { themeColor: "#070A12", colorScheme: "dark" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${cinzel.variable} ${manrope.variable}`}><body><Providers>{children}</Providers></body></html>; }
