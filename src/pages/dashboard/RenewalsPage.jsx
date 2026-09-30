import { useEffect, useState } from "react";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { getCurrentGym } from "../../services/gym.js";
import { listUpcomingRenewals } from "../../services/subscriptions.js";

export default function RenewalsPage() {
  const [gym, setGym] = useState(null);
  const [renewals, setRenewals] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const currentGym = await getCurrentGym();
        const rows = await listUpcomingRenewals(currentGym.id, 7);

        if (!active) return;
        setGym(currentGym);
        setRenewals(rows.map((row) => ({ ...row, gym_id: currentGym.id })));
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Unable to load renewals.");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">Renewals</span>
          <h1>Due in the next 7 days</h1>
          <p>Use this list to follow up before memberships expire.</p>
        </div>
      </div>

      <section className="app-panel">
        <div className="app-panel-heading">
          <div>
            <span className="eyebrow">Upcoming</span>
            <h2>{renewals.length} renewals</h2>
          </div>
        </div>

        {message && <p className="form-feedback error">{message}</p>}

        {status === "loading" ? (
          <div className="empty-state"><p>Loading renewals.</p></div>
        ) : renewals.length === 0 ? (
          <div className="empty-state">
            <strong>Nothing due this week.</strong>
            <p>Upcoming membership expiries will appear here automatically.</p>
          </div>
        ) : (
          <div className="member-list">
            {renewals.map((renewal) => (
              <article className="member-row" key={renewal.id}>
                <div>
                  <strong>{renewal.members?.full_name || "Member"}</strong>
                  <span>{renewal.members?.phone || "No phone"}</span>
                </div>
                <div>
                  <strong>{renewal.membership_plans?.name || "Membership"}</strong>
                  <small>Ends {new Date(renewal.end_date + "T00:00:00").toLocaleDateString()}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
