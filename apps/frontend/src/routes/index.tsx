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
    if (await getInitialAuthFn()) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    if (isSigningIn) return;
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
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-6 sm:px-10">
      <header className="flex h-24 shrink-0 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="size-8 bg-foreground"
            style={{ mask: "url(/logo-icon.svg) center / contain no-repeat" }}
          />
          <span className="text-lg font-semibold tracking-tight">Circles</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-16 py-12 sm:gap-20 sm:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <section aria-labelledby="landing-title" className="flex flex-col items-start">
            <h1
              id="landing-title"
              className="max-w-2xl text-5xl leading-[0.98] font-medium tracking-tighter text-balance sm:text-7xl xl:text-8xl"
            >
              Good music.
              <br />
              <span className="font-serif text-primary italic">Long memory.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
              Keep the songs, phases, and late-night repeats close. Explore your Spotify history and
              find out what’s playing in your circle.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3">
              <Button size="lg" onClick={signIn} disabled={isSigningIn}>
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

        <section aria-label="Inside Circles" className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
          <Card className="justify-end bg-primary/10 py-8 ring-0 sm:py-10 md:row-span-2">
            <CardHeader className="gap-5 px-8 sm:px-10">
              <CardTitle>
                <h2 className="text-4xl leading-[1.1] font-normal tracking-tight sm:text-5xl">
                  The soundtrack
                  <br />
                  <span className="font-serif text-primary italic">to your days.</span>
                </h2>
              </CardTitle>
              <CardDescription className="max-w-sm leading-6">
                Get to know your listening habits through your top artists, most-played tracks, and
                time spent listening.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-muted/50 py-7 ring-0">
            <CardHeader className="gap-3 px-8">
              <CardTitle>
                <h2 className="text-2xl font-normal tracking-tight">Pick up where you left off.</h2>
              </CardTitle>
              <CardDescription className="max-w-sm leading-6">
                Find what you played on this day. Bring in your Spotify history and revisit a
                different year.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-muted/50 py-7 ring-0">
            <CardHeader className="gap-3 px-8">
              <CardTitle>
                <h2 className="text-2xl font-normal tracking-tight">Good taste travels.</h2>
              </CardTitle>
              <CardDescription className="max-w-sm leading-6">
                Follow your friends. See what’s on repeat in their world, and find your next
                favorite.
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
