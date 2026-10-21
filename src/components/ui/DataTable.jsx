import { useState } from "react";
import Icon from "./Icon.jsx";
import { EmptyState } from "./Primitives.jsx";
export default function DataTable({
  rows,
  columns,
  label,
  searchKeys,
  filters,
  filterKey,
  emptyTitle,
  emptyText,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState({ key: "", direction: 1 });
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const filtered = rows.filter(
    (row) =>
      (filter === "all" || filterKey(row) === filter) &&
      searchKeys(row).toLowerCase().includes(query.trim().toLowerCase()),
  );
  const sorted = sort.key
    ? [...filtered].sort((a, b) => {
        const column = columns.find((item) => item.key === sort.key);
        const first = column.sortValue(a),
          second = column.sortValue(b);
        return (
          (typeof first === "number"
            ? first - second
            : String(first).localeCompare(String(second))) * sort.direction
        );
      })
    : filtered;
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages - 1);
  function sortBy(key) {
    setSort((previous) => ({
      key,
      direction: previous.key === key ? -previous.direction : 1,
    }));
    setPage(0);
  }
  return (
    <div className="data-directory">
      <div className="table-toolbar">
        <label className="search-field">
          <Icon name="search" size={17} />
          <span className="sr-only">Search {label}</span>
          <input
            type="search"
            placeholder={`Search ${label}…`}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </label>
        {filters && (
          <label className="table-filter">
            <span className="sr-only">Filter {label}</span>
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(0);
              }}
            >
              <option value="all">All {label}</option>
              {filters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {!sorted.length ? (
        <EmptyState title={rows.length ? "No matching records." : emptyTitle}>
          {rows.length ? "Try another search or filter." : emptyText}
        </EmptyState>
      ) : (
        <>
          <div
            className="table-scroll"
            data-lenis-prevent
            tabIndex={0}
            role="region"
            aria-label={`${label} table, scroll for more columns`}
          >
            <table className="data-table">
              <caption className="sr-only">{label}</caption>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      scope="col"
                      key={column.key}
                      aria-sort={
                        sort.key === column.key
                          ? sort.direction === 1
                            ? "ascending"
                            : "descending"
                          : column.sortValue
                            ? "none"
                            : undefined
                      }
                    >
                      {column.sortValue ? (
                        <button
                          type="button"
                          onClick={() => sortBy(column.key)}
                        >
                          {column.label}
                          <span aria-hidden="true">
                            {sort.key === column.key
                              ? sort.direction === 1
                                ? "↑"
                                : "↓"
                              : "↕"}
                          </span>
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted
                  .slice(current * pageSize, (current + 1) * pageSize)
                  .map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td key={column.key}>{column.render(row)}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <span role="status">
              {current * pageSize + 1}–
              {Math.min((current + 1) * pageSize, sorted.length)} of{" "}
              {sorted.length}
            </span>
            <div>
              <button
                type="button"
                className="icon-button"
                aria-label="Previous page"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                <span aria-hidden="true">←</span>
              </button>
              <span>
                {current + 1} / {pages}
              </span>
              <button
                type="button"
                className="icon-button"
                aria-label="Next page"
                disabled={current + 1 >= pages}
                onClick={() => setPage(current + 1)}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
