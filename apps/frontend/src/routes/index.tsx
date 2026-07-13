import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthForm } from "#/components/auth-form";
import { ModeToggle } from "#/components/theme/toggle";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [showAuth, setShowAuth] = useState(false);
	const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

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
		<div className="flex min-h-screen flex-col">
			<header className="flex items-center justify-end gap-2 px-4 py-3">
				<ModeToggle />
			</header>
			<main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
				<div className="mx-auto max-w-lg text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
						Keep Your Thoughts Organized
					</h1>
					<p className="mt-4 text-base text-muted-foreground">
						A simple, fast note-taking app. Capture ideas, organize with labels,
						and access them from anywhere.
					</p>
					<div className="mt-8 flex items-center justify-center gap-3">
						<Button
							size="lg"
							onClick={() => {
								setAuthMode("signin");
								setShowAuth(true);
							}}
						>
							Sign In
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() => {
								setAuthMode("signup");
								setShowAuth(true);
							}}
						>
							Get Started
						</Button>
					</div>
				</div>

				{showAuth && (
					<div className="mt-12 w-full max-w-sm">
						<AuthForm
							key={authMode}
							initialMode={authMode}
							onSuccess={() => navigate({ to: "/notes" })}
						/>
					</div>
				)}
			</main>
		</div>
	);
}
