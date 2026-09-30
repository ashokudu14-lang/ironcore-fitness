import { Link, NavLink } from "react-router-dom";

export default function MarketingHeader() {
  return (
    <header className="marketing-header">
      <div className="container header-inner">
        <Link className="brand-lockup" to="/" aria-label="IronCore OS home">
          <span className="brand-mark" aria-hidden="true">I</span>
          <span>
            <strong>IronCore OS</strong>
            <small>Gym operations</small>
          </span>
        </Link>

        <nav className="marketing-nav" aria-label="Primary navigation">
          <NavLink to="/">Product</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
        </nav>

        <div className="header-actions">
          <Link className="text-button" to="/login">
            Log in
          </Link>
          <Link className="button button-primary" to="/signup">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
