import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

export default function DashboardPreview() {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const rotateX = useSpring(targetX, { stiffness: 140, damping: 25 });
  const rotateY = useSpring(targetY, { stiffness: 140, damping: 25 });
  const followPointer = (event) => {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    targetX.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 5);
    targetY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
  };
  return (
    <motion.div className="dashboard-preview" aria-label="IronCore OS product preview"
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
      onPointerMove={followPointer}
      onPointerLeave={() => { targetX.set(0); targetY.set(0); }}
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
