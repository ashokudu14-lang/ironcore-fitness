export default function DashboardPreview() {
  return (
    <div className="dashboard-preview" aria-label="IronCore OS product preview">
      <div className="preview-bar">
        <span>Product preview</span>
        <span>Example layout, no customer data</span>
      </div>

      <div className="preview-shell">
        <aside className="preview-sidebar" aria-hidden="true">
          <strong>IronCore OS</strong>
          <span>Overview</span>
          <span>Members</span>
          <span>Payments</span>
          <span>Renewals</span>
        </aside>

        <div className="preview-content">
          <div className="preview-heading">
            <div>
              <span className="eyebrow">Overview</span>
              <h3>Your gym at a glance</h3>
            </div>
            <span className="preview-date">Today</span>
          </div>

          <div className="preview-stat-grid">
            {[
              ["Active members", "No data loaded"],
              ["Renewals due", "No data loaded"],
              ["Revenue this month", "No data loaded"],
            ].map(([label, value]) => (
              <article className="preview-stat" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

          <div className="preview-table">
            <div className="preview-table-head">
              <strong>Upcoming renewals</strong>
              <span>Real records will appear here</span>
            </div>
            <div className="preview-empty">
              <span>No members yet</span>
              <small>Add your first member after setup.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
