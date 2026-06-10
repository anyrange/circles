import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRight, Music2, Sparkles } from "lucide-react";

import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const signIn = () =>
    authClient.signIn.social({
      provider: "spotify",
      callbackURL: `${window.location.origin}/dashboard`,
    });

  return (
    <main className="min-h-screen overflow-hidden bg-[#080a0c] text-white">
      <section className="relative flex min-h-screen flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(29,185,84,0.34),transparent_25%),radial-gradient(circle_at_86%_20%,rgba(255,128,74,0.24),transparent_24%),radial-gradient(circle_at_50%_92%,rgba(76,201,240,0.24),transparent_28%),linear-gradient(135deg,#050606_0%,#111319_48%,#050606_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
          <div className="absolute right-[7%] bottom-[12%] hidden w-44 rotate-[9deg] rounded-lg border border-white/10 bg-white/8 p-2 shadow-2xl shadow-black/50 backdrop-blur lg:block xl:w-52">
            <AlbumArt className="from-[#6ee7b7] via-[#60a5fa] to-[#f472b6]" />
            <p className="mt-3 truncate px-1 text-xs font-medium text-white/86">sun room signal</p>
            <p className="px-1 pb-1 text-[11px] text-white/45">taste match 91%</p>
          </div>
          <div className="absolute top-[19%] right-[14%] hidden h-64 w-64 rounded-full border border-white/10 md:block xl:h-72 xl:w-72">
            <div className="absolute inset-6 rounded-full border border-[#1db954]/35" />
            <div className="absolute inset-14 rounded-full border border-[#ffcf5a]/35" />
            <div className="absolute inset-24 rounded-full bg-white/12" />
          </div>
        </div>

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.svg" alt="" className="size-8" />
            <span className="text-sm font-semibold text-white/75 uppercase">Circles</span>
          </div>
          <button
            onClick={signIn}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur transition hover:bg-white/14 focus-visible:ring-3 focus-visible:ring-[#1db954]/45 focus-visible:outline-none"
          >
            <SpotifyIcon />
            Sign in
          </button>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pt-12 pb-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur">
              <Sparkles className="size-3.5 text-[#ffcf5a]" />
              Personal music intelligence from your listening history
            </div>
            <h1 className="max-w-4xl text-6xl leading-[0.9] font-black tracking-normal text-balance sm:text-7xl lg:text-8xl">
              Circles
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/72 sm:text-2xl">
              Your music, visualized.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/56 sm:text-lg">
              Turn Spotify history into artist maps, listening rituals, compatibility scores, and
              weekly playlists that actually sound like you.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={signIn}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#1DB954] px-7 text-base font-bold text-[#041008] shadow-2xl shadow-[#1db954]/25 transition hover:bg-[#28d463] focus-visible:ring-3 focus-visible:ring-[#1db954]/45 focus-visible:outline-none sm:w-auto"
              >
                <SpotifyIcon />
                Continue with Spotify
                <ArrowRight className="size-4" />
              </button>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <div className="flex -space-x-2">
                  <MiniDisc className="bg-[#f97316]" />
                  <MiniDisc className="bg-[#22c55e]" />
                  <MiniDisc className="bg-[#38bdf8]" />
                </div>
                No manual tracking. No empty stats.
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl px-5 pb-8 text-xs text-white/35 sm:px-8 lg:px-10">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
            Artist maps · Listening history · Weekly playlists · Social match
          </span>
        </div>
      </section>
    </main>
  );
}

function AlbumArt({ className }: { className: string }) {
  return (
    <div className={`aspect-square rounded-md bg-linear-to-br ${className}`}>
      <div className="flex h-full items-end gap-1.5 p-3">
        {[42, 72, 54, 88, 64, 76, 48].map((height, index) => (
          <span
            key={index}
            className="w-full rounded-full bg-black/45"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function MiniDisc({ className }: { className: string }) {
  return (
    <span
      className={`flex size-8 items-center justify-center rounded-full border-2 border-[#080a0c] ${className}`}
    >
      <Music2 className="size-3.5 text-white" />
    </span>
  );
}

function SpotifyIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
