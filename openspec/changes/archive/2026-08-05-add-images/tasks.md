## 1. Database Schema

- [x] 1.1 Create `note_images` table schema in `apps/backend/src/db/schema/note-images.ts`
- [x] 1.2 Add `noteImages` relation to `apps/backend/src/db/schema/relations.ts`
- [x] 1.3 Generate and apply Drizzle migration (`bun run db:generate` + `bun run db:push`)

## 2. Storage Abstraction Layer

- [x] 2.1 Install S3 dependencies: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- [x] 2.2 Create `StorageProvider` interface in `apps/backend/src/lib/storage.ts`
- [x] 2.3 Implement `S3StorageProvider` class (upload, delete, getSignedUrl)
- [x] 2.4 Create `getStorage()` factory function with env-based configuration
- [x] 2.5 Add S3 env vars to `apps/backend/src/lib/env.ts` validation schema

## 3. Backend Upload Middleware

- [x] 3.1 Install multer: `bun add multer && bun add -D @types/multer`
- [x] 3.2 Configure multer with memory storage, 10MB limit, image type filter
- [x] 3.3 Create upload middleware in `apps/backend/src/features/notes/middleware.ts`

## 4. Backend API Endpoints

- [x] 4.1 Add `uploadNoteImage` controller in `apps/backend/src/features/notes/controller.ts`
- [x] 4.2 Add `deleteNoteImage` controller in `apps/backend/src/features/notes/controller.ts`
- [x] 4.3 Add `POST /api/notes/:id/images` route in `apps/backend/src/features/notes/router.ts`
- [x] 4.4 Add `DELETE /api/images/:imageId` route in `apps/backend/src/features/notes/router.ts`
- [x] 4.5 Update `getNotes` service to include images with presigned URLs
- [x] 4.6 Update `getNote` service to include images with presigned URLs
- [x] 4.7 Update `permanentDeleteNote` to clean up S3 objects on deletion

## 5. Frontend Types and API

- [x] 5.1 Add `NoteImage` interface to `apps/frontend/src/features/notes/types.ts`
- [x] 5.2 Add `images` field to `Note` interface
- [x] 5.3 Add `uploadNoteImage(noteId, file)` function to `apps/frontend/src/features/notes/api.ts`
- [x] 5.4 Add `deleteNoteImage(imageId)` function to `apps/frontend/src/features/notes/api.ts`

## 6. Frontend NoteForm Image Upload

- [x] 6.1 Add image upload button to NoteForm toolbar
- [x] 6.2 Implement file picker with image type filter
- [x] 6.3 Implement drag-and-drop upload zone in NoteForm
- [x] 6.4 Add image preview grid with remove buttons below content area
- [x] 6.5 Show upload progress indicator during upload
- [x] 6.6 Display error toasts for failed uploads (size, type, network)

## 7. Frontend NoteCard Image Display

- [x] 7.1 Add thumbnail strip to NoteCard when images exist
- [x] 7.2 Style thumbnail to fit card layout (crop/cover)
- [x] 7.3 Handle loading states for thumbnail images

## 8. Frontend EditNoteDialog Image Gallery

- [x] 8.1 Add image gallery section to EditNoteDialog
- [x] 8.2 Show full-size image previews in gallery layout
- [x] 8.3 Add remove button overlay on each image
- [x] 8.4 Confirm before removing images

## 9. Backend Environment and Config

- [x] 9.1 Add S3 env vars to `apps/backend/.env.example`
- [x] 9.2 Update `apps/backend/src/lib/env.ts` with S3 variable validation
- [x] 9.3 Handle missing S3 config gracefully (disable upload with clear message)

## 10. Testing

- [x] 10.1 Write tests for storage provider (mock S3 client)
- [x] 10.2 Write tests for upload endpoint (mock multer + storage)
- [x] 10.3 Write tests for delete endpoint (mock storage)
- [x] 10.4 Write tests for note endpoints with images (mock storage)
- [x] 10.5 Update existing note tests to include images field
