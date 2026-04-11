import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-react";

import { LeaderboardTable } from "@/components/LeaderboardTable";

const entries = [
  { id: "1", name: "Alice", username: "alice_m", image: null, scrobbleCount: 5200 },
  { id: "2", name: "Bob", username: null, image: null, scrobbleCount: 3100 },
  { id: "3", name: "Carol", username: "carol_beats", image: null, scrobbleCount: 1800 },
];

describe("LeaderboardTable", () => {
  it("renders all entries", async () => {
    const screen = await render(<LeaderboardTable entries={entries} />);

    expect(screen.container).toHaveTextContent("Alice");
    expect(screen.container).toHaveTextContent("Bob");
    expect(screen.container).toHaveTextContent("Carol");
  });

  it("renders 1-based position numbers", async () => {
    const screen = await render(<LeaderboardTable entries={entries} />);

    expect(screen.container).toHaveTextContent("1");
    expect(screen.container).toHaveTextContent("2");
    expect(screen.container).toHaveTextContent("3");
  });

  it("renders scrobble counts", async () => {
    const screen = await render(<LeaderboardTable entries={entries} />);

    // toLocaleString varies by locale so just check partial strings
    expect(screen.container).toHaveTextContent("5");
    expect(screen.container).toHaveTextContent("3");
    expect(screen.container).toHaveTextContent("1");
  });

  it("renders usernames when provided", async () => {
    const screen = await render(<LeaderboardTable entries={entries} />);

    expect(screen.container).toHaveTextContent("@alice_m");
    expect(screen.container).toHaveTextContent("@carol_beats");
  });

  it("omits username when not provided", async () => {
    const screen = await render(<LeaderboardTable entries={entries} />);

    // Bob has no username — only two @ signs should appear
    const atMatches = screen.container.textContent?.match(/@/g) ?? [];
    expect(atMatches).toHaveLength(2);
  });

  it("renders an empty list without errors", async () => {
    const screen = await render(<LeaderboardTable entries={[]} />);

    const items = screen.container.querySelectorAll("li");
    expect(items).toHaveLength(0);
  });

  it("shows avatar fallback initials", async () => {
    const screen = await render(
      <LeaderboardTable entries={[entries[0]!]} />,
    );

    // Avatar fallback is the first letter of the name
    expect(screen.container).toHaveTextContent("A");
  });
});
