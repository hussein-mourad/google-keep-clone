import { expect, test } from "@playwright/test";

test("renders the landing page hero", async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", { name: "Keep Your Thoughts Organized" }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
});

test("redirects unauthenticated users away from /notes", async ({ page }) => {
	await page.goto("/notes");

	await page.waitForURL("/");
	await expect(
		page.getByRole("heading", { name: "Keep Your Thoughts Organized" }),
	).toBeVisible();
});
