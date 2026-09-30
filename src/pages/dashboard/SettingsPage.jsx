import { useEffect, useState } from "react";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { getCurrentGym, updateGym } from "../../services/gym.js";
import {
  createPlan,
  listPlans,
  setPlanActive,
} from "../../services/plans.js";

const formatMoney = (value, currency) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function SettingsPage() {
  const [gym, setGym] = useState(null);
  const [plans, setPlans] = useState([]);
  const [gymForm, setGymForm] = useState({
    name: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
  });
  const [planForm, setPlanForm] = useState({
    name: "",
    durationDays: "30",
    price: "",
  });
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const load = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const currentGym = await getCurrentGym();
      const planRows = await listPlans(currentGym.id);

      setGym(currentGym);
      setPlans(planRows);
      setGymForm({
        name: currentGym.name,
        timezone: currentGym.timezone,
        currency: currentGym.currency,
      });
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to load settings.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateGymField = (event) => {
    const { name, value } = event.target;
    setGymForm((current) => ({ ...current, [name]: value }));
  };

  const updatePlanField = (event) => {
    const { name, value } = event.target;
    setPlanForm((current) => ({ ...current, [name]: value }));
  };

  const saveGym = async (event) => {
    event.preventDefault();
    if (!gym || gym.role !== "owner") return;

    setStatus("saving");
    setMessage("");

    try {
      const updated = await updateGym(gym.id, gymForm);
      setGym((current) => ({ ...current, ...updated }));
      setStatus("ready");
      setMessage("Gym settings saved.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to save gym settings.");
    }
  };

  const addPlan = async (event) => {
    event.preventDefault();
    if (!gym || gym.role !== "owner") return;

    setStatus("saving");
    setMessage("");

    try {
      const plan = await createPlan(gym.id, planForm);
      setPlans((current) => [...current, plan]);
      setPlanForm({ name: "", durationDays: "30", price: "" });
      setStatus("ready");
      setMessage("Membership plan added.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to add membership plan.");
    }
  };

  const togglePlan = async (plan) => {
    if (!gym || gym.role !== "owner") return;

    setMessage("");

    try {
      const updated = await setPlanActive(plan.id, !plan.active);
      setPlans((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      setMessage(error.message || "Unable to update membership plan.");
    }
  };

  const canEdit = gym?.role === "owner";

  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">Settings</span>
          <h1>Gym and membership plans</h1>
          <p>Keep the workspace details and membership options accurate.</p>
        </div>
      </div>

      {message && (
        <p
          className={status === "error" ? "form-feedback error" : "form-feedback"}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="settings-grid">
        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Gym</span>
              <h2>Workspace details</h2>
            </div>
          </div>

          <form className="module-form" onSubmit={saveGym}>
            <label>
              Gym name
              <input
                name="name"
                value={gymForm.name}
                onChange={updateGymField}
                required
                disabled={!canEdit}
              />
            </label>

            <label>
              Timezone
              <select
                name="timezone"
                value={gymForm.timezone}
                onChange={updateGymField}
                disabled={!canEdit}
              >
                <option value="Asia/Kolkata">India Standard Time</option>
                <option value="UTC">UTC</option>
              </select>
            </label>

            <label>
              Currency
              <select
                name="currency"
                value={gymForm.currency}
                onChange={updateGymField}
                disabled={!canEdit}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </label>

            <button
              className="button button-primary"
              type="submit"
              disabled={!canEdit || status === "saving"}
            >
              Save settings
            </button>
          </form>
        </section>

        <section className="app-panel">
          <div className="app-panel-heading">
            <div>
              <span className="eyebrow">Memberships</span>
              <h2>Plans</h2>
            </div>
          </div>

          <div className="plan-list">
            {plans.map((plan) => (
              <article className="plan-row" key={plan.id}>
                <div>
                  <strong>{plan.name}</strong>
                  <span>
                    {plan.duration_days} days ·{" "}
                    {formatMoney(plan.price, gym?.currency || "INR")}
                  </span>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => togglePlan(plan)}
                  disabled={!canEdit}
                >
                  {plan.active ? "Deactivate" : "Activate"}
                </button>
              </article>
            ))}
          </div>

          <form className="module-form settings-plan-form" onSubmit={addPlan}>
            <label>
              Plan name
              <input
                name="name"
                value={planForm.name}
                onChange={updatePlanField}
                required
                disabled={!canEdit}
              />
            </label>

            <div className="form-grid-two">
              <label>
                Duration in days
                <input
                  name="durationDays"
                  type="number"
                  min="1"
                  max="3650"
                  value={planForm.durationDays}
                  onChange={updatePlanField}
                  required
                  disabled={!canEdit}
                />
              </label>

              <label>
                Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={planForm.price}
                  onChange={updatePlanField}
                  required
                  disabled={!canEdit}
                />
              </label>
            </div>

            <button
              className="button button-secondary"
              type="submit"
              disabled={!canEdit || status === "saving"}
            >
              Add membership plan
            </button>
          </form>
        </section>
      </div>
    </PageTransition>
  );
}
