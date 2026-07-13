import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthForm } from "#/components/auth-form";
import { ModeToggle } from "#/components/theme/toggle";
import { authClient } from "#/lib/auth-client";
import { HeroSection } from "../components/hero-section";

export function LandingPage() {
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
				<HeroSection
					onSignIn={() => {
						setAuthMode("signin");
						setShowAuth(true);
					}}
					onGetStarted={() => {
						setAuthMode("signup");
						setShowAuth(true);
					}}
				/>
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
