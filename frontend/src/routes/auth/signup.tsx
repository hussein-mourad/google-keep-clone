import { authClient } from "#/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const signUp = async () => {
    const { data, error } = await authClient.signUp.email({
      email: "test@example.com",
      password: "password",
      name: "Test User",
    });
    console.log(data, error);
  };

  const signIn = async () => {
    const { data, error } = await authClient.signIn.email({
      email: "test@example.com",
      password: "password",
    });
    console.log(data, error);
  };

  const getSession = async () => {
    const { data, error } = await authClient.getSession();
    console.log(data, error);
  };

  const githubSignIn = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "github",
    });
    console.log(data, error);
  };

  return (
    <main>
      <div className="p-5">
        <div className="flex gap-2">
          <button
            className="demo-button demo-button-secondary"
            type="button"
            onClick={signIn}
          >
            Sign In
          </button>
          <button
            className="demo-button demo-button-secondary"
            type="button"
            onClick={signUp}
          >
            Sign Up
          </button>
          <button
            className="demo-button demo-button-secondary"
            type="button"
            onClick={getSession}
          >
            Get Session
          </button>
          <button
            className="demo-button demo-button-secondary"
            type="button"
            onClick={githubSignIn}
          >
            Github Sign In
          </button>
        </div>
      </div>
    </main>
  );
}
