## Why

Google Keep supports image notes — users can attach photos to notes for visual context, receipts, sketches, etc. Our clone is currently text-only, which limits its usefulness for real-world note-taking scenarios. Adding image support brings us closer to feature parity and makes the app significantly more practical.

## What Changes

- Add image upload capability to notes (drag-and-drop + file picker)
- Store images in S3-compatible storage (Cloudflare R2, MinIO, AWS S3)
- Display image thumbnails in note cards (grid/list view)
- Show full image gallery in note editor dialog
- Support image removal from notes
- Clean up S3 objects when notes are permanently deleted

## Capabilities

### New Capabilities

- `note-images`: Image attachment management for notes — upload, store, display, and delete images associated with notes. Covers the storage abstraction layer, database schema, API endpoints, and frontend components.

### Modified Capabilities

<!-- No existing specs to modify — this is the first spec in the project -->

## Impact

- **Backend**: New `note_images` table, new multer middleware, new storage abstraction layer (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`), new API endpoints (`POST /api/notes/:id/images`, `DELETE /api/images/:imageId`), updates to existing note endpoints to include images
- **Frontend**: New `NoteImage` type, new API functions (`uploadNoteImage`, `deleteNoteImage`), updates to `NoteForm` (upload UI), `NoteCard` (thumbnail strip), `EditNoteDialog` (image gallery)
- **Database**: New `note_images` table with foreign key to `notes`
- **Dependencies**: `multer`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` (backend)
- **Environment**: New S3 env vars (`S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`)
