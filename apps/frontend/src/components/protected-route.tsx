import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "#/lib/auth-client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		authClient.getSession().then(({ data }) => {
			if (!data) {
				navigate({ to: "/" });
			} else {
				setIsAuthenticated(true);
			}
		});
	}, [navigate]);

	if (isAuthenticated === null) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
			</div>
		);
	}

	return <>{children}</>;
}
