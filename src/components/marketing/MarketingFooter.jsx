import { withWordMotion } from "../motion/CursorFeedback.jsx";
import { Link } from "react-router-dom";

export default function MarketingFooter() {
  return withWordMotion(
    <footer className="marketing-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand-lockup footer-brand">
            <span className="brand-mark" aria-hidden="true">I</span>
            <span>
              <strong>IronCore OS</strong>
              <small>Gym operations</small>
            </span>
          </div>
          <p>Member, payment, and renewal management for independent gyms.</p>
        </div>

        <div className="footer-links" aria-label="Support and legal links">
          <a href="mailto:ashokudu.14@gmail.com">Support</a>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms and Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
