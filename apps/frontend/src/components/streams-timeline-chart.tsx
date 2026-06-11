import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: { date: string; count: number }[];
}

export function StreamsTimelineChart({ data }: Props) {
  const chartConfig = {
    streams: {
      label: "Streams",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  const chartData = data.map((item) => ({ ...item, streams: item.count }));

  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="streamsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-streams)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-streams)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => v.slice(5)}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent labelKey="date" />} />
        <Area
          type="monotone"
          dataKey="streams"
          stroke="var(--color-streams)"
          fill="url(#streamsGradient)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
