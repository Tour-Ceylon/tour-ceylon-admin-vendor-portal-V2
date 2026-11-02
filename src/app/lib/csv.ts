export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

function escapeCell(raw: string | number | boolean | null | undefined): string {
  let text = raw === null || raw === undefined ? "" : String(raw);
  // Neutralise spreadsheet formula injection (=, +, -, @, tab, CR at start of a cell).
  if (/^[=+\-@\t\r]/.test(text) && typeof raw !== "number") {
    text = `'${text}`;
  }
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [
    columns.map((c) => escapeCell(c.header)).join(","),
    ...rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(",")),
  ];
  return lines.join("\r\n");
}

/** Triggers a browser download of the rows as a UTF-8 CSV (with BOM so Excel reads it correctly). */
export function downloadCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  const blob = new Blob(["﻿" + buildCsv(rows, columns)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
