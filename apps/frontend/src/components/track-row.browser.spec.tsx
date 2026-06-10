import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-react";

import { TrackRow } from "@/components/track-row";

describe("TrackRow", () => {
  it("composes title and subtitle children", async () => {
    const screen = await render(
      <TrackRow>
        <TrackRow.Artwork />
        <TrackRow.Content>
          <TrackRow.Title>Bohemian Rhapsody</TrackRow.Title>
          <TrackRow.Subtitle>Queen</TrackRow.Subtitle>
        </TrackRow.Content>
      </TrackRow>,
    );

    expect(screen.container).toHaveTextContent("Bohemian Rhapsody");
    expect(screen.container).toHaveTextContent("Queen");
  });

  it("renders leading and trailing slots", async () => {
    const screen = await render(
      <TrackRow>
        <TrackRow.Leading>1</TrackRow.Leading>
        <TrackRow.Artwork />
        <TrackRow.Content>
          <TrackRow.Title>Money</TrackRow.Title>
        </TrackRow.Content>
        <TrackRow.Trailing>98 plays</TrackRow.Trailing>
      </TrackRow>,
    );

    expect(screen.container).toHaveTextContent("Money");
    expect(screen.container).toHaveTextContent("1");
    expect(screen.container).toHaveTextContent("98 plays");
  });

  it("renders an image when artwork imageUrl is provided", async () => {
    const screen = await render(
      <TrackRow>
        <TrackRow.Artwork>
          <TrackRow.Image src="https://example.com/cover.jpg" alt="" />
        </TrackRow.Artwork>
        <TrackRow.Content>
          <TrackRow.Title>Dream On</TrackRow.Title>
        </TrackRow.Content>
      </TrackRow>,
    );

    const img = screen.container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("https://example.com/cover.jpg");
  });

  it("renders a fallback icon when no artwork imageUrl is provided", async () => {
    const screen = await render(
      <TrackRow>
        <TrackRow.Artwork />
        <TrackRow.Content>
          <TrackRow.Title>No Image Track</TrackRow.Title>
        </TrackRow.Content>
      </TrackRow>,
    );

    const img = screen.container.querySelector("img");
    expect(img).toBeNull();
  });

  it("can pass row behavior to a caller-owned link", async () => {
    const screen = await render(
      <TrackRow asChild>
        <a href="/tracks/1">
          <TrackRow.Artwork />
          <TrackRow.Content>
            <TrackRow.Title>Hotel California</TrackRow.Title>
          </TrackRow.Content>
        </a>
      </TrackRow>,
    );

    const link = screen.container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/tracks/1");
    expect(link).toHaveTextContent("Hotel California");
  });
});
