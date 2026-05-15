import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FlowRow {
  week: string;
  genre: string;
  count: number;
}

interface Props {
  data: FlowRow[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8b5cf6",
  "#ec4899",
  "#22c55e",
];

export function GenreFlowChart({ data }: Props) {
  const genreSet = new Set<string>();
  const weekMap = new Map<string, Record<string, number>>();

  for (const row of data) {
    genreSet.add(row.genre);
    if (!weekMap.has(row.week)) weekMap.set(row.week, {});
    weekMap.get(row.week)![row.genre] = row.count;
  }

  const genres = [...genreSet].slice(0, 8);
  const chartData = [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, counts]) => ({ week, ...counts }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickFormatter={(v: string) => v.slice(5)}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--card-foreground)",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {genres.map((genre, i) => (
          <Area
            key={genre}
            type="monotone"
            dataKey={genre}
            stackId="1"
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
