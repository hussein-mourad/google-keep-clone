import { authClient } from "#/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import api from "#/lib/api";
import { Button } from "#/components/ui/button";
import { ModeToggle } from "#/components/theme/toggle";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [output, setOuptut] = useState("");

  const signUp = async () => {
    const { data, error } = await authClient.signUp.email({
      email: "test@example.com",
      password: "password",
      name: "Test User",
    });
    console.log(data, error);
    setOuptut(JSON.stringify(data, null, 2));
  };

  const signIn = async () => {
    const { data, error } = await authClient.signIn.email({
      email: "test@example.com",
      password: "password",
    });
    console.log(data, error);
    setOuptut(JSON.stringify(data, null, 2));
  };

  const signOut = async () => {
    const { data, error } = await authClient.signOut();
    console.log(data, error);
    setOuptut(JSON.stringify(data, null, 2));
  };

  const getSession = async () => {
    const { data, error } = await authClient.getSession();
    console.log(data, error);
    setOuptut(JSON.stringify(data, null, 2));
  };

  const githubSignIn = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: location.origin,
    });
    console.log(data, error);
    setOuptut(JSON.stringify(data, null, 2));
  };

  const googleSignIn = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: location.origin,
    });
    console.log(data, error);
    setOuptut(JSON.stringify(data, null, 2));
  };

  const me = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setOuptut(JSON.stringify(data, null, 2));
    } catch (error) {
      setOuptut(JSON.stringify(error, null, 2));
    }
  };

  const getNotes = async () => {
    try {
      const { data } = await api.get("/api/notes");
      setOuptut(JSON.stringify(data, null, 2));
    } catch (error) {
      setOuptut(JSON.stringify(error, null, 2));
    }
  };

  return (
    <main className="dark min-h-screen">
      <ModeToggle />
      <div className="p-5">
        <div className="flex gap-2">
          <Button type="button" onClick={signIn}>
            Sign In
          </Button>
          <Button type="button" onClick={signUp}>
            Sign Up
          </Button>
          <Button type="button" onClick={signOut}>
            Sign Out
          </Button>
          <Button type="button" onClick={getSession}>
            Get Session
          </Button>
          <Button type="button" onClick={githubSignIn}>
            Github Sign In
          </Button>
          <Button type="button" onClick={googleSignIn}>
            Google Sign In
          </Button>
          <Button type="button" onClick={me}>
            Me
          </Button>
          <Button type="button" onClick={getNotes}>
            Get Notes
          </Button>
        </div>
        <pre className="p-5 bg-slate-100 rounded-lg mt-5 text-gray-800">
          {output}
        </pre>
      </div>
    </main>
  );
}
