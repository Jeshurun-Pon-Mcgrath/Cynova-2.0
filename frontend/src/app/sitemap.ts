import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
export default function sitemap(): MetadataRoute.Sitemap { const site = getSiteUrl(); return ["", "/login", "/register"].map((path) => ({ url: new URL(path || "/", site).toString(), lastModified: new Date(), changeFrequency: "weekly" as const, priority: path ? .7 : 1 })); }
