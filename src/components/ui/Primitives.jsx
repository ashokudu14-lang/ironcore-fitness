import Icon from "./Icon.jsx";
export function Skeleton({ rows = 3 }) {
  return (
    <div className="skeleton-group" role="status" aria-label="Loading records">
      <span className="sr-only">Loading records…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
export function EmptyState({ title, children, icon = "members" }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={24} />
      </span>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}
export function Feedback({ children, error = false }) {
  if (!children) return null;
  return (
    <p
      className={`form-feedback ${error ? "error" : "success"}`}
      role={error ? "alert" : "status"}
    >
      <Icon name={error ? "alert" : "check"} />
      {children}
    </p>
  );
}
export function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`status-badge ${tone}`}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}
