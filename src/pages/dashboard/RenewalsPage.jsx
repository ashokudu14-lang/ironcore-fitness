import { useEffect, useState } from "react";
import { Badge, Feedback, Skeleton } from "../../components/ui/Primitives.jsx";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { getCurrentGym } from "../../services/gym.js";
import {
  listUpcomingRenewals,
  renewSubscription,
} from "../../services/subscriptions.js";

export default function RenewalsPage() {
  const [attempt, setAttempt] = useState(0);
  const [renewals, setRenewals] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [renewingId, setRenewingId] = useState("");

  useEffect(() => {
    let active = true;
    getCurrentGym()
      .then((currentGym) => listUpcomingRenewals(currentGym.id, 7))
      .then((rows) => {
        if (!active) return;
        setRenewals(rows);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Unable to load renewals.");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const renew = async (renewal) => {
    if (
      !window.confirm(
        `Renew ${renewal.members?.full_name || "this member"} on the ${renewal.membership_plans?.name || "current"} plan? A new membership period will be created.`,
      )
    )
      return;
    setSuccess("");
    setRenewingId(renewal.id);
    setMessage("");

    try {
      await renewSubscription(renewal);
      setSuccess("Membership renewed successfully.");
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

        <Feedback error>{message}</Feedback>
        <Feedback>{success}</Feedback>

        {status === "loading" ? (
          <Skeleton rows={4} />
        ) : status === "error" ? (
          <button
            className="button button-secondary"
            onClick={() => {
              setStatus("loading");
              setMessage("");
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </button>
        ) : renewals.length === 0 ? (
          <div className="empty-state">
            <strong>Nothing due this week.</strong>
            <p>Upcoming membership expiries will appear here automatically.</p>
          </div>
        ) : (
          <div className="member-list">
            {renewals.map((renewal) => (
              <article
                className="member-row member-row-action"
                key={renewal.id}
              >
                <div>
                  <strong>{renewal.members?.full_name || "Member"}</strong>
                  <span>{renewal.members?.phone || "No phone"}</span>
                </div>

                <div className="renewal-meta">
                  <Badge tone="warning">
                    {renewal.membership_plans?.name || "Membership"}
                  </Badge>
                  <small>
                    Ends{" "}
                    {new Date(
                      renewal.end_date + "T00:00:00",
                    ).toLocaleDateString()}
                  </small>
                  <button
                    className="button button-secondary button-small"
                    type="button"
                    disabled={Boolean(renewingId)}
                    onClick={() => renew(renewal)}
                  >
                    {renewingId === renewal.id
                      ? "Renewing..."
                      : "Renew membership"}
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
