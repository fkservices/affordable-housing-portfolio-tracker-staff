// ---------------------------------------------------------------------------
// CSV export utility (RFC 4180)
// ---------------------------------------------------------------------------

export interface CsvColumn {
  key: string;
  header: string;
}

/**
 * Escape a single cell value per RFC 4180:
 * - If the value contains a comma, double-quote, or newline it must be
 *   enclosed in double-quotes.
 * - Any embedded double-quotes are escaped by doubling them.
 */
function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build a CSV string from an array of row objects and trigger a browser
 * download with the given filename.
 */
export function exportCsv(
  data: Record<string, unknown>[],
  columns: CsvColumn[],
  filename: string,
): void {
  const headerRow = columns.map((c) => escapeCell(c.header)).join(',');

  const bodyRows = data.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(','),
  );

  const csvContent = [headerRow, ...bodyRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
