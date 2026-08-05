## 1. Backend Schema and Migration

- [x] 1.1 Add `isChecklist` and `checklist` columns to `apps/backend/src/db/schema/notes.ts` with JSONB item type
- [x] 1.2 Generate and apply Drizzle migration (`bun run db:generate` + `bun run db:push`)

## 2. Backend Service and Controller

- [x] 2.1 Add `isChecklist`/`checklist` to `updateNote` data type in `apps/backend/src/features/notes/service.ts`
- [x] 2.2 Extend `getNotes` search to match checklist item text
- [x] 2.3 Accept and normalize `isChecklist`/`checklist` in `createNote` controller
- [x] 2.4 Add `isChecklist`/`checklist` to the `updateNote` controller whitelist

## 3. Backend Tests

- [x] 3.1 Add backend test: create note with checklist round-trips
- [x] 3.2 Add backend test: update note checklist round-trips
- [x] 3.3 Add backend test: search matches checklist item text

## 4. Frontend Types and API

- [x] 4.1 Add `NoteChecklistItem` type and `isChecklist`/`checklist` fields to `apps/frontend/src/features/notes/types.ts`
- [x] 4.2 Extend create/update params in `apps/frontend/src/features/notes/api.ts`

## 5. Frontend NoteCard Checklist Rendering

- [x] 5.1 Render checklist items with checkboxes + strikethrough in `note-card.tsx` when `isChecklist`
- [x] 5.2 Add completion progress bar ("X of Y") to checklist cards

## 6. Frontend NoteForm Checklist Editor

- [x] 6.1 Add "Show checkboxes" toggle to `note-form.tsx` toolbar
- [x] 6.2 Implement checklist item editor (add, delete, check/uncheck, Enter adds new item)
- [x] 6.3 Implement content↔items conversion on toggle on/off
- [x] 6.4 Include `isChecklist`/`checklist` in submit payload and unchanged-detection

## 7. Frontend TakeNoteInput Checklist

- [x] 7.1 Add checklist toggle + item editing to `take-note-input.tsx`
- [x] 7.2 Persist checklist through autosave and handle empty-checklist delete-on-close

## 8. Frontend Field Threading

- [x] 8.1 Thread `isChecklist`/`checklist` through `edit-note-dialog.tsx` and `notes-page.tsx`

## 9. Frontend Tests

- [x] 9.1 Add test: note-card renders checklist items + progress
- [x] 9.2 Add test: note-form toggle converts content↔items

## 10. Verification

- [x] 10.1 Run frontend `bun run check` and both test suites
