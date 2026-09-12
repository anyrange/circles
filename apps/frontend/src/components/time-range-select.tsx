import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Range } from "@/lib/queries/stats";

interface TimeRangeSelectProps {
  value: Range;
  onChange: (range: Range) => void;
}

const RANGES: Array<{ value: Range; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last 365 days" },
  { value: "all", label: "All time" },
];

function isRange(value: string): value is Range {
  return RANGES.some((range) => range.value === value);
}

export function TimeRangeSelect({ value, onChange }: TimeRangeSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isRange(nextValue)) {
          onChange(nextValue);
        }
      }}
    >
      <SelectTrigger size="sm" aria-label="Date range">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
