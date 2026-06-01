import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-react";

import { MainstreamScore } from "@/components/mainstream-score";

describe("MainstreamScore", () => {
  it("renders the score value", async () => {
    const screen = await render(<MainstreamScore score={72} />);

    expect(screen.container).toHaveTextContent("72");
  });

  it("renders the out-of-100 indicator", async () => {
    const screen = await render(<MainstreamScore score={50} />);

    expect(screen.container).toHaveTextContent("/ 100");
  });

  it("renders the label", async () => {
    const screen = await render(<MainstreamScore score={50} />);

    expect(screen.container).toHaveTextContent("Mainstream score");
  });

  it("renders score of 0", async () => {
    const screen = await render(<MainstreamScore score={0} />);

    expect(screen.container).toHaveTextContent("0");
    expect(screen.container).toHaveTextContent("/ 100");
  });

  it("renders score of 100", async () => {
    const screen = await render(<MainstreamScore score={100} />);

    expect(screen.container).toHaveTextContent("100");
    expect(screen.container).toHaveTextContent("/ 100");
  });
});
