## Context

The Google Keep clone currently supports text-only notes (title + content). Users cannot attach images, which limits the app's usefulness for real-world note-taking (receipts, screenshots, sketches, etc.). This change adds full image support: upload, storage, display in cards, and management in the editor.

Current state:
- Notes table: text fields only (`title`, `content`, `color`, `isPinned`, etc.)
- No file upload infrastructure (no multer, no S3 config, no static serving)
- Frontend `NoteForm` handles title, content, color, labels
- `NoteCard` displays text + label badges only
- `EditNoteDialog` wraps `NoteForm` in a modal

## Goals / Non-Goals

**Goals:**
- Allow users to attach one or more images to any note
- Store images in S3-compatible storage (Cloudflare R2, MinIO, AWS S3)
- Display image thumbnails in note cards (grid/list view)
- Show full image gallery in the note editor
- Support adding/removing images from notes
- Clean up S3 objects when notes are permanently deleted
- Abstract storage layer for easy provider swapping

**Non-Goals:**
- Image cropping, editing, or filters
- Video/audio attachments
- Image compression or optimization (client-side only if needed)
- Image reordering within a note
- Batch upload UI
- Camera capture (file picker only)

## Decisions

### 1. Storage: S3-compatible with presigned URLs

**Choice**: Use `@aws-sdk/client-s3` with any S3-compatible provider. Serve images via presigned URLs (short-lived, no public bucket needed).

**Why**: S3-compatible storage is the industry standard for file uploads. Presigned URLs avoid exposing the bucket publicly and work with private buckets. The abstraction allows swapping providers (R2, MinIO, S3) via env vars only.

**Alternatives considered**:
- Local filesystem: Simpler but not production-ready, no CDN support, hard to scale
- Public S3 bucket: Simpler but less secure, no access control
- Base64 in DB: Massive storage overhead, no CDN, slow queries

### 2. Data model: Separate `note_images` table

**Choice**: New `note_images` table with foreign key to `notes.id` (cascade delete).

**Why**: Normalized design allows multiple images per note, independent image metadata, efficient queries (e.g., "notes with images"), and easy cleanup on note deletion. JSON column on notes would be simpler but less flexible and harder to query.

**Schema**:
```
note_images:
  id          SERIAL PRIMARY KEY
  note_id     INTEGER NOT NULL → notes.id ON DELETE CASCADE
  key         VARCHAR(512) NOT NULL  -- S3 object key
  filename    VARCHAR(255) NOT NULL  -- original filename
  mime_type   VARCHAR(100) NOT NULL  -- e.g. image/jpeg
  size        INTEGER NOT NULL       -- bytes
  width       INTEGER                -- nullable, px
  height      INTEGER                -- nullable, px
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
```

### 3. Upload: Multer middleware

**Choice**: Use `multer` for multipart form data parsing on the backend.

**Why**: Multer is the standard Express middleware for file uploads. It handles multipart parsing, file size limits, and type filtering. We'll use memory storage (buffer) to stream directly to S3 without writing to disk.

**Alternatives considered**:
- `busboy`/`formidable`: Lower-level, more control but more boilerplate
- Client-side direct S3 upload (presigned POST): More complex, requires extra endpoint for signed URLs
- `express-fileupload`: Less mature, fewer options

### 4. Image serving: Presigned GET URLs

**Choice**: Backend generates presigned URLs (1-hour expiry) when returning note data. Frontend uses these URLs directly in `<img>` tags.

**Why**: No need for static file serving middleware. Presigned URLs work with private buckets and can be cached by the browser. The backend controls access (user-scoped).

**Trade-off**: URLs expire after 1 hour, so the frontend needs to refetch or the backend needs to regenerate on subsequent requests. For v1, we'll regenerate on each `getNotes`/`getNote` call (simple, always fresh).

### 5. Frontend upload: FormData + progress

**Choice**: Use `FormData` API to upload files. Show upload progress indicator. Support both file picker and drag-and-drop.

**Why**: FormData is the standard browser API for file uploads. Drag-and-drop improves UX for image-heavy workflows. Progress indicator provides feedback for large files.

### 6. Max size and allowed types

**Choice**: 10MB per image. Allowed types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`.

**Why**: 10MB covers most photos and screenshots without excessive storage costs. The four formats cover all common image types. Server-side validation enforced via multer's `fileFilter`.

## Risks / Trade-offs

- **Presigned URL expiry**: URLs expire after 1 hour. If the user keeps the page open for hours, images may break until refetch. → Mitigation: Acceptable for v1; can add client-side URL refresh later.
- **No image optimization**: Large photos (e.g., 20MB from phone) will be rejected. Users may need to resize manually. → Mitigation: Clear error message on rejection. Can add client-side compression in v2.
- **S3 dependency**: Requires S3-compatible storage to be running. → Mitigation: Env var fallback; if S3 not configured, disable image upload UI with a clear message.
- **Storage costs**: Each image stored as-is (no compression). → Mitigation: 10MB limit per image. Can add optimization pipeline later.
- **No image reordering**: Users cannot rearrange image order. → Mitigation: Acceptable for v1; order is by upload time (newest last).

## Migration Plan

1. Deploy backend changes (new table, new endpoints, storage layer) — backward compatible
2. Deploy frontend changes (image upload UI, display) — backward compatible
3. No data migration needed (new table only)

**Rollback**: Drop `note_images` table, remove S3 objects, remove multer/S3 dependencies. No impact on existing notes.

## Open Questions

- Should we generate image dimensions (width/height) on upload or skip for v1?
- Should we support multiple file upload in a single request or one-at-a-time?
- What S3 endpoint to use for local development (MinIO, Tigris, etc.)?
