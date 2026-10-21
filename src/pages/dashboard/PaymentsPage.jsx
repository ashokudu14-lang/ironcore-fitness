import { useEffect, useState } from "react";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import DataTable from "../../components/ui/DataTable.jsx";
import { Feedback, Skeleton } from "../../components/ui/Primitives.jsx";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { getCurrentGym } from "../../services/gym.js";
import { listMembers } from "../../services/members.js";
import { createPayment, listPayments } from "../../services/payments.js";

const currency = (value, code = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function PaymentsPage() {
  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    memberId: "",
    amount: "",
    method: "upi",
    reference: "",
    notes: "",
  });

  useUnsavedChanges(
    Boolean(form.memberId || form.amount || form.reference || form.notes),
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const currentGym = await getCurrentGym();
        const [memberRows, paymentRows] = await Promise.all([
          listMembers(currentGym.id),
          listPayments(currentGym.id),
        ]);

        if (!active) return;
        setGym(currentGym);
        setMembers(memberRows);
        setPayments(paymentRows);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Unable to load payments.");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!gym) return;

    setStatus("saving");
    setMessage("");

    try {
      const payment = await createPayment(gym.id, form);
      setPayments((current) => [payment, ...current]);
      setForm({
        memberId: "",
        amount: "",
        method: "upi",
        reference: "",
        notes: "",
      });
      setStatus("ready");
      setMessage("Payment recorded successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to record payment.");
    }
  };

  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">Payments</span>
          <h1>Payment records</h1>
          <p>
            Track money received and keep it attached to the correct member.
          </p>
        </div>
      </div>

      <div className="module-grid">
        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">History</span>
              <h2>{payments.length} payments</h2>
            </div>
          </div>

          <p className="table-scope-note">
            Most recent 50 records. Search and filters apply to loaded payments.
          </p>
          {status === "loading" ? (
            <Skeleton rows={5} />
          ) : status === "error" && !gym ? (
            <Feedback error>{message}</Feedback>
          ) : (
            <DataTable
              rows={payments}
              label="payments"
              searchKeys={(row) =>
                `${row.members?.full_name || ""} ${row.reference || ""}`
              }
              filterKey={(row) => row.method}
              filters={["upi", "cash", "card", "bank_transfer", "other"].map(
                (value) => ({ value, label: value.replace("_", " ") }),
              )}
              emptyTitle="Every collection starts with a record."
              emptyText="Record a payment to build a clear history for your gym."
              columns={[
                {
                  key: "member",
                  label: "Member",
                  sortValue: (row) => row.members?.full_name || "",
                  render: (row) => (
                    <div className="table-person">
                      <span className="table-avatar" aria-hidden="true">
                        {(row.members?.full_name || "M")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <strong>{row.members?.full_name || "Member"}</strong>
                    </div>
                  ),
                },
                {
                  key: "amount",
                  label: "Amount",
                  sortValue: (row) => Number(row.amount),
                  render: (row) => (
                    <strong className="tabular">
                      {currency(row.amount, gym?.currency)}
                    </strong>
                  ),
                },
                {
                  key: "method",
                  label: "Method",
                  render: (row) => (
                    <span className="method-label">
                      {row.method.replace("_", " ")}
                    </span>
                  ),
                },
                {
                  key: "date",
                  label: "Date",
                  sortValue: (row) => row.paid_at,
                  render: (row) => new Date(row.paid_at).toLocaleDateString(),
                },
              ]}
            />
          )}
        </section>

        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">New payment</span>
              <h2>Record payment</h2>
            </div>
          </div>

          <form
            className="module-form"
            onSubmit={submit}
            aria-busy={status === "saving"}
          >
            <fieldset
              className="form-fields"
              disabled={status === "saving" || status === "loading"}
            >
              <label>
                Member
                <select
                  name="memberId"
                  value={form.memberId}
                  onChange={update}
                  required
                >
                  <option value="">Select member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Amount
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={update}
                  required
                />
              </label>

              <label>
                Method
                <select name="method" value={form.method} onChange={update}>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Reference
                <input
                  name="reference"
                  value={form.reference}
                  onChange={update}
                />
              </label>

              <label>
                Notes
                <textarea
                  name="notes"
                  rows="3"
                  value={form.notes}
                  onChange={update}
                />
              </label>

              <Feedback error={status === "error"}>{message}</Feedback>
              {gym && !members.length && (
                <p className="form-help">
                  Add a member first, then record their payment here.
                </p>
              )}

              <button
                className="button button-primary"
                type="submit"
                disabled={!gym || !members.length || status === "saving"}
              >
                {status === "saving" ? "Recording..." : "Record payment"}
              </button>
            </fieldset>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
