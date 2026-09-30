import { useEffect, useState } from "react";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { getCurrentGym } from "../../services/gym.js";
import {
  listUpcomingRenewals,
  renewSubscription,
} from "../../services/subscriptions.js";

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [renewingId, setRenewingId] = useState("");

  const load = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const currentGym = await getCurrentGym();
      const rows = await listUpcomingRenewals(currentGym.id, 7);
      setRenewals(rows);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to load renewals.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renew = async (renewal) => {
    setRenewingId(renewal.id);
    setMessage("");

    try {
      await renewSubscription(renewal);
      setRenewals((current) =>
        current.filter((item) => item.id !== renewal.id),
      );
    } catch (error) {
      setMessage(error.message || "Unable to renew this membership.");
    } finally {
      setRenewingId("");
    }
  };

  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">Renewals</span>
          <h1>Due in the next 7 days</h1>
          <p>Follow up before memberships expire, then renew them here.</p>
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
              <article className="member-row member-row-action" key={renewal.id}>
                <div>
                  <strong>{renewal.members?.full_name || "Member"}</strong>
                  <span>{renewal.members?.phone || "No phone"}</span>
                </div>

                <div className="renewal-meta">
                  <strong>{renewal.membership_plans?.name || "Membership"}</strong>
                  <small>
                    Ends{" "}
                    {new Date(
                      renewal.end_date + "T00:00:00",
                    ).toLocaleDateString()}
                  </small>
                  <button
                    className="button button-secondary button-small"
                    type="button"
                    disabled={renewingId === renewal.id}
                    onClick={() => renew(renewal)}
                  >
                    {renewingId === renewal.id ? "Renewing..." : "Renew membership"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
