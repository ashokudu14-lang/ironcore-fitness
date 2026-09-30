import { withWordMotion } from "../motion/CursorFeedback.jsx";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";

const appLinks = [
  ["/app", "Overview"],
  ["/app/members", "Members"],
  ["/app/payments", "Payments"],
  ["/app/renewals", "Renewals"],
  ["/app/settings", "Settings"],
];

export default function AppShell() {
  const navigate = useNavigate();

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate("/login", { replace: true });
  };

  return withWordMotion(
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink className="brand-lockup app-brand" to="/app">
          <span className="brand-mark" aria-hidden="true">I</span>
          <span>
            <strong>IronCore OS</strong>
            <small>Gym operations</small>
          </span>
        </NavLink>

        <nav className="app-nav" aria-label="Application navigation">
          {appLinks.map(([to, label]) => (
            <NavLink
              end={to === "/app"}
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "app-nav-link active" : "app-nav-link"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="text-button sidebar-signout" type="button" onClick={signOut}>
          Log out
        </button>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <span>Independent gym workspace</span>
          <span className="environment-badge">MVP</span>
        </header>
        <main id="main-content" className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
