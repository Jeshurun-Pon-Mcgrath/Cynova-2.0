import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const windowsCandidates = ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"];
const configuredBrowser = process.env.PLAYWRIGHT_CHROME_PATH;
const executablePath = configuredBrowser || (process.platform === "win32" ? windowsCandidates.find(existsSync) : undefined);

export default defineConfig({
  testDir: "./e2e", workers: 1, fullyParallel: false, reporter: "list",
  use: { baseURL: "http://127.0.0.1:3210", launchOptions: executablePath ? { executablePath } : undefined, trace: "retain-on-failure" },
  webServer: { command: process.platform === "win32" ? "npm.cmd start -- -p 3210" : "npm run start -- -p 3210", url: "http://127.0.0.1:3210", reuseExistingServer: true, timeout: 30_000 },
});
