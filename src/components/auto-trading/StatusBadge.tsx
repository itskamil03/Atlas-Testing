import { formatStatusLabel, statusBadgeClass } from "@/lib/automatedStrategy";

type StatusBadgeProps = {
  status: string;
  pulse?: boolean;
};

export function StatusBadge({ status, pulse = false }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusBadgeClass(status)}`}>
      {pulse ? <span className="h-2 w-2 rounded-full bg-current opacity-80" /> : null}
      {formatStatusLabel(status)}
    </span>
  );
}
