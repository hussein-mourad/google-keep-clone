import { expect, test } from "@playwright/test";
import { createNote, noteCard, openView, signUp, uniqueEmail } from "./helpers";

test("creates a note and shows it in the grid", async ({ page }) => {
	await signUp(page, uniqueEmail());

	await createNote(page, "Grocery list", "Milk, eggs, bread");

	await expect(noteCard(page, "Grocery list")).toBeVisible();
});

test("searches notes by title", async ({ page }) => {
	await signUp(page, uniqueEmail());
	await createNote(page, "Meeting notes", "Discuss the roadmap");
	await createNote(page, "Grocery list", "Milk, eggs");

	await page.getByPlaceholder("Search").fill("grocery");

	await expect(noteCard(page, "Grocery list")).toBeVisible();
	await expect(noteCard(page, "Meeting notes")).toBeHidden();
});

test("archives a note and restores it", async ({ page }) => {
	await signUp(page, uniqueEmail());
	await createNote(page, "Ideas", "Some ideas to save");

	await noteCard(page, "Ideas").getByTitle("Archive").click();
	await expect(noteCard(page, "Ideas")).toBeHidden();

	await openView(page, "Archive");
	await expect(noteCard(page, "Ideas")).toBeVisible();

	await noteCard(page, "Ideas").getByTitle("Unarchive").click();
	await openView(page, "Notes");
	await expect(noteCard(page, "Ideas")).toBeVisible();
});

test("trashes a note and restores it", async ({ page }) => {
	await signUp(page, uniqueEmail());
	await createNote(page, "Throwaway", "Do not need this");

	await noteCard(page, "Throwaway").getByTitle("Delete").click();
	await expect(noteCard(page, "Throwaway")).toBeHidden();

	await openView(page, "Trash");
	await expect(noteCard(page, "Throwaway")).toBeVisible();

	await noteCard(page, "Throwaway").getByTitle("Restore").click();
	await openView(page, "Notes");
	await expect(noteCard(page, "Throwaway")).toBeVisible();
});
