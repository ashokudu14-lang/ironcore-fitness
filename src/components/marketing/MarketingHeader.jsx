import { useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import Icon from "../ui/Icon.jsx";
export default function MarketingHeader() {
  const dialog = useRef(null);
  return (
    <header className="marketing-header">
      <div className="container header-inner">
        <Link className="brand-lockup" to="/">
          <span className="brand-mark" aria-hidden="true">
            I
          </span>
          <span>
            <strong>IronCore OS</strong>
            <small>Gym operations</small>
          </span>
        </Link>
        <nav className="marketing-nav" aria-label="Primary navigation">
          <NavLink to="/" end>
            Product
          </NavLink>
          <a href="/#product-preview">The workspace</a>
          <NavLink to="/pricing">Pricing</NavLink>
          <a href="/#workflow">How it works</a>
        </nav>
        <div className="header-actions">
          <Link className="text-button" to="/login">
            Log in
          </Link>
          <Link className="button button-primary button-small" to="/signup">
            Start free <Icon name="arrow" size={16} />
          </Link>
          <button
            className="icon-button marketing-menu"
            aria-label="Open menu"
            onClick={() => dialog.current.showModal()}
          >
            <Icon name="menu" />
          </button>
        </div>
        <dialog
          ref={dialog}
          className="public-menu"
          aria-label="Site navigation"
        >
          <button
            className="icon-button"
            aria-label="Close menu"
            onClick={() => dialog.current.close()}
          >
            <Icon name="close" />
          </button>
          <nav aria-label="Mobile site navigation">
            {[
              ["/", "Product"],
              ["/#product-preview", "The workspace"],
              ["/#workflow", "How it works"],
              ["/pricing", "Pricing"],
              ["/login", "Log in"],
              ["/signup", "Create account"],
            ].map(([to, text]) => (
              <Link key={to} to={to} onClick={() => dialog.current.close()}>
                {text}
                <Icon name="arrow" />
              </Link>
            ))}
          </nav>
        </dialog>
      </div>
    </header>
  );
}
