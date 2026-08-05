## ADDED Requirements

### Requirement: Checklist data model
The system SHALL support an optional checklist on each note, consisting of a boolean `isChecklist` flag and a `checklist` array of items, each with a unique string id, text, and checked state.

#### Scenario: Note defaults to non-checklist
- **WHEN** a note is created without checklist fields
- **THEN** the note has `isChecklist` false and an empty `checklist` array

#### Scenario: Note stores checklist items in order
- **WHEN** a note has a checklist with multiple items
- **THEN** the items are returned in the order they were saved, each with id, text, and checked

### Requirement: Checklist round-trip via note endpoints
The system SHALL accept `isChecklist` and `checklist` in the create and update note endpoints and include them in note responses.

#### Scenario: Create note with checklist
- **WHEN** `POST /api/notes` includes `isChecklist: true` and a `checklist` array
- **THEN** the created note is persisted and returned with the same checklist data

#### Scenario: Update note checklist
- **WHEN** `PUT /api/notes/:id` changes `checklist` items or toggles `isChecklist`
- **THEN** the updated note is persisted and returned with the new checklist data

#### Scenario: Checklist is user-scoped
- **WHEN** a user fetches or updates a note with a checklist
- **THEN** only the owning user can read or modify the checklist (consistent with existing note ownership rules)

### Requirement: Checklist editing in note editor
The system SHALL provide a "Show checkboxes" toggle in the note editor; when enabled, the editor SHALL allow adding, deleting, and checking/unchecking items.

#### Scenario: Toggle checkboxes on
- **WHEN** user enables "Show checkboxes" on a note with text content
- **THEN** the content is split into one checklist item per line and the editor shows the item list

#### Scenario: Toggle checkboxes off
- **WHEN** user disables "Show checkboxes" on a note with checklist items
- **THEN** the items are joined back into content as one line per item and the text area is shown

#### Scenario: Add checklist item
- **WHEN** user presses Enter in the editor while the checklist is active
- **THEN** a new empty item is added and focused for editing

#### Scenario: Delete checklist item
- **WHEN** user removes an item from the checklist
- **THEN** the item is no longer returned or rendered for the note

#### Scenario: Check and uncheck item
- **WHEN** user toggles an item's checkbox
- **THEN** the item's checked state is updated and persisted with the note

### Requirement: Checklist in take-note composer
The system SHALL provide the same checklist toggle and item editing in the take-note composer, persisted through the existing autosave behavior.

#### Scenario: Compose a checklist note
- **WHEN** user enables checkboxes in the composer and types items
- **THEN** the items are saved to the created note via autosave

#### Scenario: Empty checklist note deleted on close
- **WHEN** user closes the composer with an active checklist and no title and all items empty
- **THEN** the note is permanently deleted (consistent with existing empty-note behavior)

### Requirement: Checklist rendering in note cards
The system SHALL render checklist notes in cards with a checkbox per item, strikethrough on checked items, and a completion progress indicator.

#### Scenario: Card shows checklist items
- **WHEN** a note with `isChecklist` true is rendered in a card
- **THEN** the card displays each checklist item with a checkbox in place of the content preview

#### Scenario: Card shows progress
- **WHEN** a checklist note has N items with C checked
- **THEN** the card displays progress indicating C of N items completed

#### Scenario: Card shows checked items struck through
- **WHEN** a checklist item is checked
- **THEN** the card renders its text with strikethrough

#### Scenario: Card without checklist
- **WHEN** a note has `isChecklist` false
- **THEN** the card displays its content preview as before, without any checklist UI

### Requirement: Checklist search
The system SHALL match checklist item text when searching notes.

#### Scenario: Search matches checklist item text
- **WHEN** a search term appears in a checklist item's text but not in the note title or content
- **THEN** the note is included in the search results
