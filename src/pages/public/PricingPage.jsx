import { Link } from "react-router-dom";
import PageTransition from "../../components/motion/PageTransition.jsx";

export default function PricingPage() {
  return (
    <PageTransition className="page-section">
      <div className="container narrow-container">
        <span className="eyebrow">Pricing</span>
        <h1 className="page-title">Simple pricing for the first version.</h1>
        <p className="page-intro">
          The founding plan is designed for independent gyms testing the core
          member, payment, and renewal workflow.
        </p>

        <article className="pricing-panel">
          <div>
            <span className="eyebrow">Founding plan</span>
            <h2>₹999 <small>/ month</small></h2>
            <p>
              Intended for one gym location during the MVP period. Final
              commercial terms can change before public launch.
            </p>
          </div>

          <ul className="plain-list">
            <li>Member management</li>
            <li>Membership plans and expiry tracking</li>
            <li>Payment history</li>
            <li>Renewal workspace</li>
            <li>Gym owner dashboard</li>
          </ul>

          <Link className="button button-primary" to="/signup">
            Start free
          </Link>
        </article>
      </div>
    </PageTransition>
  );
}
