## Why

Google Keep lets users turn any note into a task list — checkable items with a progress bar for tracking to-dos, shopping lists, and step-by-step plans. Our clone is text-only, so there is no way to track tasks. Adding checklist support brings us closer to feature parity and makes notes actionable.

## What Changes

- Add `is_checklist` flag and `checklist` JSONB column to the `notes` table
- Accept and return checklist data in the existing create/update note endpoints (no new routes)
- Render checklist items as checkboxes with strikethrough + a "X of Y" progress bar in note cards
- Add a "Show checkboxes" toggle to the note editor toolbar; when enabled the text area becomes an editable item list (add, delete, check/uncheck items)
- Add the same toggle to the take-note composer, persisted by the existing debounced autosave
- Keep-style conversion: toggling checkboxes ON splits note content into items (one per line); toggling OFF joins items back into content lines
- Extend note search to match checklist item text

## Capabilities

### New Capabilities

- `note-checklists`: Checklist support for notes — storage, API round-trip, card rendering with progress, editor and composer editing, and content-to-checklist conversion.

### Modified Capabilities

<!-- No existing specs to modify — this is the second spec in the project -->

## Impact

- **Backend**: `notes` table gains `is_checklist` + `checklist` columns (new Drizzle migration); `createNote`/`updateNote` controllers and service accept/return the new fields; `getNotes` search matches checklist text
- **Frontend**: New `NoteChecklistItem` type + `isChecklist`/`checklist` fields on `Note`; updates to `NoteForm` (checklist editor + toggle), `NoteCard` (checkbox list + progress), `TakeNoteInput` (composer toggle + item editing), `EditNoteDialog`/`NotesPage` (field threading)
- **Database**: Additive columns with defaults (`false`, `[]`) on the existing `notes` table — no data migration
