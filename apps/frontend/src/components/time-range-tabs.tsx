import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Range } from "@/lib/queries/stats";

interface TimeRangeTabsProps {
  value: Range;
  onChange?: (range: Range) => void;
}

const RANGES: { value: Range; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "3 months" },
  { value: "365d", label: "1 year" },
  { value: "all", label: "All time" },
];

function isRange(value: string): value is Range {
  return RANGES.some((range) => range.value === value);
}

export function TimeRangeTabs({ value, onChange }: TimeRangeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        if (isRange(nextValue)) {
          onChange?.(nextValue);
        }
      }}
    >
      <TabsList>
        {RANGES.map((r) => (
          <TabsTrigger key={r.value} value={r.value}>
            {r.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
