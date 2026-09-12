export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return new URL("http://localhost:3000");
  try { return new URL(configured); } catch { return new URL("http://localhost:3000"); }
}
