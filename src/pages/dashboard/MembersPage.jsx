import { useEffect, useState } from "react";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { getCurrentGym } from "../../services/gym.js";
import { createMember, listMembers } from "../../services/members.js";
import { listActivePlans } from "../../services/plans.js";
import { createSubscription } from "../../services/subscriptions.js";

const makeInitialForm = () => ({
  fullName: "",
  phone: "",
  email: "",
  joinedAt: new Date().toISOString().slice(0, 10),
  planId: "",
});

export default function MembersPage() {
  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(makeInitialForm());
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const load = async () => {
    setStatus("loading");

    try {
      const currentGym = await getCurrentGym();

      if (!currentGym) {
        setStatus("error");
        setMessage("No gym workspace found.");
        return;
      }

      const [memberRows, planRows] = await Promise.all([
        listMembers(currentGym.id),
        listActivePlans(currentGym.id),
      ]);

      setGym(currentGym);
      setMembers(memberRows);
      setPlans(planRows);
      setForm((current) => ({
        ...current,
        planId: current.planId || planRows[0]?.id || "",
      }));
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to load members.");
    }
  };

  useEffect(() => {
    load();
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
      const member = await createMember(gym.id, form);
      const selectedPlan = plans.find((plan) => plan.id === form.planId);

      if (selectedPlan) {
        await createSubscription({
          gymId: gym.id,
          memberId: member.id,
          plan: selectedPlan,
          startDate: form.joinedAt,
        });
      }

      setMembers((current) => [member, ...current]);
      setForm({
        ...makeInitialForm(),
        planId: plans[0]?.id || "",
      });
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to add member.");
    }
  };

  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">Members</span>
          <h1>Member records</h1>
          <p>Real member data for {gym?.name || "your gym"}.</p>
        </div>
      </div>

      <div className="module-grid">
        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Directory</span>
              <h2>{members.length} members</h2>
            </div>
          </div>

          {status === "loading" ? (
            <div className="empty-state"><p>Loading members.</p></div>
          ) : members.length === 0 ? (
            <div className="empty-state">
              <strong>No members yet.</strong>
              <p>Add the first member using the form.</p>
            </div>
          ) : (
            <div className="member-list">
              {members.map((member) => (
                <article className="member-row" key={member.id}>
                  <div>
                    <strong>{member.full_name}</strong>
                    <span>{member.phone}</span>
                  </div>
                  <div>
                    <span>{member.email || "No email"}</span>
                    <small>{member.status}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">New member</span>
              <h2>Add member</h2>
            </div>
          </div>

          <form className="module-form" onSubmit={submit}>
            <label>
              Full name
              <input name="fullName" value={form.fullName} onChange={update} required />
            </label>

            <label>
              Phone
              <input name="phone" value={form.phone} onChange={update} required />
            </label>

            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={update} />
            </label>

            <label>
              Joined date
              <input name="joinedAt" type="date" value={form.joinedAt} onChange={update} required />
            </label>

            <label>
              Membership plan
              <select name="planId" value={form.planId} onChange={update} required>
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {plan.duration_days} days
                  </option>
                ))}
              </select>
            </label>

            {message && <p className="form-feedback error">{message}</p>}

            <button
              className="button button-primary"
              type="submit"
              disabled={!gym || !plans.length || status === "saving"}
            >
              {status === "saving" ? "Adding member..." : "Add member"}
            </button>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
