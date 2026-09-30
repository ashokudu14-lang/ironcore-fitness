import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { createGymWorkspace } from "../../services/gym.js";

const toSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    gymName: "",
    planName: "Monthly",
    planPrice: "999",
    durationDays: "30",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await createGymWorkspace({
        name: form.gymName.trim(),
        slug: `${toSlug(form.gymName)}-${Date.now().toString().slice(-6)}`,
        planName: form.planName.trim(),
        planPrice: Number(form.planPrice),
        planDurationDays: Number(form.durationDays),
      });

      navigate("/app", { replace: true });
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to create the gym workspace.");
    }
  };

  return (
    <PageTransition className="auth-page">
      <div className="auth-panel onboarding-panel">
        <span className="eyebrow">First setup</span>
        <h1>Set up your gym.</h1>
        <p>
          Create the workspace and the first membership plan. You can change
          these details later.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Gym name
            <input
              name="gymName"
              value={form.gymName}
              onChange={update}
              required
              minLength={2}
              placeholder="IronCore Fitness"
            />
          </label>

          <label>
            First membership plan
            <input
              name="planName"
              value={form.planName}
              onChange={update}
              required
            />
          </label>

          <div className="form-grid-two">
            <label>
              Price
              <input
                name="planPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.planPrice}
                onChange={update}
                required
              />
            </label>

            <label>
              Duration in days
              <input
                name="durationDays"
                type="number"
                min="1"
                max="3650"
                value={form.durationDays}
                onChange={update}
                required
              />
            </label>
          </div>

          {message && (
            <p className="form-feedback error" role="status">
              {message}
            </p>
          )}

          <button
            className="button button-primary"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating workspace..." : "Create gym workspace"}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}
