import PageTransition from "../../components/motion/PageTransition.jsx";

const cards = [
  ["Active members", "Waiting for member data"],
  ["Renewals due", "Waiting for subscription data"],
  ["Revenue this month", "Waiting for payment data"],
];

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Gym dashboard</h1>
        </div>
        <button className="button button-primary" type="button" disabled>
          Add member
        </button>
      </div>

      <div className="app-stat-grid">
        {cards.map(([label, value]) => (
          <article className="app-stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="app-dashboard-grid">
        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Renewals</span>
              <h2>Upcoming renewals</h2>
            </div>
          </div>
          <div className="empty-state">
            <strong>No renewal data yet.</strong>
            <p>
              Once the database schema is connected, memberships expiring soon
              will appear here.
            </p>
          </div>
        </section>

        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Payments</span>
              <h2>Recent payments</h2>
            </div>
          </div>
          <div className="empty-state">
            <strong>No payment data yet.</strong>
            <p>
              Payment records will appear here after the payments module is
              connected to Supabase.
            </p>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
