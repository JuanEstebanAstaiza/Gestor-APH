import { useState, useMemo } from "react";

interface DataTableProps<T> {
  columns: { key: string; label: string; sortable?: boolean }[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No hay datos disponibles",
  pageSize = 0,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const strA = String(aVal);
      const strB = String(bVal);
      return sortDir === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [data, sortCol, sortDir]);

  // Paginate
  const hasPagination = pageSize > 0 && sortedData.length > pageSize;
  const paginatedData = hasPagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;
  const totalPages = hasPagination ? Math.ceil(sortedData.length / pageSize) : 1;

  const handleSort = (key: string) => {
    if (sortCol === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(key);
      setSortDir("asc");
    }
  };

  return (
    <div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortCol === col.key && (
                    <span style={{ marginLeft: 4, opacity: 0.5 }}>
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="data-table-empty"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr
                  key={i}
                  className={onRowClick ? "clickable" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasPagination && (
        <div className="pagination">
          <span>
            {(currentPage - 1) * pageSize + 1}—{Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}
          </span>
          <div className="pagination-buttons">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn${page === currentPage ? " active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
