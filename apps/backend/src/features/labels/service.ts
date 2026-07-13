import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { labels } from "../../db/schema/labels";
import { noteLabels } from "../../db/schema/labels";

export async function getLabels(userId: string) {
  return db
    .select()
    .from(labels)
    .where(eq(labels.userId, userId));
}

export async function getLabel(id: number, userId: string) {
  const [label] = await db
    .select()
    .from(labels)
    .where(and(eq(labels.id, id), eq(labels.userId, userId)));
  return label;
}

export async function createLabel(name: string, userId: string) {
  const [result] = await db
    .insert(labels)
    .values({ name, userId })
    .returning();
  if (!result) throw new Error("Failed to create label");
  return result;
}

export async function updateLabel(
  id: number,
  name: string,
  userId: string,
) {
  const [result] = await db
    .update(labels)
    .set({ name })
    .where(and(eq(labels.id, id), eq(labels.userId, userId)))
    .returning();
  if (!result) throw new Error("Failed to update label");
  return result;
}

export async function deleteLabel(id: number, userId: string) {
  const [result] = await db
    .delete(labels)
    .where(and(eq(labels.id, id), eq(labels.userId, userId)))
    .returning();
  if (!result) throw new Error("Failed to delete label");
  return result;
}

export async function setNoteLabels(
  noteId: number,
  labelIds: number[],
  userId: string,
) {
  await db.transaction(async (tx) => {
    await tx
      .delete(noteLabels)
      .where(eq(noteLabels.noteId, noteId));

    if (labelIds.length > 0) {
      const owned = await tx
        .select({ id: labels.id })
        .from(labels)
        .where(
          and(inArray(labels.id, labelIds), eq(labels.userId, userId)),
        );
      const ownedIds = owned.map((l) => l.id);
      if (ownedIds.length > 0) {
        await tx
          .insert(noteLabels)
          .values(ownedIds.map((labelId) => ({ noteId, labelId })));
      }
    }
  });
}

export async function getNoteLabels(noteId: number) {
  return db
    .select({
      id: labels.id,
      name: labels.name,
    })
    .from(noteLabels)
    .innerJoin(labels, eq(noteLabels.labelId, labels.id))
    .where(eq(noteLabels.noteId, noteId));
}
