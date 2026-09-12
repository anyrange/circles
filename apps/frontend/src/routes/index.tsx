import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth";
import { getInitialAuthFn } from "@/lib/auth-session";

import { LandingRecord } from "./-components/landing-record";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (await getInitialAuthFn()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    if (isSigningIn) {
      return;
    }
    setIsSigningIn(true);
    setError(null);
    try {
      const result = await authClient.signIn.social({
        provider: "spotify",
        callbackURL: "/dashboard",
      });
      if (result.error) {
        setError(result.error.message ?? "Unable to sign in. Please try again.");
        setIsSigningIn(false);
      }
    } catch {
      setError("Unable to connect to Spotify. Please try again.");
      setIsSigningIn(false);
    }
  }

  return (
    <div className="landing-page mx-auto flex min-h-svh max-w-5xl flex-col px-6 sm:px-10">
      <header className="flex h-20 shrink-0 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="size-8 bg-foreground"
            style={{ mask: "url(/logo-icon.svg) center / contain no-repeat" }}
          />
          <span className="text-lg font-medium tracking-tight">Circles</span>
        </div>
      </header>

      <main className="flex flex-col gap-8 pt-6 pb-8 sm:pt-8">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <section aria-labelledby="landing-title" className="flex flex-col items-start">
            <h1
              id="landing-title"
              className="max-w-md text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl"
            >
              Your Spotify listening,
              <br />
              all in one place.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              View your listening stats, browse your history, and see what your friends are playing.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3">
              <Button onClick={signIn} disabled={isSigningIn}>
                <SpotifyIcon />
                {isSigningIn ? "Connecting to Spotify…" : "Continue with Spotify"}
                <ArrowRight data-icon="inline-end" />
              </Button>
              {error && (
                <p role="alert" className="max-w-sm text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          </section>

          <LandingRecord />
        </div>

        <section aria-label="Inside Circles" className="grid gap-3 sm:grid-cols-[1.1fr_1fr]">
          <Card size="sm" className="ring-0 sm:row-span-2">
            <CardHeader>
              <CardTitle>
                <h2>Your listening habits</h2>
              </CardTitle>
              <CardDescription>
                <ul className="list-disc pl-4 leading-6">
                  <li>Top artists</li>
                  <li>Most-played tracks</li>
                  <li>Time spent listening</li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
          <Card size="sm" className="ring-0">
            <CardHeader>
              <CardTitle>
                <h2>Listening history</h2>
              </CardTitle>
              <CardDescription>
                <p className="leading-6">
                  Import your Spotify history to browse your past listening.
                </p>
              </CardDescription>
            </CardHeader>
          </Card>
          <Card size="sm" className="ring-0">
            <CardHeader>
              <CardTitle>
                <h2>Friends' listening</h2>
              </CardTitle>
              <CardDescription>
                <p className="leading-6">Follow friends to see their recently played tracks.</p>
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg data-icon="inline-start" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
