import PageTransition from "../../components/motion/PageTransition.jsx";

export default function TermsPage() {
  return (
    <PageTransition className="page-section legal-page">
      <article className="container narrow-container">
        <span className="eyebrow">Terms and Conditions</span>
        <h1 className="page-title">Terms for using IronCore OS.</h1>
        <p className="legal-date">Draft last updated: September 30, 2026</p>

        <h2>Service</h2>
        <p>
          IronCore OS is intended to help gym operators manage member records,
          membership periods, payments, and renewals.
        </p>

        <h2>Accounts</h2>
        <p>
          Users are responsible for keeping their account access secure and for
          ensuring that information entered into the service is accurate and
          lawful to process.
        </p>

        <h2>Customer data</h2>
        <p>
          Gym operators remain responsible for the member information they
          enter and for having an appropriate legal basis to collect and use
          that information.
        </p>

        <h2>Payments and subscriptions</h2>
        <p>
          Billing terms, cancellation rules, taxes, refund terms, and payment
          provider details will be finalized before paid public access begins.
        </p>

        <h2>Availability</h2>
        <p>
          During the MVP period, features may change as the product is tested.
          Any production availability commitments must be documented
          separately.
        </p>

        <h2>Contact</h2>
        <p>
          A production legal contact address must be added before public
          launch.
        </p>

        <p className="legal-note">
          This is a product draft, not legal advice. It requires legal review
          before paid public launch.
        </p>
      </article>
    </PageTransition>
  );
}
