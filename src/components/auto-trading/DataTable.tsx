import type { ReactNode } from "react";

type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  getRowKey: (row: T) => string | number;
  getRowClassName?: (row: T) => string;
};

export function DataTable<T>({
  columns,
  rows,
  emptyMessage = "No records found.",
  getRowKey,
  getRowClassName,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-sm text-[#8E9AAA]">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-[#D5DEE8]">
        <thead>
          <tr className="border-b border-[#232B35] text-xs uppercase tracking-[0.12em] text-[#8E9AAA]">
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className={`border-b border-[#1A212A] last:border-b-0 ${getRowClassName?.(row) ?? ""}`}>
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
