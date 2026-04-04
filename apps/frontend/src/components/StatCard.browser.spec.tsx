import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-react";

import { StatCard } from "@/components/StatCard";

describe("StatCard", () => {
  it("renders the label, value, and optional subtext", async () => {
    const screen = await render(
      <StatCard label="Mainstream score" value={78} sub="avg track popularity" />,
    );

    expect(screen.container).toHaveTextContent("Mainstream score");
    expect(screen.container).toHaveTextContent("78");
    expect(screen.container).toHaveTextContent("avg track popularity");
  });

  it("omits the subtext when it is not provided", async () => {
    const screen = await render(<StatCard label="Scrobbles" value="12,345" />);

    expect(screen.container).toHaveTextContent("Scrobbles");
    expect(screen.container).toHaveTextContent("12,345");
    expect(screen.container).not.toHaveTextContent("avg track popularity");
  });
});
