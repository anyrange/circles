import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  streams: {
    label: "Streams",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ListeningByYearChart({ data }: { data: Array<{ year: number; count: number }> }) {
  const chartData = data.map(({ year, count }) => ({ year: String(year), streams: count }));

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ right: 8 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="year"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
        <Bar dataKey="streams" fill="var(--color-streams)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
