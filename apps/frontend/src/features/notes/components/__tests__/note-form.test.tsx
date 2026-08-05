import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteForm } from "../note-form";

vi.mock("#/features/labels/api", () => ({
	getLabels: vi.fn().mockResolvedValue([]),
	createLabel: vi.fn().mockResolvedValue({ id: 1, name: "new" }),
	deleteLabel: vi.fn().mockResolvedValue({}),
}));

vi.mock("../label-picker", () => ({
	LabelPicker: ({ selectedIds, onChange }: any) => (
		<div data-testid="label-picker" />
	),
}));

describe("NoteForm", () => {
	it("renders title and content inputs", () => {
		render(<NoteForm onSubmit={vi.fn()} onClose={vi.fn()} />);
		expect(screen.getByPlaceholderText("Title")).toBeTruthy();
		expect(screen.getByPlaceholderText("Take a note...")).toBeTruthy();
	});

	it("renders with initial values", () => {
		render(
			<NoteForm
				initialTitle="Hello"
				initialContent="World"
				onSubmit={vi.fn()}
				onClose={vi.fn()}
			/>,
		);
		const title = screen.getByPlaceholderText("Title") as HTMLInputElement;
		const content = screen.getByPlaceholderText(
			"Take a note...",
		) as HTMLTextAreaElement;
		expect(title.value).toBe("Hello");
		expect(content.value).toBe("World");
	});

	it("shows delete icon button when onDelete is provided", () => {
		render(
			<NoteForm onSubmit={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />,
		);
		expect(screen.getByTitle("Delete")).toBeTruthy();
	});

	it("calls onDelete when delete button is clicked", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn().mockResolvedValue(undefined);
		render(
			<NoteForm onSubmit={vi.fn()} onDelete={onDelete} onClose={vi.fn()} />,
		);

		await user.click(screen.getByTitle("Delete"));
		expect(onDelete).toHaveBeenCalled();
	});

	it("shows color swatches when palette button is clicked", async () => {
		const user = userEvent.setup();
		render(<NoteForm onSubmit={vi.fn()} onClose={vi.fn()} />);

		await user.click(screen.getByTitle("Background color"));
		expect(screen.getByTitle("Red")).toBeTruthy();
		expect(screen.getByTitle("Blue")).toBeTruthy();
	});

	it("shows LabelPicker when tag button is clicked", async () => {
		const user = userEvent.setup();
		render(<NoteForm onSubmit={vi.fn()} onClose={vi.fn()} />);

		await user.click(screen.getByTitle("Add label"));
		expect(screen.getByTestId("label-picker")).toBeTruthy();
	});

	it("calls onClose when X button is clicked", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		render(<NoteForm onSubmit={vi.fn()} onClose={onClose} />);

		await user.click(screen.getByTitle("Back"));
		expect(onClose).toHaveBeenCalled();
	});

	it("converts content to checklist items when toggled on", async () => {
		const user = userEvent.setup();
		render(
			<NoteForm
				initialContent={"Buy milk\nWalk dog"}
				onSubmit={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		await user.click(screen.getByTitle("Show checkboxes"));

		expect(screen.queryByPlaceholderText("Take a note...")).toBeNull();
		const items = screen.getAllByPlaceholderText("List item");
		expect(items).toHaveLength(2);
		expect((items[0] as HTMLInputElement).value).toBe("Buy milk");
		expect((items[1] as HTMLInputElement).value).toBe("Walk dog");
	});

	it("converts checklist items back to content when toggled off", async () => {
		const user = userEvent.setup();
		render(
			<NoteForm
				initialContent={"Buy milk\nWalk dog"}
				onSubmit={vi.fn()}
				onClose={vi.fn()}
			/>,
		);

		await user.click(screen.getByTitle("Show checkboxes"));
		await user.click(screen.getByTitle("Show checkboxes"));

		const content = screen.getByPlaceholderText(
			"Take a note...",
		) as HTMLTextAreaElement;
		expect(content.value).toBe("Buy milk\nWalk dog");
	});

	it("submits checklist data with empty content", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		render(
			<NoteForm
				initialContent={"Buy milk\nWalk dog"}
				onSubmit={onSubmit}
				onClose={vi.fn()}
			/>,
		);

		await user.click(screen.getByTitle("Show checkboxes"));
		await user.click(screen.getByTitle("Back"));

		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				content: "",
				isChecklist: true,
				checklist: [
					expect.objectContaining({ text: "Buy milk", checked: false }),
					expect.objectContaining({ text: "Walk dog", checked: false }),
				],
			}),
		);
	});
});
