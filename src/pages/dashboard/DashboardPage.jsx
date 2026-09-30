import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { getCurrentGym } from "../../services/gym.js";
import { getDashboardData } from "../../services/dashboard.js";

const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function DashboardPage() {
  const [gym, setGym] = useState(null);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const currentGym = await getCurrentGym();
        const dashboard = await getDashboardData(currentGym.id);

        if (!active) return;
        setGym(currentGym);
        setData(dashboard);
      } catch (error) {
        if (!active) return;
        setMessage(error.message || "Unable to load dashboard.");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    ["Active members", data ? String(data.activeMembers) : "Loading"],
    ["Renewals due", data ? String(data.renewals.length) : "Loading"],
    ["Revenue this month", data ? money(data.revenue, gym?.currency) : "Loading"],
  ];

  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>{gym?.name || "Gym dashboard"}</h1>
        </div>
        <Link className="button button-primary" to="/app/members">
          Add member
        </Link>
      </div>

      {message && <p className="form-feedback error">{message}</p>}

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
            <Link className="text-button" to="/app/renewals">View all</Link>
          </div>

          {!data || data.renewals.length === 0 ? (
            <div className="empty-state">
              <strong>No renewals due this week.</strong>
              <p>Memberships ending within seven days will appear here.</p>
            </div>
          ) : (
            <div className="member-list">
              {data.renewals.slice(0, 5).map((renewal) => (
                <article className="member-row" key={renewal.id}>
                  <div>
                    <strong>{renewal.members?.full_name || "Member"}</strong>
                    <span>{renewal.members?.phone || "No phone"}</span>
                  </div>
                  <div>
                    <small>{new Date(renewal.end_date + "T00:00:00").toLocaleDateString()}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Payments</span>
              <h2>Recent payments</h2>
            </div>
            <Link className="text-button" to="/app/payments">View all</Link>
          </div>

          {!data || data.recentPayments.length === 0 ? (
            <div className="empty-state">
              <strong>No payments recorded yet.</strong>
              <p>New payment records will appear here.</p>
            </div>
          ) : (
            <div className="member-list">
              {data.recentPayments.map((payment) => (
                <article className="member-row" key={payment.id}>
                  <div>
                    <strong>{payment.members?.full_name || "Member"}</strong>
                    <span>{payment.method.replace("_", " ")}</span>
                  </div>
                  <div>
                    <strong>{money(payment.amount, gym?.currency)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
