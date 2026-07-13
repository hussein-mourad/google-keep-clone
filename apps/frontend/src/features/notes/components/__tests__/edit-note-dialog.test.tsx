import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Note } from "../../types";
import { EditNoteDialog } from "../edit-note-dialog";

vi.mock("../note-form", () => ({
  NoteForm: ({ onSubmit, onDelete }: any) => (
    <div data-testid="note-form">
      <button
        data-testid="form-submit"
        onClick={() =>
          onSubmit({
            title: "Updated",
            content: "Content",
            labelIds: [],
            color: null,
          })
        }
      >
        submit
      </button>
      {onDelete && (
        <button data-testid="form-delete" onClick={onDelete}>
          trigger-delete
        </button>
      )}
    </div>
  ),
}));

vi.mock("#/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("#/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("#/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

const testNote: Note = {
  id: 42,
  title: "Test Note",
  content: "Test Content",
  color: "#f28b82",
  isPinned: false,
  isArchived: false,
  isDeleted: false,
  deletedAt: null,
  labels: [],
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

describe("EditNoteDialog", () => {
  it("renders dialog when note is provided", () => {
    render(
      <EditNoteDialog
        note={testNote}
        onOpenChange={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("dialog")).toBeTruthy();
  });

  it("does not render dialog when note is null", () => {
    render(
      <EditNoteDialog
        note={null}
        onOpenChange={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("dialog")).toBeNull();
  });

  it("calls onUpdate when form submits", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <EditNoteDialog
        note={testNote}
        onOpenChange={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
      />,
    );
    await user.click(screen.getByTestId("form-submit"));
    expect(onUpdate).toHaveBeenCalledWith(42, {
      title: "Updated",
      content: "Content",
      labelIds: [],
      color: null,
    });
  });

  it("shows alert dialog on delete", async () => {
    const user = userEvent.setup();
    render(
      <EditNoteDialog
        note={testNote}
        onOpenChange={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await user.click(screen.getByTestId("form-delete"));
    expect(screen.queryByTestId("alert-dialog")).toBeTruthy();
    expect(screen.getByText("Delete note?")).toBeTruthy();
  });

  it("calls onDelete when confirmed in alert", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <EditNoteDialog
        note={testNote}
        onOpenChange={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={onDelete}
      />,
    );
    await user.click(screen.getByTestId("form-delete"));
    await user.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(42);
  });
});
