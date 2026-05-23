import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  mobileCardRender?: (row: any, index: number) => ReactNode;
  stickyHeader?: boolean;
}

export function ResponsiveTable({ columns, data, onRowClick, mobileCardRender, stickyHeader = true }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop/Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" style={{ minWidth: 800 }}>
          <thead style={{ position: stickyHeader ? "sticky" : "static", top: 0, zIndex: 10 }}>
            <tr style={{ background: "var(--input-background)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                >
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer transition-all" : ""}
                style={{ borderBottom: index < data.length - 1 ? "1px solid var(--border-light)" : "none" }}
                onMouseEnter={(e) => {
                  if (onRowClick) (e.currentTarget as HTMLElement).style.background = "var(--hover-overlay)";
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick?.(row)}
            className={`rounded-xl p-4 ${onRowClick ? "cursor-pointer" : ""}`}
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border-light)",
            }}
          >
            {mobileCardRender ? (
              mobileCardRender(row, index)
            ) : (
              <>
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col) => (
                    <div key={col.key} className="flex items-center justify-between py-2">
                      <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                        {col.mobileLabel || col.label}
                      </span>
                      <div className="text-[13px]" style={{ color: "var(--text-primary)" }}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </div>
                    </div>
                  ))}
                {onRowClick && (
                  <div className="flex items-center justify-end mt-2 pt-2" style={{ borderTop: "1px solid var(--border-light)" }}>
                    <ChevronRight size={16} style={{ color: "var(--accent-navy-light)" }} />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
