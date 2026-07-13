import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (isSignUp) {
			const { error } = await authClient.signUp.email({
				email,
				password,
				name,
			});
			if (error) {
				setError(error.message || error.code || "Something went wrong");
				return;
			}
			navigate({ to: "/notes" });
		} else {
			const { error } = await authClient.signIn.email({
				email,
				password,
			});
			if (error) {
				setError(error.message || error.code || "Invalid credentials");
				return;
			}
			navigate({ to: "/notes" });
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-bold">Google Keep Clone</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{isSignUp ? "Create an account" : "Sign in to your account"}
					</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					{isSignUp && (
						<Input
							placeholder="Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					)}
					<Input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<Input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<Button type="submit" className="w-full">
						{isSignUp ? "Sign Up" : "Sign In"}
					</Button>
				</form>
				<p className="text-center text-sm text-muted-foreground">
					{isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
					<button
						type="button"
						className="underline hover:text-foreground"
						onClick={() => setIsSignUp(!isSignUp)}
					>
						{isSignUp ? "Sign In" : "Sign Up"}
					</button>
				</p>
			</div>
		</div>
	);
}
