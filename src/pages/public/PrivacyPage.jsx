import PageTransition from "../../components/motion/PageTransition.jsx";

export default function PrivacyPage() {
  return (
    <PageTransition className="page-section legal-page">
      <article className="container narrow-container">
        <span className="eyebrow">Privacy Policy</span>
        <h1 className="page-title">How IronCore OS handles information.</h1>
        <p className="legal-date">Draft last updated: September 30, 2026</p>

        <h2>Information we process</h2>
        <p>
          IronCore OS is designed to store account information and gym
          operational records such as member details, membership dates, and
          payment records entered by authorized gym users.
        </p>

        <h2>Why we process it</h2>
        <p>
          Information is processed to provide account access, operate the
          member management features, maintain payment and renewal records, and
          support the service.
        </p>

        <h2>Service providers</h2>
        <p>
          The product is planned to use infrastructure and authentication
          providers such as Supabase and hosting providers such as Vercel.
          Their final production configuration and applicable terms must be
          reviewed before public launch.
        </p>

        <h2>Security</h2>
        <p>
          The application is being designed with tenant separation and database
          row level security. Production security checks must be completed
          before the service is described as launch-ready.
        </p>

        <h2>Retention and deletion</h2>
        <p>
          Retention periods and account deletion procedures will be finalized
          before public launch and documented here.
        </p>

        <h2>Contact</h2>
        <p>
          A production privacy contact address must be added before public
          launch.
        </p>

        <p className="legal-note">
          This is a product draft, not legal advice. It requires review for the
          jurisdictions where IronCore OS will operate.
        </p>
      </article>
    </PageTransition>
  );
}
