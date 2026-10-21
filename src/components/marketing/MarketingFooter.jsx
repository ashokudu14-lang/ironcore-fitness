import { Link } from "react-router-dom";
import Icon from "../ui/Icon.jsx";
export default function MarketingFooter() {
  return (
    <footer className="marketing-footer dimensional-footer">
      <div className="container">
        <div className="footer-top">
          <Link className="brand-lockup footer-brand" to="/">
            <span className="brand-mark" aria-hidden="true">
              I
            </span>
            <span>
              <strong>IronCore OS</strong>
              <small>Gym operations</small>
            </span>
          </Link>
          <p>
            Built for independent gyms.
            <br />
            Designed to keep you moving.
          </p>
          <Link className="footer-start" to="/signup">
            Your next chapter starts here <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          IRONCORE<span>OS</span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} IronCore OS</span>
          <nav className="footer-links" aria-label="Support and legal links">
            <a href="mailto:ashokudu.14@gmail.com">Support</a>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms and Conditions</Link>
          </nav>
          <span className="footer-location">
            <i aria-hidden="true" /> Built in India. Built for your gym.
          </span>
        </div>
      </div>
    </footer>
  );
}
