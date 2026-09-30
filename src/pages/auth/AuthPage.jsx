import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageTransition from "../../components/motion/PageTransition.jsx";
import {
  isSupabaseConfigured,
  supabase,
} from "../../lib/supabaseClient.js";

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignup = mode === "signup";
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
    <PageTransition className="auth-page">
      <div className="auth-panel">
        <Link className="brand-lockup auth-brand" to="/">
          <span className="brand-mark" aria-hidden="true">I</span>
          <span>
            <strong>IronCore OS</strong>
            <small>Gym operations</small>
          </span>
        </Link>

        <div>
          <span className="eyebrow">{isSignup ? "Create account" : "Welcome back"}</span>
          <h1>{isSignup ? "Set up your gym workspace." : "Log in to IronCore OS."}</h1>
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

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {message && (
            <p
              className={status === "error" ? "form-feedback error" : "form-feedback"}
              role="status"
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
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </p>
      </div>
    </PageTransition>
  );
}
