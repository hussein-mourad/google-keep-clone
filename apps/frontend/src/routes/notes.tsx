import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "#/components/protected-route";
import { NotesPage } from "#/features/notes/pages/notes-page";

export const Route = createFileRoute("/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<ProtectedRoute>
			<NotesPage />
		</ProtectedRoute>
	);
}
