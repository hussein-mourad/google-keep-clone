## Context

The Google Keep clone supports text-only notes (title + content) plus images. Notes live in a single `notes` table; related data (images) is stored in child tables. The take-note composer autosaves with a 600ms debounce and auto-deletes notes that are emptied on close. There is currently no way to create task lists or track to-dos inside a note.

Current state:
- `notes` table: `title`, `content`, `user_id`, `is_pinned`, `color`, `is_archived`, `is_deleted`, `deleted_at`, `sort_order`, timestamps
- `createNote`/`updateNote` use an explicit editable-field whitelist (no zod on notes)
- `NoteCard` renders title + content preview + images
- `NoteForm` (used by `EditNoteDialog`) edits title/content/color/labels/images
- `TakeNoteInput` composes new notes with debounced autosave

## Goals / Non-Goals

**Goals:**
- Let users turn any note into a checklist with checkable items
- Store checklist state per note and round-trip it through the existing note endpoints
- Render checklists in note cards with a completion progress bar
- Edit checklists in both the note editor and the take-note composer
- Preserve text when toggling checkboxes on/off (Keep-style conversion)
- Match checklist item text in note search

**Non-Goals:**
- Reordering checklist items (drag & drop) — order is append-only for v1
- Nesting / indenting checklist items
- Sub-tasks, due dates, reminders, or assignees
- Auto-converting typed text while the composer is open (conversion happens on toggle only)
- Dedicated per-item endpoints — the whole checklist is saved with the note

## Decisions

### 1. Data model: JSONB column on `notes`

**Choice**: Add two columns to the existing `notes` table:
- `is_checklist boolean NOT NULL DEFAULT false`
- `checklist jsonb NOT NULL DEFAULT '[]'` storing `[{ id, text, checked }]`

Item shape: `{ id: string; text: string; checked: boolean }`. `id` is generated client-side (`crypto.randomUUID()`); array order is the display order.

**Why**: A checklist is intrinsic to a single note — it has no cross-note query surface, and toggling/updating is naturally a whole-array replace. JSONB keeps the change minimal (additive columns + one whitelist entry each for create/update), matches the explicit-column style of the table, and makes the Keep-style conversion (split content ↔ join items) trivial.

**Alternatives considered**:
- Separate `note_tasks` table: Matches the `note_images` pattern but needs per-item CRUD, ordering columns, and transactional updates for no query benefit — a checklist is never queried without its note.
- Storing items inside `content` with a marker: Fragile, mixes display state into plain text, harder to search/round-trip.

### 2. API: extend existing note endpoints

**Choice**: Accept `isChecklist` (boolean) and `checklist` (array) in `POST /api/notes` and `PUT /api/notes/:id`; include both in all note responses. No new routes.

**Why**: The checklist is part of the note body, not a separate resource. Reusing the note update path means the composer's debounced autosave and the editor's save both work without new plumbing.

**Validation**: Normalize on the backend — coerce missing `checklist` to `[]` and missing `isChecklist` to `false`; drop items without a `text` string. No strict schema validation for v1 (consistent with existing note fields).

### 3. Keep-style conversion between content and items

**Choice**: Toggling "Show checkboxes" ON splits the note's `content` into items (one per line, blank lines dropped); toggling OFF joins items back into `content` (one per line). When checkboxes are ON, the body is the checklist; the content field is only repopulated when converting back.

**Why**: This mirrors Google Keep: the checklist *is* the note body, not an add-on section. It keeps `content` meaningful for notes that never used checklists and gives a clean escape hatch (toggle off restores your text).

### 4. Rendering: checklist cards with progress

**Choice**: When `is_checklist` is true, `NoteCard` renders the item list (checkbox + text, strikethrough when checked) with an "X of Y" progress bar at the bottom, replacing the content preview.

**Why**: Matches Keep's card behavior and gives at-a-glance task status.

### 5. Editing: shared checklist row editor

**Choice**: A small reusable checklist editor is used in both `NoteForm` and `TakeNoteInput`: one row per item (checkbox toggle, text input, delete button), Enter on the last row adds a new item, checked rows show strikethrough, and a progress bar reflects completion. The editor emits `{ isChecklist, checklist }` via the existing submit/autosave paths.

**Why**: One implementation, two surfaces — avoids drift between editor and composer. The composer already autosaves `watch`ed state, so checklist edits persist with the same debounce.

### 6. Search includes checklist text

**Choice**: Extend `getNotes` to match items' `text` in addition to `title`/`content`, using `checklist::text ilike '%term%'`.

**Why**: Users search for the task text ("buy milk"), not the surrounding note. JSONB text cast is simple and indexes are unnecessary at this scale.

## Risks / Trade-offs

- **JSONB is less queryable than a normalized table** → Mitigation: No checklist-only queries exist; acceptable for v1. Revisit if analytics or cross-note task queries appear.
- **Conversion is destructive if not round-trippable** (e.g., items with blank/whitespace text, or toggling repeatedly) → Mitigation: Drop blank lines on split; join with one line per item on merge. Conversion is idempotent across a single toggle pair.
- **Large checklists stored as one JSONB blob** → Mitigation: Whole-array replace on every keystroke. Fine for realistic list sizes (<100 items); the debounced autosave already limits write frequency.
- **Client-generated item ids can collide on concurrent edits** → Mitigation: Acceptable for single-user notes; ids only need uniqueness within a note. Backend treats them as opaque.

## Migration Plan

1. Deploy backend: add columns with defaults (`false`, `[]`) — additive, backward compatible; existing notes render as text as before
2. Deploy frontend: checklist UI — backward compatible (old notes have `isChecklist: false`)
3. No data migration needed

**Rollback**: Drop the two columns; frontend ignores missing fields. No impact on existing notes.

## Open Questions

- Should checked items be preserved across toggle-off/on? (v1: no — toggling off collapses items back to text; re-enabling re-splits from content.)
