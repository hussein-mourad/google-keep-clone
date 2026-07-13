import assert from "assert";
import request from "supertest";
import { afterAll, beforeAll, describe, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { labels, noteLabels } from "../db/schema/labels";
import { notesTable } from "../db/schema/notes";
import { createTestApp, TEST_USER_ID } from "./helpers";

let app: ReturnType<typeof createTestApp>;

// Shared cleanup helper
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

beforeAll(() => {
  app = createTestApp();
});

describe("health check", () => {
  it("GET /api/health returns 200", async () => {
    const res = await request(app)
      .get("/api/health")
      .expect("Content-Type", /json/);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, "ok");
  });
});

describe("notes API", () => {
  let noteId: number;

  afterAll(async () => {
    await cleanTestUserData();
  });

  it("GET /api/notes returns empty array", async () => {
    const res = await request(app).get("/api/notes").expect(200);
    assert.deepEqual(res.body, []);
  });

  it("POST /api/notes creates a note", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Test Note", content: "Test Content" });

    assert.equal(res.statusCode, 200, `Expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.title, "Test Note");
    assert.equal(res.body.content, "Test Content");
    assert.equal(res.body.isPinned, false);
    assert.equal(res.body.color, null);
    assert.equal(res.body.isArchived, false);
    assert.equal(res.body.isDeleted, false);
    assert.ok(res.body.id);
    noteId = res.body.id;
  });

  it("POST /api/notes with color", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Colored Note", content: "Content", color: "#f28b82" })
      .expect(200);

    assert.equal(res.body.color, "#f28b82");
  });

  it("POST /api/notes rejects missing title", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ content: "Content" })
      .expect(400);

    assert.equal(res.body.message, "Title is required");
  });

  it("POST /api/notes rejects missing content", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Title" })
      .expect(400);

    assert.equal(res.body.message, "Content is required");
  });

  it("GET /api/notes/:id returns a note", async () => {
    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .expect(200);

    assert.equal(res.body.id, noteId);
    assert.equal(res.body.title, "Test Note");
  });

  it("GET /api/notes/:id returns 404 for non-existent note", async () => {
    await request(app).get("/api/notes/999999").expect(404);
  });

  it("PUT /api/notes/:id updates a note", async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ title: "Updated", content: "Updated Content" })
      .expect(200);

    assert.equal(res.body.title, "Updated");
    assert.equal(res.body.content, "Updated Content");
  });

  it("PUT /api/notes/:id toggles pin", async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ isPinned: true })
      .expect(200);

    assert.equal(res.body.isPinned, true);
  });

  it("PUT /api/notes/:id toggles archive", async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ isArchived: true })
      .expect(200);

    assert.equal(res.body.isArchived, true);
  });

  it("PATCH /api/notes/:id/trash soft-deletes a note", async () => {
    const res = await request(app)
      .patch(`/api/notes/${noteId}/trash`)
      .expect(200);

    assert.equal(res.body.isDeleted, true);
    assert.ok(res.body.deletedAt);
  });

  it("GET /api/notes excludes trashed notes by default", async () => {
    const res = await request(app).get("/api/notes").expect(200);
    const ids = res.body.map((n: any) => n.id);
    assert.equal(ids.includes(noteId), false);
  });

  it("PATCH /api/notes/:id/restore restores a trashed note", async () => {
    const res = await request(app)
      .patch(`/api/notes/${noteId}/restore`)
      .expect(200);

    assert.equal(res.body.isDeleted, false);
    assert.equal(res.body.deletedAt, null);
  });

  it("DELETE /api/notes/:id permanently deletes a note", async () => {
    const res = await request(app).delete(`/api/notes/${noteId}`).expect(200);
    assert.equal(res.body.id, noteId);

    await request(app).get(`/api/notes/${noteId}`).expect(404);
  });

  it("GET /api/notes?search= filters notes", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "Alpha Note", content: "First" });

    await request(app)
      .post("/api/notes")
      .send({ title: "Beta Note", content: "Second" });

    const res = await request(app)
      .get("/api/notes?search=Alpha")
      .expect(200);

    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].title, "Alpha Note");
  });

  it("GET /api/notes?archived=true returns archived notes", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "Archive Me", content: "Content" });

    await request(app)
      .put(`/api/notes/${createRes.body.id}`)
      .send({ isArchived: true });

    const res = await request(app)
      .get("/api/notes?archived=true")
      .expect(200);

    const ids = res.body.map((n: any) => n.id);
    assert.ok(ids.includes(createRes.body.id), `Archived note ${createRes.body.id} not in ${JSON.stringify(ids)}`);
  });

  it("GET /api/notes?trash=true returns trashed notes", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "Trash Me", content: "Content" });

    await request(app)
      .patch(`/api/notes/${createRes.body.id}/trash`);

    const res = await request(app)
      .get("/api/notes?trash=true")
      .expect(200);

    const ids = res.body.map((n: any) => n.id);
    assert.ok(ids.includes(createRes.body.id), `Trashed note ${createRes.body.id} not in ${JSON.stringify(ids)}`);
  });

  it("PUT /api/notes/:id rejects updating trashed notes", async () => {
    const createRes = await request(app)
      .post("/api/notes")
      .send({ title: "Trash Update", content: "Content" });

    await request(app)
      .patch(`/api/notes/${createRes.body.id}/trash`);

    const res = await request(app)
      .put(`/api/notes/${createRes.body.id}`)
      .send({ title: "Should Fail" })
      .expect(400);

    assert.equal(res.body.error, "Cannot update a trashed note");
  });
});

describe("labels API", () => {
  let labelId: number;

  afterAll(async () => {
    await cleanTestUserData();
  });

  it("GET /api/labels returns empty array", async () => {
    const res = await request(app).get("/api/labels").expect(200);
    assert.deepEqual(res.body, []);
  });

  it("POST /api/labels creates a label", async () => {
    const res = await request(app)
      .post("/api/labels")
      .send({ name: "Test Label" })
      .expect(200);

    assert.equal(res.body.name, "Test Label");
    assert.ok(res.body.id);
    labelId = res.body.id;
  });

  it("GET /api/labels/:id returns a label", async () => {
    const res = await request(app)
      .get(`/api/labels/${labelId}`)
      .expect(200);

    assert.equal(res.body.id, labelId);
    assert.equal(res.body.name, "Test Label");
  });

  it("PUT /api/labels/:id updates a label", async () => {
    const res = await request(app)
      .put(`/api/labels/${labelId}`)
      .send({ name: "Updated Label" })
      .expect(200);

    assert.equal(res.body.name, "Updated Label");
  });

  it("DELETE /api/labels/:id deletes a label", async () => {
    await request(app).delete(`/api/labels/${labelId}`).expect(200);

    await request(app).get(`/api/labels/${labelId}`).expect(404);
  });
});

describe("note-label associations", () => {
  let noteId: number;
  let labelId: number;

  afterAll(async () => {
    await cleanTestUserData();
  });

  it("POST /api/notes with labelIds attaches labels", async () => {
    const labelRes = await request(app)
      .post("/api/labels")
      .send({ name: "Tag" });

    labelId = labelRes.body.id;

    const noteRes = await request(app)
      .post("/api/notes")
      .send({ title: "Labeled Note", content: "Content", labelIds: [labelId] })
      .expect(200);

    noteId = noteRes.body.id;
    assert.equal(noteRes.body.labels.length, 1);
    assert.equal(noteRes.body.labels[0].name, "Tag");
  });

  it("GET /api/notes?labelId= filters by label", async () => {
    const res = await request(app)
      .get(`/api/notes?labelId=${labelId}`)
      .expect(200);

    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].id, noteId);
  });
});
