import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface AudioFeatures {
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  tempo: number;
}

interface Props {
  features: AudioFeatures;
}

export function AudioFeaturesRadar({ features }: Props) {
  const data = [
    { label: "Energy", value: Math.round(features.energy * 100) },
    { label: "Valence", value: Math.round(features.valence * 100) },
    { label: "Dance", value: Math.round(features.danceability * 100) },
    { label: "Acoustic", value: Math.round(features.acousticness * 100) },
    { label: "Instrumental", value: Math.min(100, Math.round(features.instrumentalness * 100)) },
    { label: "Tempo", value: Math.min(100, Math.round((features.tempo / 200) * 100)) },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <Radar
          dataKey="value"
          stroke="var(--chart-2)"
          fill="var(--chart-2)"
          fillOpacity={0.25}
          strokeWidth={2}
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
      </RadarChart>
    </ResponsiveContainer>
  );
}
