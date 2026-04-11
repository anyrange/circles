import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-react";

import { TrackRow } from "@/components/TrackRow";

describe("TrackRow", () => {
  it("renders title and subtitle", async () => {
    const screen = await render(
      <TrackRow title="Bohemian Rhapsody" subtitle="Queen" />,
    );

    expect(screen.container).toHaveTextContent("Bohemian Rhapsody");
    expect(screen.container).toHaveTextContent("Queen");
  });

  it("omits subtitle when not provided", async () => {
    const screen = await render(<TrackRow title="Stairway to Heaven" />);

    expect(screen.container).toHaveTextContent("Stairway to Heaven");
    expect(screen.container).not.toHaveTextContent("Led Zeppelin");
  });

  it("renders leading rank number", async () => {
    const screen = await render(
      <TrackRow title="Hotel California" leading={3} />,
    );

    expect(screen.container).toHaveTextContent("Hotel California");
    expect(screen.container).toHaveTextContent("3");
  });

  it("renders trailing play count", async () => {
    const screen = await render(
      <TrackRow title="Comfortably Numb" trailing="142 plays" />,
    );

    expect(screen.container).toHaveTextContent("Comfortably Numb");
    expect(screen.container).toHaveTextContent("142 plays");
  });

  it("renders all props together", async () => {
    const screen = await render(
      <TrackRow
        title="Money"
        subtitle="Pink Floyd"
        leading={1}
        trailing="98 plays"
      />,
    );

    expect(screen.container).toHaveTextContent("Money");
    expect(screen.container).toHaveTextContent("Pink Floyd");
    expect(screen.container).toHaveTextContent("1");
    expect(screen.container).toHaveTextContent("98 plays");
  });

  it("renders an image when imageUrl is provided", async () => {
    const screen = await render(
      <TrackRow title="Dream On" imageUrl="https://example.com/cover.jpg" />,
    );

    const img = screen.container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("https://example.com/cover.jpg");
  });

  it("renders a fallback icon when no imageUrl is provided", async () => {
    const screen = await render(<TrackRow title="No Image Track" />);

    const img = screen.container.querySelector("img");
    expect(img).toBeNull();
  });
});
