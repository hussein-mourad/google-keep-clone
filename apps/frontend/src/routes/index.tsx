import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthForm } from "#/components/auth-form";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		authClient.getSession().then(({ data }) => {
			if (data) {
				navigate({ to: "/notes" });
			} else {
				setLoading(false);
			}
		});
	}, [navigate]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<AuthForm onSuccess={() => navigate({ to: "/notes" })} />
		</div>
	);
}
