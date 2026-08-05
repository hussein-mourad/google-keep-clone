import { expect, type Locator, type Page } from "@playwright/test";

export const TEST_PASSWORD = "password123";

export function uniqueEmail(): string {
	return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function signUp(
	page: Page,
	email: string,
	name = "Test User",
): Promise<void> {
	await page.goto("/");
	await page.getByRole("button", { name: "Get Started" }).click();
	await page.getByPlaceholder("Name").fill(name);
	await page.getByPlaceholder("Email").fill(email);
	await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
	await page.locator("form").getByRole("button", { name: "Sign Up" }).click();
	await page.waitForURL("**/notes");
}

export async function signIn(page: Page, email: string): Promise<void> {
	await page.goto("/");
	await page.getByRole("button", { name: "Sign In" }).click();
	await page.getByPlaceholder("Email").fill(email);
	await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
	await page.locator("form").getByRole("button", { name: "Sign In" }).click();
	await page.waitForURL("**/notes");
}

export async function createNote(
	page: Page,
	title: string,
	content: string,
): Promise<void> {
	await page.getByRole("button", { name: "Take a note..." }).click();
	await page.getByPlaceholder("Title").fill(title);
	await page.getByPlaceholder("Take a note...").fill(content);
	await page.getByRole("button", { name: "Close" }).click();
	await expect(noteCard(page, title)).toBeVisible();
}

/** Locates the note card containing the given title heading. */
export function noteCard(page: Page, title: string): Locator {
	return page
		.getByRole("heading", { name: title })
		.locator("xpath=ancestor::div[@role='button'][1]");
}

/** Clicks a sidebar nav item, scoped to the sidebar to avoid card icon collisions. */
export async function openView(
	page: Page,
	view: "Notes" | "Archive" | "Trash",
): Promise<void> {
	await page
		.locator('[data-slot="sidebar"]')
		.getByRole("button", { name: view })
		.click();
}

export async function signOut(page: Page): Promise<void> {
	await page
		.getByRole("button")
		.filter({ has: page.locator('[data-slot="avatar"]') })
		.click();
	await page.getByRole("menuitem", { name: "Sign out" }).click();
	await page.waitForURL("/");
}
