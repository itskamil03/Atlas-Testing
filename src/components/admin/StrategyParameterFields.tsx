"use client";

export type StrategyParameterField = {
  key: string;
  label: string;
  type: "number" | "integer" | "text" | "time" | "select";
  default?: string | number;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
};

type Props = {
  fields: StrategyParameterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export function StrategyParameterFields({ fields, values, onChange }: Props) {
  if (fields.length === 0) {
    return <p className="text-xs text-[#8EA9C9]">No configurable parameters for this strategy type.</p>;
  }

  return (
    <>
      {fields.map((field) => (
        <label key={field.key} className="text-sm text-[#A9C3DE]">
          {field.label}
          {field.type === "select" ? (
            <select
              value={values[field.key] ?? String(field.default ?? "")}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2"
            >
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === "time" ? "time" : field.type === "text" ? "text" : "number"}
              min={field.min}
              max={field.max}
              step={field.type === "integer" ? 1 : field.type === "number" ? "any" : undefined}
              value={values[field.key] ?? String(field.default ?? "")}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2"
            />
          )}
        </label>
      ))}
    </>
  );
}

export function parametersFromDefaults(fields: StrategyParameterField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, String(field.default ?? "")]));
}
