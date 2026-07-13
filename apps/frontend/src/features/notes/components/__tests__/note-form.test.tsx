import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteForm } from "../note-form";

vi.mock("react-hook-form", () => {
  const mockRegister = vi.fn().mockReturnValue({});
  const mockHandleSubmit = vi
    .fn()
    .mockImplementation(
      (cb: any) => (e?: any) => {
        e?.preventDefault?.();
        cb({
          title: "My Title",
          content: "My Content",
          labelIds: [],
          color: null,
        });
      },
    );

  return {
    useForm: vi.fn().mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: { errors: {}, isSubmitting: false },
    }),
  };
});

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock("#/features/labels/api", () => ({
  getLabels: vi.fn().mockResolvedValue([]),
  createLabel: vi.fn().mockResolvedValue({ id: 1, name: "new" }),
  deleteLabel: vi.fn().mockResolvedValue({}),
}));

vi.mock("#/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("#/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock("#/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock("#/components/ui/dialog", () => ({
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("#/components/ui/field", () => ({
  Field: ({ children }: any) => <div>{children}</div>,
  FieldContent: ({ children }: any) => <div>{children}</div>,
  FieldError: ({ errors }: any) =>
    errors?.length ? (
      <span data-testid="field-error">{errors[0]?.message}</span>
    ) : null,
}));

vi.mock("../label-picker", () => ({
  LabelPicker: ({ selectedIds, onChange }: any) => (
    <div data-testid="label-picker" />
  ),
}));

describe("NoteForm", () => {
  it("shows New Note title when onDelete is not provided", () => {
    render(<NoteForm onSubmit={vi.fn()} />);
    expect(screen.getByText("New Note")).toBeTruthy();
  });

  it("shows Edit Note title when onDelete is provided", () => {
    render(<NoteForm onSubmit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Edit Note")).toBeTruthy();
  });

  it("renders with initial values", () => {
    render(
      <NoteForm
        initialTitle="Hello"
        initialContent="World"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("shows delete button when onDelete is provided", () => {
    render(<NoteForm onSubmit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<NoteForm onSubmit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders color swatches", () => {
    render(<NoteForm onSubmit={vi.fn()} />);
    expect(screen.getByTitle("Default")).toBeTruthy();
    expect(screen.getByTitle("Red")).toBeTruthy();
    expect(screen.getByTitle("Blue")).toBeTruthy();
    expect(screen.getByTitle("Green")).toBeTruthy();
  });

  it("renders LabelPicker", () => {
    render(<NoteForm onSubmit={vi.fn()} />);
    expect(screen.getByTestId("label-picker")).toBeTruthy();
  });
});
