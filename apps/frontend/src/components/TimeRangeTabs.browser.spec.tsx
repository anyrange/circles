import { describe, expect, it, vi } from "vite-plus/test";
import { render } from "vitest-browser-react";

import { TimeRangeTabs } from "@/components/TimeRangeTabs";

describe("TimeRangeTabs", () => {
  it("renders all time range options", async () => {
    const screen = await render(
      <TimeRangeTabs value="7d" />,
    );

    expect(screen.container).toHaveTextContent("7 days");
    expect(screen.container).toHaveTextContent("30 days");
    expect(screen.container).toHaveTextContent("3 months");
    expect(screen.container).toHaveTextContent("1 year");
    expect(screen.container).toHaveTextContent("All time");
  });

  it("marks the active tab with aria-selected", async () => {
    const screen = await render(<TimeRangeTabs value="30d" />);

    const tabs = screen.container.querySelectorAll("[role='tab']");
    const active = Array.from(tabs).find(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    expect(active).not.toBeNull();
    expect(active?.textContent).toBe("30 days");
  });

  it("marks only one tab as active at a time", async () => {
    const screen = await render(<TimeRangeTabs value="90d" />);

    const tabs = screen.container.querySelectorAll("[role='tab']");
    const activeTabs = Array.from(tabs).filter(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    expect(activeTabs).toHaveLength(1);
    expect(activeTabs[0]?.textContent).toBe("3 months");
  });

  it("calls onChange with the selected range when a tab is clicked", async () => {
    const onChange = vi.fn();
    const screen = await render(
      <TimeRangeTabs value="7d" onChange={onChange} />,
    );

    // Use the Playwright locator API so click events propagate through React's
    // synthetic event system correctly
    await screen.getByText("1 year").click();

    expect(onChange).toHaveBeenCalledWith("365d");
  });

  it("does not throw when onChange is not provided", async () => {
    const screen = await render(<TimeRangeTabs value="all" />);

    const tabs = screen.container.querySelectorAll("[role='tab']");
    const firstTab = tabs[0] as HTMLElement;

    expect(() => firstTab.click()).not.toThrow();
  });

  it("renders five tab options in total", async () => {
    const screen = await render(<TimeRangeTabs value="7d" />);

    const tabs = screen.container.querySelectorAll("[role='tab']");
    expect(tabs).toHaveLength(5);
  });
});
