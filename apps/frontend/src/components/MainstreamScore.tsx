import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

interface Props {
  score: number;
}

export function MainstreamScore({ score }: Props) {
  const data = [{ value: score, fill: "var(--chart-1)" }];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width={160} height={160}>
        <RadialBarChart
          innerRadius={50}
          outerRadius={70}
          data={data}
          startAngle={225}
          endAngle={-45}
          barSize={12}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "var(--muted)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Mainstream score</p>
    </div>
  );
}
