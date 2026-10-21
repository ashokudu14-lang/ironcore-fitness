import { lazy, Suspense, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient.js";

import Icon from "../../components/ui/Icon.jsx";
const AuthAtmosphere = lazy(
  () => import("../../components/motion/AuthAtmosphere.jsx"),
);

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const setupRequired = searchParams.get("setup") === "required";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured for this deployment yet.");
      return;
    }

    setStatus("loading");
    setMessage("");

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      if (data.session) {
        navigate("/app", { replace: true });
        return;
      }

      setStatus("success");
      setMessage("Check your email to confirm your account.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    navigate("/app", { replace: true });
  };

  return (
    <PageTransition className="auth-page auth-split">
      <aside className="auth-story">
        <Suspense fallback={null}>
          <AuthAtmosphere />
        </Suspense>
        <Link className="brand-lockup auth-story-brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            I
          </span>
          <span>
            <strong>IronCore OS</strong>
            <small>Gym operations</small>
          </span>
        </Link>
        <div className="auth-story-copy">
          <span className="eyebrow">Built for the everyday</span>
          <h2>
            Build strength.
            <br />
            We’ll help with
            <br />
            <span>the admin.</span>
          </h2>
          <p>
            A focused workspace for the people
            <br />
            who keep independent gyms moving.
          </p>
          <div className="auth-story-features">
            <span>
              <Icon name="members" />
              Members
            </span>
            <span>
              <Icon name="payments" />
              Payments
            </span>
            <span>
              <Icon name="renewals" />
              Renewals
            </span>
          </div>
        </div>
        <span className="auth-story-footer">YOUR GYM. YOUR MOMENTUM.</span>
      </aside>
      <main id="main-content" tabIndex={-1} className="auth-form-side">
        <div className="auth-panel">
          <Link className="brand-lockup auth-brand" to="/">
            <span className="brand-mark" aria-hidden="true">
              I
            </span>
            <span>
              <strong>IronCore OS</strong>
              <small>Gym operations</small>
            </span>
          </Link>

          <div>
            <span className="eyebrow">
              {isSignup ? "Create account" : "Welcome back"}
            </span>
            <h1>
              {isSignup
                ? "Set up your gym workspace."
                : "Log in to IronCore OS."}
            </h1>
            <p>
              {isSignup
                ? "Start with member, payment, and renewal management."
                : "Access your gym operations workspace."}
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="notice notice-warning" role="status">
              Supabase environment variables are not configured yet. The UI is
              ready, but authentication cannot run until a dedicated project is
              connected.
            </div>
          )}

          {setupRequired && isSupabaseConfigured && (
            <div className="notice" role="status">
              Sign in to continue to the protected gym workspace.
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            aria-busy={status === "loading"}
          >
            <fieldset className="form-fields" disabled={status === "loading"}>
              <label>
                Email
                <input
                  type="email"
                  placeholder="you@yourgym.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <span className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="icon-button password-toggle"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <Icon name="eye" />
                  </button>
                </span>
              </label>

              {message && (
                <p
                  className={
                    status === "error" ? "form-feedback error" : "form-feedback"
                  }
                  role={status === "error" ? "alert" : "status"}
                >
                  {message}
                </p>
              )}

              <button
                className="button button-primary"
                type="submit"
                disabled={status === "loading" || !isSupabaseConfigured}
              >
                {status === "loading"
                  ? "Working..."
                  : isSignup
                    ? "Create account"
                    : "Log in"}
              </button>
            </fieldset>
          </form>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Create one"}
            </Link>
          </p>
          <p className="auth-legal">
            By continuing, you agree to our <Link to="/terms">Terms</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </PageTransition>
  );
}
