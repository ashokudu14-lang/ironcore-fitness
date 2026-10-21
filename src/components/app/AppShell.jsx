import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";
import Icon from "../ui/Icon.jsx";
import useLenis from "../../hooks/useLenis.js";

const appLinks = [
  ["/app", "Overview", "grid"],
  ["/app/members", "Members", "members"],
  ["/app/payments", "Payments", "payments"],
  ["/app/renewals", "Renewals", "renewals"],
  ["/app/settings", "Settings", "settings"],
];
export default function AppShell() {
  useLenis();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dialog = useRef(null);
  const menu = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const current =
    appLinks.find(([path]) => path === pathname)?.[1] || "Workspace";
  useEffect(() => {
    const online = () => setOffline(!navigator.onLine);
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${current} · IronCore OS`;
  }, [pathname, current]);
  const close = () => {
    dialog.current?.close();
    menu.current?.focus();
  };
  async function signOut() {
    if (
      !window.dispatchEvent(
        new Event("ironcore:before-signout", { cancelable: true }),
      )
    )
      return;
    setSigningOut(true);
    setError("");
    const { error: failure } = await supabase.auth.signOut();
    if (failure) {
      window.dispatchEvent(new Event("ironcore:signout-cancelled"));
      setError(failure.message);
      setSigningOut(false);
      return;
    }
    navigate("/login", { replace: true });
  }
  function navigation(mobile = false) {
    return (
      <>
        <NavLink
          className="brand-lockup app-brand"
          aria-label={collapsed && !mobile ? "IronCore OS home" : undefined}
          to="/app"
          onClick={mobile ? close : undefined}
        >
          <span className="brand-mark" aria-hidden="true">
            I
          </span>
          <span className="nav-label">
            <strong>IronCore OS</strong>
            <small>Gym operations</small>
          </span>
        </NavLink>
        <nav
          className="app-nav"
          aria-label={
            mobile ? "Mobile application navigation" : "Application navigation"
          }
        >
          <span className="nav-group-label nav-label">Workspace</span>
          {appLinks.map(([to, label, icon]) => (
            <NavLink
              end={to === "/app"}
              key={to}
              to={to}
              title={collapsed && !mobile ? label : undefined}
              aria-label={collapsed && !mobile ? label : undefined}
              onClick={mobile ? close : undefined}
              className={({ isActive }) =>
                `app-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon name={icon} />
              <span className="nav-label">{label}</span>
              {label === "Renewals" && (
                <span className="nav-label nav-hint" aria-hidden="true">
                  7d
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note nav-label">
            <Icon name="shield" />
            <span>
              Your gym. Your workspace.<small>Members, money, momentum.</small>
            </span>
          </div>
          <button
            className="sidebar-account"
            type="button"
            disabled={signingOut}
            onClick={signOut}
            aria-label={collapsed && !mobile ? "Log out" : undefined}
          >
            <span className="account-avatar" aria-hidden="true">
              IC
            </span>
            <span className="nav-label">
              <strong>Gym workspace</strong>
              <small>{signingOut ? "Signing out…" : "Log out"}</small>
            </span>
            <Icon name="logout" />
          </button>
          {error && (
            <p className="form-feedback error" role="alert">
              {error}
            </p>
          )}
        </div>
      </>
    );
  }
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="app-sidebar" data-lenis-prevent>
        {navigation()}
      </aside>
      <dialog
        className="nav-drawer"
        ref={dialog}
        aria-label="Workspace navigation"
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
      >
        <button
          className="icon-button drawer-close"
          aria-label="Close navigation"
          onClick={close}
        >
          <Icon name="close" />
        </button>
        {navigation(true)}
      </dialog>
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-location">
            <button
              ref={menu}
              className="icon-button mobile-menu"
              type="button"
              aria-label="Open navigation"
              aria-haspopup="dialog"
              onClick={() => dialog.current.showModal()}
            >
              <Icon name="menu" />
            </button>
            <button
              className="icon-button sidebar-toggle"
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            >
              <Icon name="menu" />
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{current}</strong>
          </div>
          <NavLink className="topbar-action" to="/app/members">
            <Icon name="plus" size={16} /> Add member
          </NavLink>
        </header>
        {offline && (
          <div className="offline-notice" role="status">
            <Icon name="alert" />
            You’re offline. Reconnect before saving changes.
          </div>
        )}
        <main id="main-content" tabIndex={-1} className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
