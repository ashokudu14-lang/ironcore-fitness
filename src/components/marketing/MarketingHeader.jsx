import { withWordMotion } from "../motion/CursorFeedback.jsx";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Link, NavLink } from "react-router-dom";

export default function MarketingHeader() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 30 });
  return withWordMotion(
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
          {[["/", "Product"], ["/pricing", "Pricing"]].map(([to, label]) => (
            <NavLink key={to} to={to} end>
              {({ isActive }) => <><span>{label}</span>{isActive && <motion.span className="nav-active-line" layoutId="marketing-nav" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }} />}</>}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="text-button" to="/login">
            Log in
          </Link>
          <Link className="button button-primary" to="/signup">
            Start free <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      {!reduced && <motion.div className="reading-progress" style={{ scaleX: progress }} aria-hidden="true" />}
    </header>
  );
}
