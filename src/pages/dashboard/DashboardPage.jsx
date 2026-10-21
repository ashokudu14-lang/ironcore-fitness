import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../../components/motion/PageTransition.jsx";
import MetricCard from "../../components/ui/MetricCard.jsx";
import Icon from "../../components/ui/Icon.jsx";
import {
  Badge,
  EmptyState,
  Feedback,
  Skeleton,
} from "../../components/ui/Primitives.jsx";
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
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const currentGym = await getCurrentGym();
        const dashboard = await getDashboardData(currentGym.id);
        if (!active) return;
        setGym(currentGym);
        setData(dashboard);
        setMessage("");
      } catch (error) {
        if (active) setMessage(error.message || "Unable to load dashboard.");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [attempt]);
  const methods = Object.entries(
    (data?.recentPayments || []).reduce((result, item) => {
      result[item.method] = (result[item.method] || 0) + Number(item.amount);
      return result;
    }, {}),
  );
  const recentTotal = methods.reduce((sum, [, value]) => sum + value, 0);
  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">The daily overview</span>
          <h1>{gym?.name || "Gym dashboard"}</h1>
          <p>Your members, collections, and next steps. All in focus.</p>
        </div>
        <Link className="button button-primary" to="/app/members">
          <Icon name="plus" size={17} />
          Add member
        </Link>
      </div>
      {message && (
        <div className="dashboard-error">
          <Feedback error>{message}</Feedback>
          <button
            className="button button-secondary button-small"
            onClick={() => {
              setMessage("");
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}
      <div className="app-stat-grid">
        <MetricCard
          label="Active members"
          value={message ? null : data?.activeMembers}
          note="Current member status"
          icon="members"
        />
        <MetricCard
          label="Revenue this month"
          value={message ? null : data?.revenue}
          format={(value) => money(value, gym?.currency)}
          note="Recorded collections · this calendar month"
          icon="payments"
        />
        <MetricCard
          label="Renewals due"
          value={message ? null : data?.renewals.length}
          note="Memberships ending in the next 7 days"
          icon="renewals"
        />
      </div>
      <div className="overview-section-label">
        <h2>Your daily priorities</h2>
        <span>Built from your gym’s records</span>
      </div>
      <div className="app-dashboard-grid">
        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Keep the momentum</span>
              <h2>Upcoming renewals</h2>
            </div>
            <Link className="text-button" to="/app/renewals">
              View all <Icon name="arrow" size={15} />
            </Link>
          </div>
          {!data ? (
            message ? (
              <EmptyState title="Renewals unavailable" icon="alert">
                Retry to load your gym’s records.
              </EmptyState>
            ) : (
              <Skeleton />
            )
          ) : !data.renewals.length ? (
            <EmptyState title="You’re clear for the week." icon="renewals">
              Memberships ending within seven days will appear here.
            </EmptyState>
          ) : (
            <div className="member-list">
              {data.renewals.slice(0, 5).map((item) => (
                <article className="member-row" key={item.id}>
                  <div className="record-person">
                    <span className="table-avatar" aria-hidden="true">
                      {(item.members?.full_name || "M")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div>
                      <strong>{item.members?.full_name || "Member"}</strong>
                      <small>{item.members?.phone || "No phone"}</small>
                    </div>
                  </div>
                  <div>
                    <Badge tone="warning">
                      Due{" "}
                      {new Date(item.end_date + "T00:00:00").toLocaleDateString(
                        undefined,
                        { day: "numeric", month: "short" },
                      )}
                    </Badge>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Latest collections</span>
              <h2>Recent payments</h2>
            </div>
            <Link className="text-button" to="/app/payments">
              View all <Icon name="arrow" size={15} />
            </Link>
          </div>
          {!data ? (
            message ? (
              <EmptyState title="Payments unavailable" icon="alert">
                Retry to load your gym’s records.
              </EmptyState>
            ) : (
              <Skeleton />
            )
          ) : !data.recentPayments.length ? (
            <EmptyState
              title="Ready for your first collection."
              icon="payments"
            >
              Payment records will appear here as you add them.
            </EmptyState>
          ) : (
            <div className="member-list">
              {data.recentPayments.map((item) => (
                <article className="member-row" key={item.id}>
                  <div>
                    <strong>{item.members?.full_name || "Member"}</strong>
                    <small>{item.method.replace("_", " ")}</small>
                  </div>
                  <div>
                    <strong className="tabular">
                      {money(item.amount, gym?.currency)}
                    </strong>
                    <small>
                      {new Date(item.paid_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="app-dashboard-grid overview-bottom">
        <section className="app-panel collection-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Collection mix</span>
              <h2>How members paid</h2>
            </div>
            <span className="scope-badge">
              Last {data?.recentPayments.length || 0} payments
            </span>
          </div>
          {!data ? (
            <Skeleton rows={2} />
          ) : !methods.length ? (
            <EmptyState
              title="Your collection mix starts here."
              icon="activity"
            >
              Payment methods will be summarized after your first collection.
            </EmptyState>
          ) : (
            <div className="collection-chart">
              <p>Share of value across your most recent payments.</p>
              {methods.map(([method, value], index) => (
                <div className="collection-row" key={method}>
                  <div>
                    <span>{method.replace("_", " ")}</span>
                    <strong>{money(value, gym?.currency)}</strong>
                  </div>
                  <div
                    className="collection-track"
                    role="meter"
                    aria-label={`${method.replace("_", " ")} share of recent collections`}
                    aria-valuenow={Math.round(
                      recentTotal ? (value / recentTotal) * 100 : 0,
                    )}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span
                      style={{
                        width: `${recentTotal ? (value / recentTotal) * 100 : 0}%`,
                        background: [
                          "var(--brand)",
                          "var(--text-muted)",
                          "var(--info)",
                          "var(--warning)",
                          "var(--success)",
                        ][index],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="workspace-shortcuts">
          <span className="eyebrow">Keep moving</span>
          <h2>A stronger daily routine.</h2>
          <p>Small actions keep your member business in good shape.</p>
          {[
            ["/app/members", "members", "Manage your members"],
            ["/app/payments", "payments", "Record a collection"],
            ["/app/settings", "settings", "Review membership plans"],
          ].map(([to, icon, text]) => (
            <Link to={to} key={to}>
              <Icon name={icon} />
              <span>{text}</span>
              <Icon name="arrow" size={16} />
            </Link>
          ))}
        </section>
      </div>
    </PageTransition>
  );
}
