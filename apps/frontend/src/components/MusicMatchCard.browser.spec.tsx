import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-react";

import { MusicMatchCard } from "@/components/MusicMatchCard";

const baseMatch = {
  id: "user-1",
  name: "Alice",
  username: null,
  image: null,
  sharedCount: 12,
};

describe("MusicMatchCard", () => {
  it("renders the user name and shared count", async () => {
    const screen = await render(<MusicMatchCard match={baseMatch} />);

    expect(screen.container).toHaveTextContent("Alice");
    expect(screen.container).toHaveTextContent("12");
    expect(screen.container).toHaveTextContent("shared artists");
  });

  it("renders the username when provided", async () => {
    const screen = await render(
      <MusicMatchCard match={{ ...baseMatch, username: "alice_music" }} />,
    );

    expect(screen.container).toHaveTextContent("@alice_music");
  });

  it("omits the username when not provided", async () => {
    const screen = await render(<MusicMatchCard match={baseMatch} />);

    expect(screen.container).not.toHaveTextContent("@");
  });

  it("shows the avatar fallback initial when no image is provided", async () => {
    const screen = await render(<MusicMatchCard match={baseMatch} />);

    // Avatar fallback shows first letter of name
    expect(screen.container).toHaveTextContent("A");
  });

  it("displays different shared counts correctly", async () => {
    const screen = await render(
      <MusicMatchCard match={{ ...baseMatch, sharedCount: 0 }} />,
    );

    expect(screen.container).toHaveTextContent("0");
    expect(screen.container).toHaveTextContent("shared artists");
  });
});
