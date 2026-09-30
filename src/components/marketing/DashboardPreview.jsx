import { withWordMotion, usePreviewTilt } from "../motion/CursorFeedback.jsx";
import { motion, useReducedMotion } from "motion/react";

export default function DashboardPreview() {
  const reduced = useReducedMotion();
  const tilt = usePreviewTilt();
  return withWordMotion(
    <motion.div className="dashboard-preview" aria-label="IronCore OS product preview"
      {...tilt}
    >
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
            ].map(([label, value], index) => (
              <motion.article className="preview-stat" key={label}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.28 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduced ? undefined : { y: -3 }}
              >
                <span>{label}</span>
                <strong>{value}</strong>
              </motion.article>
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
    </motion.div>
  );
}
