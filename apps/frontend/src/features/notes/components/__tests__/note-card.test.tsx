import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Note } from "../../types";
import { NoteCard } from "../note-card";

vi.mock("#/components/ui/badge", () => ({
	Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock("lucide-react", () => ({
	PinIcon: (props: any) => <svg data-testid="pin-icon" {...props} />,
	ArchiveIcon: (props: any) => <svg data-testid="archive-icon" {...props} />,
	ArchiveRestoreIcon: (props: any) => (
		<svg data-testid="archive-restore-icon" {...props} />
	),
	CheckIcon: (props: any) => <svg data-testid="check-icon" {...props} />,
	ImageIcon: (props: any) => <svg data-testid="image-icon" {...props} />,
	Trash2Icon: (props: any) => <svg data-testid="trash-icon" {...props} />,
	Undo2Icon: (props: any) => <svg data-testid="undo-icon" {...props} />,
}));

const baseNote: Note = {
	id: 1,
	title: "Test Note",
	content: "Test content",
	color: null,
	isPinned: false,
	isArchived: false,
	isDeleted: false,
	deletedAt: null,
	isChecklist: false,
	checklist: [],
	labels: [],
	images: [],
	createdAt: "2025-01-01T00:00:00Z",
	updatedAt: "2025-01-01T00:00:00Z",
};

describe("NoteCard", () => {
	it("renders title and content preview", () => {
		render(<NoteCard note={baseNote} onClick={vi.fn()} />);
		expect(screen.getByText("Test Note")).toBeTruthy();
		expect(screen.getByText("Test content")).toBeTruthy();
	});

	it("renders pin icon when note is pinned", () => {
		render(
			<NoteCard note={{ ...baseNote, isPinned: true }} onClick={vi.fn()} />,
		);
		expect(screen.queryByTestId("pin-icon")).toBeTruthy();
	});

	it("does not render pin icon when note is not pinned", () => {
		render(<NoteCard note={baseNote} onClick={vi.fn()} />);
		expect(screen.queryByTestId("pin-icon")).toBeNull();
	});

	it("truncates content longer than 150 chars", () => {
		const longContent = "a".repeat(200);
		render(
			<NoteCard
				note={{ ...baseNote, content: longContent }}
				onClick={vi.fn()}
			/>,
		);
		expect(screen.getByText(/\.\.\.$/)).toBeTruthy();
	});

	it("renders checklist items with progress for checklist notes", () => {
		const note = {
			...baseNote,
			isChecklist: true,
			checklist: [
				{ id: "1", text: "Buy milk", checked: false },
				{ id: "2", text: "Walk dog", checked: true },
			],
		};
		render(<NoteCard note={note} onClick={vi.fn()} />);
		expect(screen.getByText("Buy milk")).toBeTruthy();
		expect(screen.getByText("Walk dog")).toBeTruthy();
		expect(screen.getByText("1/2")).toBeTruthy();
	});

	it("strikes through checked checklist items", () => {
		const note = {
			...baseNote,
			isChecklist: true,
			checklist: [{ id: "1", text: "Done", checked: true }],
		};
		render(<NoteCard note={note} onClick={vi.fn()} />);
		expect(screen.getByText("Done").className).toContain("line-through");
	});

	it("does not render checklist UI for plain notes", () => {
		render(<NoteCard note={baseNote} onClick={vi.fn()} />);
		expect(screen.queryByText("0/0")).toBeNull();
		expect(screen.queryByTestId("check-icon")).toBeNull();
	});

	it("renders labels as badges when note has labels", () => {
		const noteWithLabels = {
			...baseNote,
			labels: [
				{ id: 1, name: "work", createdAt: "", updatedAt: "" },
				{ id: 2, name: "personal", createdAt: "", updatedAt: "" },
			],
		};
		render(<NoteCard note={noteWithLabels} onClick={vi.fn()} />);
		expect(screen.getByText("work")).toBeTruthy();
		expect(screen.getByText("personal")).toBeTruthy();
	});

	it("applies background color from note color", () => {
		const { container } = render(
			<NoteCard note={{ ...baseNote, color: "#f28b82" }} onClick={vi.fn()} />,
		);
		const card = container.querySelector('[role="button"]') as HTMLElement;
		expect(card.style.backgroundColor).toBe("rgb(242, 139, 130)");
	});

	it("calls onClick when card is clicked", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(<NoteCard note={baseNote} onClick={onClick} />);
		await user.click(screen.getByText("Test Note"));
		expect(onClick).toHaveBeenCalledWith(baseNote);
	});

	it("shows action buttons for notes view", () => {
		render(
			<NoteCard
				note={baseNote}
				onClick={vi.fn()}
				onTogglePin={vi.fn()}
				onArchive={vi.fn()}
				onTrash={vi.fn()}
				view="notes"
			/>,
		);
		expect(screen.queryByTestId("pin-icon")).toBeTruthy();
		expect(screen.queryByTestId("archive-icon")).toBeTruthy();
		expect(screen.queryByTestId("trash-icon")).toBeTruthy();
	});

	it("shows restore button for archived view", () => {
		render(
			<NoteCard
				note={baseNote}
				onClick={vi.fn()}
				onRestore={vi.fn()}
				view="archived"
			/>,
		);
		expect(screen.queryByTestId("archive-restore-icon")).toBeTruthy();
		expect(screen.queryByTestId("pin-icon")).toBeNull();
	});

	it("shows restore and delete buttons for trash view", () => {
		render(
			<NoteCard
				note={baseNote}
				onClick={vi.fn()}
				onRestore={vi.fn()}
				onPermanentDelete={vi.fn()}
				view="trash"
			/>,
		);
		expect(screen.queryByTestId("undo-icon")).toBeTruthy();
		expect(screen.queryByTestId("trash-icon")).toBeTruthy();
	});

	it("calls onTogglePin when pin button is clicked", async () => {
		const user = userEvent.setup();
		const onTogglePin = vi.fn();
		render(
			<NoteCard
				note={baseNote}
				onClick={vi.fn()}
				onTogglePin={onTogglePin}
				view="notes"
			/>,
		);
		await user.click(screen.getByTestId("pin-icon").closest("button")!);
		expect(onTogglePin).toHaveBeenCalledWith(baseNote);
	});
});
