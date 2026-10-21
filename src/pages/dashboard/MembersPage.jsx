import { useEffect, useState } from "react";
import useUnsavedChanges from "../../hooks/useUnsavedChanges.js";
import DataTable from "../../components/ui/DataTable.jsx";
import { Badge, Feedback, Skeleton } from "../../components/ui/Primitives.jsx";
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

  useUnsavedChanges(
    Boolean(
      form.fullName ||
        form.phone ||
        form.email ||
        form.joinedAt !== makeInitialForm().joinedAt ||
        (plans.length && form.planId !== plans[0].id),
    ),
  );

  useEffect(() => {
    let active = true;
    getCurrentGym()
      .then(async (currentGym) => {
        if (!currentGym) throw new Error("No gym workspace found.");
        const [memberRows, planRows] = await Promise.all([
          listMembers(currentGym.id),
          listActivePlans(currentGym.id),
        ]);
        if (!active) return;
        setGym(currentGym);
        setMembers(memberRows);
        setPlans(planRows);
        setForm((current) => ({
          ...current,
          planId: current.planId || planRows[0]?.id || "",
        }));
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Unable to load members.");
      });
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
      setMessage("Member added successfully.");
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
            <Skeleton rows={5} />
          ) : status === "error" && !gym ? (
            <Feedback error>{message}</Feedback>
          ) : (
            <DataTable
              rows={members}
              label="members"
              searchKeys={(row) =>
                `${row.full_name} ${row.email || ""} ${row.phone}`
              }
              filterKey={(row) => row.status}
              filters={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              emptyTitle="Your member community starts here."
              emptyText="Add your first member using the form. Their details and status will appear here."
              columns={[
                {
                  key: "name",
                  label: "Member",
                  sortValue: (row) => row.full_name,
                  render: (row) => (
                    <div className="table-person">
                      <span className="table-avatar" aria-hidden="true">
                        {row.full_name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <strong>{row.full_name}</strong>
                        <small>{row.email || "No email provided"}</small>
                      </div>
                    </div>
                  ),
                },
                { key: "phone", label: "Phone", render: (row) => row.phone },
                {
                  key: "status",
                  label: "Status",
                  sortValue: (row) => row.status,
                  render: (row) => (
                    <Badge
                      tone={row.status === "active" ? "success" : "neutral"}
                    >
                      {row.status}
                    </Badge>
                  ),
                },
                {
                  key: "joined",
                  label: "Joined",
                  sortValue: (row) => row.joined_at,
                  render: (row) =>
                    new Date(row.joined_at + "T00:00:00").toLocaleDateString(),
                },
              ]}
            />
          )}
        </section>

        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">New member</span>
              <h2>Add member</h2>
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
                Full name
                <input
                  autoComplete="name"
                  placeholder="Member’s full name"
                  name="fullName"
                  value={form.fullName}
                  onChange={update}
                  required
                />
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="Phone number"
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  required
                />
              </label>

              <label>
                Email
                <input
                  autoComplete="email"
                  placeholder="Optional"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                />
              </label>

              <label>
                Joined date
                <input
                  name="joinedAt"
                  type="date"
                  value={form.joinedAt}
                  onChange={update}
                  required
                />
              </label>

              <label>
                Membership plan
                <select
                  name="planId"
                  value={form.planId}
                  onChange={update}
                  required
                >
                  <option value="">Select plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} · {plan.duration_days} days
                    </option>
                  ))}
                </select>
              </label>

              <Feedback error={status === "error"}>{message}</Feedback>
              {gym && !plans.length && (
                <p className="form-help">
                  Create an active membership plan in Settings before adding a
                  member.
                </p>
              )}

              <button
                className="button button-primary"
                type="submit"
                disabled={!gym || !plans.length || status === "saving"}
              >
                {status === "saving" ? "Adding member..." : "Add member"}
              </button>
            </fieldset>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
