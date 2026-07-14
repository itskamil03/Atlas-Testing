export const APP_TIMEZONE = "Asia/Kolkata";

const defaultOptions: Intl.DateTimeFormatOptions = {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

export function formatIST(
  value: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { ...defaultOptions, ...options });
}

export function formatISTDate(value: string | number | Date | null | undefined): string {
  return formatIST(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: undefined,
    minute: undefined,
    second: undefined,
  });
}
