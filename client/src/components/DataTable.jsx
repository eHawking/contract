import React from 'react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './Skeleton';

function DataTable({
  columns = [],
  data = [],
  rowKey,
  loading = false,
  empty,
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  stickyHeader = true,
  maxHeight,
  onRowClick,
  className = ''
}) {
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, data.length]);

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount]);

  const startIndex = (page - 1) * pageSize;
  const pageData = data.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="w-full">
        <TableSkeleton rows={pageSize} />
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="w-full">
        {empty ? (
          <EmptyState title={empty.title} subtitle={empty.subtitle} action={empty.action} />
        ) : (
          <EmptyState />
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto">
        <div className={maxHeight ? '' : ''} style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}>
          <table className="w-full">
            <thead className={`${stickyHeader ? 'sticky top-0 z-10' : ''} bg-white dark:bg-gray-900`}>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {columns.map((col) => (
                  <th key={col.key} className={`text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 ${col.headerClassName || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, idx) => {
                const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
                return (
                  <tr
                    key={key ?? idx}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={onRowClick ? { cursor: 'pointer' } : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3 px-4 ${col.cellClassName || ''}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mt-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {data.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, data.length)} of {data.length}
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">Page {page} of {pageCount}</span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
