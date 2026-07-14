"use client";

import { useEffect, useMemo, useState } from "react";

export type DateRangeValue = {
  from: Date | null;
  to: Date | null;
};

type DateRangePickerProps = {
  open: boolean;
  value: DateRangeValue;
  onClose: () => void;
  onApply: (range: DateRangeValue, presetLabel?: string) => void;
};

type PresetId =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "all_time";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week", label: "This week" },
  { id: "last_week", label: "Last week" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "this_year", label: "This year" },
  { id: "last_year", label: "Last year" },
  { id: "all_time", label: "All time" },
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, from: Date, to: Date) {
  const time = date.getTime();
  return time >= from.getTime() && time <= to.getTime();
}

function getPresetRange(id: PresetId): DateRangeValue {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (id) {
    case "today":
      return { from: todayStart, to: todayEnd };
    case "yesterday": {
      const day = new Date(todayStart);
      day.setDate(day.getDate() - 1);
      return { from: startOfDay(day), to: endOfDay(day) };
    }
    case "this_week": {
      const day = new Date(todayStart);
      const weekday = (day.getDay() + 6) % 7;
      day.setDate(day.getDate() - weekday);
      return { from: startOfDay(day), to: todayEnd };
    }
    case "last_week": {
      const day = new Date(todayStart);
      const weekday = (day.getDay() + 6) % 7;
      day.setDate(day.getDate() - weekday - 7);
      const from = startOfDay(day);
      const to = endOfDay(new Date(day.getFullYear(), day.getMonth(), day.getDate() + 6));
      return { from, to };
    }
    case "this_month":
      return { from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to: todayEnd };
    case "last_month": {
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const to = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { from, to };
    }
    case "this_year":
      return { from: startOfDay(new Date(now.getFullYear(), 0, 1)), to: todayEnd };
    case "last_year": {
      const year = now.getFullYear() - 1;
      return {
        from: startOfDay(new Date(year, 0, 1)),
        to: endOfDay(new Date(year, 11, 31)),
      };
    }
    case "all_time":
    default:
      return { from: null, to: null };
  }
}

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
}

function MonthPanel({
  year,
  month,
  draftFrom,
  draftTo,
  onSelectDay,
}: {
  year: number;
  month: number;
  draftFrom: Date | null;
  draftTo: Date | null;
  onSelectDay: (day: Date) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(year, month), [month, year]);
  const label = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-w-[240px] flex-1">
      <p className="mb-3 text-center text-sm font-medium text-[#E7EEF6]">{label}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#6B7785]">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} />;
          }

          const inRange =
            draftFrom && draftTo ? isBetween(startOfDay(day), startOfDay(draftFrom), endOfDay(draftTo)) : false;
          const isStart = draftFrom ? sameDay(day, draftFrom) : false;
          const isEnd = draftTo ? sameDay(day, draftTo) : false;
          const isSelected = isStart || isEnd;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`h-8 rounded-md text-xs transition ${
                isSelected
                  ? "bg-[#9BFF00] font-semibold text-[#11140D]"
                  : inRange
                    ? "bg-[#9BFF00]/15 text-[#D5DEE8]"
                    : "text-[#C9D4E0] hover:bg-[#1A212A]"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({ open, value, onClose, onApply }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<PresetId>("today");
  const [draftFrom, setDraftFrom] = useState<Date | null>(value.from);
  const [draftTo, setDraftTo] = useState<Date | null>(value.to);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value.from ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    if (!value.from && !value.to) {
      const today = getPresetRange("today");
      setDraftFrom(today.from);
      setDraftTo(today.to);
      setActivePreset("today");
      setViewMonth(new Date((today.from ?? new Date()).getFullYear(), (today.from ?? new Date()).getMonth(), 1));
      return;
    }
    setDraftFrom(value.from);
    setDraftTo(value.to);
    const base = value.from ?? new Date();
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
  }, [open, value.from, value.to]);

  const secondMonth = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
    [viewMonth],
  );

  const handlePreset = (id: PresetId) => {
    setActivePreset(id);
    const range = getPresetRange(id);
    setDraftFrom(range.from);
    setDraftTo(range.to);
    if (range.from) {
      setViewMonth(new Date(range.from.getFullYear(), range.from.getMonth(), 1));
    }
  };

  const handleSelectDay = (day: Date) => {
    setActivePreset("all_time");
    const picked = startOfDay(day);

    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(picked);
      setDraftTo(null);
      return;
    }

    if (picked.getTime() < draftFrom.getTime()) {
      setDraftTo(endOfDay(draftFrom));
      setDraftFrom(picked);
      return;
    }

    setDraftTo(endOfDay(picked));
  };

  const handleApply = () => {
    onApply(
      {
        from: draftFrom,
        to: draftTo ?? (draftFrom ? endOfDay(draftFrom) : null),
      },
      activePreset,
    );
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close date picker"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute left-0 top-full z-50 mt-2 w-[min(760px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#26303A] bg-[#0A0A0A] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col md:flex-row">
          <aside className="border-b border-[#1F2833] p-3 md:w-[170px] md:border-b-0 md:border-r">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePreset(preset.id)}
                className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activePreset === preset.id
                    ? "bg-[#1A212A] text-[#F3F7FB]"
                    : "text-[#8E9AAA] hover:bg-[#10151D] hover:text-[#D5DEE8]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </aside>

          <div className="flex-1 p-4">
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
                }
                className="mt-8 rounded-lg border border-[#26303A] px-2 py-1 text-[#A3AFBD] hover:text-[#D5DEE8]"
                aria-label="Previous month"
              >
                ‹
              </button>

              <div className="flex flex-1 flex-col gap-6 lg:flex-row">
                <MonthPanel
                  year={viewMonth.getFullYear()}
                  month={viewMonth.getMonth()}
                  draftFrom={draftFrom}
                  draftTo={draftTo}
                  onSelectDay={handleSelectDay}
                />
                <MonthPanel
                  year={secondMonth.getFullYear()}
                  month={secondMonth.getMonth()}
                  draftFrom={draftFrom}
                  draftTo={draftTo}
                  onSelectDay={handleSelectDay}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
                }
                className="mt-8 rounded-lg border border-[#26303A] px-2 py-1 text-[#A3AFBD] hover:text-[#D5DEE8]"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-[#1F2833] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#26303A] px-5 py-2 text-sm font-medium text-[#D5DEE8] hover:bg-[#10151D]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="rounded-xl bg-[#9BFF00] px-5 py-2 text-sm font-semibold text-[#11140D] hover:bg-[#B7FF45]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function formatDateRangeLabel(range: DateRangeValue) {
  if (!range.from && !range.to) return "Select Dates";
  const fmt = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (range.from && range.to && !sameDay(range.from, range.to)) {
    return `${fmt(range.from)} - ${fmt(range.to)}`;
  }
  if (range.from) return fmt(range.from);
  return "Select Dates";
}
