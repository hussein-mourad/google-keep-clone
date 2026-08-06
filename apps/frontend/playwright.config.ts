import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, "../..");
const baseURL = "http://localhost:3000";
const backendURL = "http://localhost:8000";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	outputDir: "test-results",
	use: {
		baseURL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				// launchOptions: {
				// 	executablePath: "/usr/bin/chromium",
				// },
			},
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		// {
		// 	name: "webkit",
		// 	use: { ...devices["Desktop Safari"] },
		// },
	],
	webServer: [
		{
			command: "bun run dev:backend",
			url: `${backendURL}/api/health`,
			reuseExistingServer: !process.env.CI,
			cwd: repoRoot,
			timeout: 120_000,
		},
		{
			command: "bun run dev:frontend",
			url: baseURL,
			reuseExistingServer: !process.env.CI,
			cwd: repoRoot,
			timeout: 120_000,
		},
	],
});
