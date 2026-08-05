import { expect, test } from "@playwright/test";
import { signIn, signOut, signUp, uniqueEmail } from "./helpers";

test("signs up a new user and lands on /notes", async ({ page }) => {
	await signUp(page, uniqueEmail());

	await expect(
		page.getByRole("button", { name: "Take a note..." }),
	).toBeVisible();
});

test("signs out back to the landing page", async ({ page }) => {
	await signUp(page, uniqueEmail());
	await signOut(page);

	await expect(
		page.getByRole("heading", { name: "Keep Your Thoughts Organized" }),
	).toBeVisible();
});

test("signs in with an existing account", async ({ page }) => {
	const email = uniqueEmail();
	await signUp(page, email);
	await signOut(page);
	await signIn(page, email);

	await expect(
		page.getByRole("button", { name: "Take a note..." }),
	).toBeVisible();
});
