import Icon from "../ui/Icon.jsx";
export default function DashboardPreview() {
  return (
    <div className="dashboard-preview" aria-label="IronCore OS product preview">
      <div className="preview-bar">
        <span>
          <i aria-hidden="true" /> ironcore / workspace
        </span>
        <span>Product preview · empty workspace</span>
      </div>
      <div className="preview-shell">
        <aside className="preview-sidebar" aria-hidden="true">
          <strong>
            <span className="brand-mark">I</span> IronCore
          </strong>
          {[
            ["grid", "Overview"],
            ["members", "Members"],
            ["payments", "Payments"],
            ["renewals", "Renewals"],
          ].map(([icon, label]) => (
            <span key={label}>
              <Icon name={icon} size={14} />
              {label}
            </span>
          ))}
          <span className="preview-settings">
            <Icon name="settings" size={14} />
            Settings
          </span>
        </aside>
        <div className="preview-content">
          <div className="preview-heading">
            <div>
              <span className="eyebrow">Your workspace</span>
              <h3>Ready for your next chapter.</h3>
            </div>
            <Icon name="activity" />
          </div>
          <div className="preview-stat-grid">
            {[
              ["Active members", "members"],
              ["Monthly revenue", "payments"],
              ["Renewals due", "renewals"],
            ].map(([label, icon]) => (
              <article className="preview-stat" key={label}>
                <span>
                  {label}
                  <Icon name={icon} size={13} />
                </span>
                <strong>—</strong>
                <small>Awaiting your first records</small>
              </article>
            ))}
          </div>
          <div className="preview-table">
            <div className="preview-table-head">
              <strong>Upcoming renewals</strong>
              <span>Next 7 days</span>
            </div>
            <div className="preview-empty">
              <span className="preview-empty-icon">
                <Icon name="renewals" />
              </span>
              <span>A clear view of what’s next.</span>
              <small>Your upcoming renewals will appear here.</small>
            </div>
          </div>
          <div className="preview-bottom">
            <span>
              <Icon name="shield" size={12} /> A workspace built around your gym
            </span>
            <span>IronCore OS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
