import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { StatCard } from "@/components/StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Scrobbles" value={1234} />);
    expect(screen.getByText("Scrobbles")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("renders sub text when provided", () => {
    render(<StatCard label="Hours" value="42h" sub="this month" />);
    expect(screen.getByText("this month")).toBeInTheDocument();
  });

  it("omits sub text when not provided", () => {
    render(<StatCard label="Hours" value="42h" />);
    expect(screen.queryByText("this month")).not.toBeInTheDocument();
  });
});
