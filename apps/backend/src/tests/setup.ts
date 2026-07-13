import { afterAll, beforeAll } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema/auth";
import { labels, noteLabels } from "../db/schema/labels";
import { notesTable } from "../db/schema/notes";

const TEST_USER_ID = "test-user-id-00000000-0000-0000-0000-000000000000";

async function ensureTestUser() {
  // Check if test user exists, create if not
  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.id, TEST_USER_ID));

  if (!existing) {
    await db.insert(user).values({
      id: TEST_USER_ID,
      email: "test@example.com",
      name: "Test User",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

async function cleanTestUserData() {
  const testNotes = await db
    .select({ id: notesTable.id })
    .from(notesTable)
    .where(eq(notesTable.userId, TEST_USER_ID));
  const noteIds = testNotes.map((n) => n.id);

  if (noteIds.length > 0) {
    await db.delete(noteLabels).where(inArray(noteLabels.noteId, noteIds));
    await db.delete(notesTable).where(eq(notesTable.userId, TEST_USER_ID));
  }
  await db.delete(labels).where(eq(labels.userId, TEST_USER_ID));
}

beforeAll(async () => {
  await ensureTestUser();
  await cleanTestUserData();
});

afterAll(async () => {
  await cleanTestUserData();
});
