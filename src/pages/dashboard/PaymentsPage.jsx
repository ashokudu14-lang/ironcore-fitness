import { useEffect, useState } from "react";
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
          <p>Track money received and keep it attached to the correct member.</p>
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

          {payments.length === 0 ? (
            <div className="empty-state">
              <strong>No payments yet.</strong>
              <p>Record the first payment using the form.</p>
            </div>
          ) : (
            <div className="member-list">
              {payments.map((payment) => (
                <article className="member-row" key={payment.id}>
                  <div>
                    <strong>{payment.members?.full_name || "Member"}</strong>
                    <span>{payment.method.replace("_", " ")}</span>
                  </div>
                  <div>
                    <strong>{currency(payment.amount, gym?.currency)}</strong>
                    <small>{new Date(payment.paid_at).toLocaleDateString()}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">New payment</span>
              <h2>Record payment</h2>
            </div>
          </div>

          <form className="module-form" onSubmit={submit}>
            <label>
              Member
              <select name="memberId" value={form.memberId} onChange={update} required>
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
              <input name="reference" value={form.reference} onChange={update} />
            </label>

            <label>
              Notes
              <textarea name="notes" rows="3" value={form.notes} onChange={update} />
            </label>

            {message && <p className="form-feedback error">{message}</p>}

            <button className="button button-primary" type="submit" disabled={!members.length || status === "saving"}>
              {status === "saving" ? "Recording..." : "Record payment"}
            </button>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
