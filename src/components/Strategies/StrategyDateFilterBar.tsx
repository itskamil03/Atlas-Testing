"use client";

import {
  DateRangePicker,
  formatDateRangeLabel,
  type DateRangeValue,
} from "@/components/broker/DateRangePicker";
import { dateFilterSubtext, type DatePreset } from "@/lib/dateFilters";

type StrategyDateFilterBarProps = {
  datePreset: DatePreset;
  useCustomDateRange: boolean;
  customDateRange: DateRangeValue;
  dateLabel: string;
  datePickerOpen: boolean;
  onPresetChange: (preset: DatePreset) => void;
  onDateLabelChange: (label: string) => void;
  onCustomRangeChange: (range: DateRangeValue) => void;
  onUseCustomChange: (useCustom: boolean) => void;
  onPickerOpenChange: (open: boolean) => void;
};

export function StrategyDateFilterBar({
  datePreset,
  useCustomDateRange,
  customDateRange,
  dateLabel,
  datePickerOpen,
  onPresetChange,
  onDateLabelChange,
  onCustomRangeChange,
  onUseCustomChange,
  onPickerOpenChange,
}: StrategyDateFilterBarProps) {
  const filter = { preset: datePreset, customRange: customDateRange, useCustom: useCustomDateRange };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => onPickerOpenChange(true)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
            useCustomDateRange
              ? "border-[#9BFF00]/40 bg-[#9BFF00]/10 text-[#D5DEE8]"
              : "border-[#26303A] text-[#A3AFBD] hover:text-[#D5DEE8]"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          {dateLabel}
        </button>
        <DateRangePicker
          open={datePickerOpen}
          value={customDateRange}
          onClose={() => onPickerOpenChange(false)}
          onApply={(range, presetLabel) => {
            onCustomRangeChange(range);
            onUseCustomChange(true);
            onDateLabelChange(
              presetLabel === "all_time" ? "All time" : formatDateRangeLabel(range),
            );
            onPickerOpenChange(false);
          }}
        />
      </div>

      {(["1D", "1W", "1M", "1Y", "All"] as DatePreset[]).map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => {
            onUseCustomChange(false);
            onPresetChange(preset);
            onCustomRangeChange({ from: null, to: null });
            onDateLabelChange("Select Dates");
          }}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
            !useCustomDateRange && datePreset === preset
              ? "bg-[#9BFF00] text-[#11140D]"
              : "border border-[#26303A] text-[#A3AFBD] hover:text-[#D5DEE8]"
          }`}
        >
          {preset}
        </button>
      ))}

      <span className="ml-1 text-[11px] text-[#6B7785]">{dateFilterSubtext(filter)}</span>
    </div>
  );
}
