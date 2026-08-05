import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Note } from "../../types";
import { NotesGrid } from "../notes-grid";

vi.mock("../note-card", () => ({
	NoteCard: ({ note }: any) => (
		<div data-testid="note-card">
			<span>{note.title}</span>
		</div>
	),
}));

const baseNote: Note = {
	id: 1,
	title: "Note 1",
	content: "Content 1",
	color: null,
	isPinned: false,
	isArchived: false,
	isDeleted: false,
	deletedAt: null,
	labels: [],
	images: [],
	createdAt: "2025-01-01T00:00:00Z",
	updatedAt: "2025-01-01T00:00:00Z",
};

describe("NotesGrid", () => {
	it("renders note cards for each note", () => {
		const notes = [baseNote, { ...baseNote, id: 2, title: "Note 2" }];
		render(<NotesGrid notes={notes} onNoteClick={vi.fn()} />);
		expect(screen.getAllByTestId("note-card")).toHaveLength(2);
		expect(screen.getByText("Note 1")).toBeTruthy();
		expect(screen.getByText("Note 2")).toBeTruthy();
	});

	it("shows empty state for notes view when no notes", () => {
		render(<NotesGrid notes={[]} onNoteClick={vi.fn()} view="notes" />);
		expect(screen.getByText("No notes yet")).toBeTruthy();
		expect(
			screen.getByText("Create your first note to get started"),
		).toBeTruthy();
	});

	it("shows empty state for archived view when no notes", () => {
		render(<NotesGrid notes={[]} onNoteClick={vi.fn()} view="archived" />);
		expect(screen.getByText("No archived notes")).toBeTruthy();
		expect(
			screen.getByText("Archive notes to keep them organized"),
		).toBeTruthy();
	});

	it("shows empty state for trash view when no notes", () => {
		render(<NotesGrid notes={[]} onNoteClick={vi.fn()} view="trash" />);
		expect(screen.getByText("Trash is empty")).toBeTruthy();
		expect(screen.getByText("Deleted notes will appear here")).toBeTruthy();
	});
});
