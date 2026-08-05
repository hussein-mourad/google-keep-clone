# note-images Specification

## Purpose

Support image upload, storage, display, and deletion for notes. Images are stored in S3-compatible storage, displayed as thumbnails in note cards and a gallery in the note editor, and cleaned up when notes are permanently deleted.

## Requirements

### Requirement: Image upload to notes
The system SHALL allow users to upload one or more images to a note via multipart form data.

#### Scenario: Upload single image
- **WHEN** user selects an image file (JPEG, PNG, GIF, or WebP) under 10MB and submits
- **THEN** the system stores the image in S3-compatible storage, creates a `note_images` record, and returns the image metadata (id, url, filename, mimeType, size)

#### Scenario: Reject oversized file
- **WHEN** user attempts to upload a file larger than 10MB
- **THEN** the system rejects the upload and returns an error message indicating the file size limit

#### Scenario: Reject invalid file type
- **WHEN** user attempts to upload a file that is not JPEG, PNG, GIF, or WebP
- **THEN** the system rejects the upload and returns an error message indicating allowed file types

#### Scenario: Upload requires authentication
- **WHEN** an unauthenticated request attempts to upload an image
- **THEN** the system returns 401 Unauthorized

### Requirement: Image storage in S3
The system SHALL store uploaded images in S3-compatible storage using an abstracted storage provider.

#### Scenario: Store image with unique key
- **WHEN** an image is uploaded successfully
- **THEN** the system generates a unique S3 object key (e.g., `{userId}/{noteId}/{uuid}.{ext}`), stores the object, and records the key in the `note_images` table

#### Scenario: Storage provider configuration
- **WHEN** S3 environment variables are configured (`S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`)
- **THEN** the system uses the S3 storage provider for all image operations

#### Scenario: S3 not configured
- **WHEN** S3 environment variables are not configured
- **THEN** the system disables image upload and returns a clear error message when upload is attempted

### Requirement: Image display in note cards
The system SHALL display image thumbnails in note cards in both grid and list views.

#### Scenario: Card with images shows thumbnail
- **WHEN** a note has one or more images and is rendered in a note card
- **THEN** the card displays an image thumbnail strip at the top, above the title

#### Scenario: Card without images
- **WHEN** a note has no images and is rendered in a note card
- **THEN** the card displays normally without any image section

#### Scenario: Multiple images in card
- **WHEN** a note has multiple images
- **THEN** the card displays the first image as a thumbnail (full gallery visible in editor)

### Requirement: Image gallery in note editor
The system SHALL display all images in the note editor dialog with upload and remove capabilities.

#### Scenario: Editor shows all images
- **WHEN** user opens a note with images in the edit dialog
- **THEN** the dialog displays all images in a gallery layout with full-size previews

#### Scenario: Upload image from editor
- **WHEN** user clicks the image upload button in the editor toolbar
- **THEN** the system opens a file picker, accepts the selected image, uploads it, and adds it to the gallery

#### Scenario: Drag-and-drop upload
- **WHEN** user drags an image file onto the editor area
- **THEN** the system uploads the image and adds it to the gallery

#### Scenario: Remove image from note
- **WHEN** user clicks the remove button on an image in the editor
- **THEN** the system deletes the image from S3, removes the `note_images` record, and updates the gallery

### Requirement: Image cleanup on note deletion
The system SHALL delete all associated S3 objects when a note is permanently deleted.

#### Scenario: Permanent delete cleans up images
- **WHEN** a note with images is permanently deleted via `DELETE /api/notes/:id`
- **THEN** the system deletes all associated S3 objects and `note_images` records (via cascade delete)

#### Scenario: Trash does not delete images
- **WHEN** a note with images is moved to trash
- **THEN** the images remain in S3 and the database (soft delete only)

### Requirement: Images included in note responses
The system SHALL include image metadata in note API responses.

#### Scenario: Get single note includes images
- **WHEN** `GET /api/notes/:id` returns a note
- **THEN** the response includes an `images` array with each image's id, presignedUrl, filename, mimeType, and size

#### Scenario: List notes includes images
- **WHEN** `GET /api/notes` returns notes
- **THEN** each note includes an `images` array with image metadata (thumbnail URLs for list view)

#### Scenario: Presigned URL expiry
- **WHEN** image presigned URLs are generated
- **THEN** they expire after 1 hour and are regenerated on subsequent API calls

### Requirement: Image deletion endpoint
The system SHALL provide a dedicated endpoint for deleting individual images.

#### Scenario: Delete image by id
- **WHEN** `DELETE /api/images/:imageId` is called by the image owner
- **THEN** the system deletes the S3 object, removes the `note_images` record, and returns 204 No Content

#### Scenario: Delete image owned by another user
- **WHEN** `DELETE /api/images/:imageId` is called by a user who does not own the image
- **THEN** the system returns 404 Not Found (not 403, to avoid leaking existence)

### Requirement: Image upload UI in note form
The system SHALL provide an image upload button in the note form toolbar.

#### Scenario: Upload button visible
- **WHEN** user is creating or editing a note
- **THEN** the note form toolbar displays an image upload button (icon)

#### Scenario: Upload button triggers file picker
- **WHEN** user clicks the image upload button
- **THEN** the system opens a native file picker filtered to image types (JPEG, PNG, GIF, WebP)

#### Scenario: Upload progress indicator
- **WHEN** an image is being uploaded
- **THEN** the UI displays a progress indicator (spinner or progress bar) on the image thumbnail

#### Scenario: Upload error feedback
- **WHEN** an image upload fails (size, type, network)
- **THEN** the UI displays an error toast message indicating the failure reason
