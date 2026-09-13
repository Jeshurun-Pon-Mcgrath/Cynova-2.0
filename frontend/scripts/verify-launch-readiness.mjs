import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const failures = [];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const legalEmail = process.env.NEXT_PUBLIC_LEGAL_EMAIL;

if (!siteUrl) {
  failures.push("NEXT_PUBLIC_SITE_URL is missing.");
} else {
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== "https:")
      failures.push("NEXT_PUBLIC_SITE_URL must use HTTPS.");
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname))
      failures.push(
        "NEXT_PUBLIC_SITE_URL must use the connected custom domain, not a local address.",
      );
  } catch {
    failures.push("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }
}

if (!legalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalEmail)) {
  failures.push(
    "NEXT_PUBLIC_LEGAL_EMAIL must contain the monitored legal contact address.",
  );
}

for (const file of [
  "public/icon.svg",
  "src/app/privacy/page.tsx",
  "src/app/terms/page.tsx",
]) {
  if (!existsSync(resolve(file))) failures.push(`${file} is required.`);
}

const sourceFiles = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/globals.css",
];
const source = sourceFiles
  .map((file) => readFileSync(resolve(file), "utf8"))
  .join("\n");
if (/made with ai/i.test(source))
  failures.push("Remove the Made with AI attribution before launch.");
if (/purple|violet|#8b5cf6|139\s*,\s*92\s*,\s*246/i.test(source))
  failures.push("Purple styling remains in launch-critical source files.");

if (failures.length) {
  console.error(
    "Launch blocked:\n" + failures.map((failure) => `- ${failure}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  `Launch checks passed for ${siteUrl}. Confirm DNS and TLS are active with the hosting provider before deployment.`,
);
