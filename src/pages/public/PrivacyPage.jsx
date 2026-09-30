import PageTransition from "../../components/motion/PageTransition.jsx";

export default function PrivacyPage() {
  return (
    <PageTransition className="page-section legal-page">
      <article className="container narrow-container">
        <span className="eyebrow">Privacy Policy</span>
        <h1 className="page-title">How IronCore OS handles information.</h1>
        <p className="legal-date">Last updated: September 30, 2026</p>

        <h2>Who operates IronCore OS</h2>
        <p>
          IronCore OS is operated independently by Ashok Peddapuram. For
          privacy, support, or legal questions, contact{" "}
          <a href="mailto:ashokudu.14@gmail.com">ashokudu.14@gmail.com</a>.
        </p>

        <h2>Information we process</h2>
        <p>
          IronCore OS processes account information and gym operational records
          entered by authorized users. This may include names, email addresses,
          phone numbers, membership plans, membership dates, payment records,
          notes, and account activity required to operate the service.
        </p>

        <h2>Why we process information</h2>
        <p>
          Information is processed to provide account access, manage gym
          workspaces, maintain member and membership records, record payments,
          show renewal information, secure the service, and provide support.
        </p>

        <h2>Payment information</h2>
        <p>
          The current product records payment entries supplied by gym users. It
          is not designed to store full card numbers or card security codes.
          If online billing or payment processing is added later, this policy
          will be updated to describe the relevant payment provider and data
          handling.
        </p>

        <h2>Service providers</h2>
        <p>
          IronCore OS uses service providers to operate the product. The current
          infrastructure includes Supabase for authentication and database
          services and Vercel for application hosting and delivery. These
          providers process information under their own applicable terms and
          privacy commitments.
        </p>

        <h2>Security</h2>
        <p>
          IronCore OS uses account authentication, tenant separation, and
          database row level security to restrict access to gym data. No online
          service can guarantee absolute security, and users should protect
          their account credentials and devices.
        </p>

        <h2>Data retention</h2>
        <p>
          Operational data is retained while it is needed to provide the
          service, maintain account records, resolve support issues, or meet
          applicable legal obligations. Retention periods may vary by record
          type and customer requirements.
        </p>

        <h2>Your choices</h2>
        <p>
          Users may contact IronCore OS to ask about access, correction, or
          deletion of account information. Requests may require verification
          before changes are made, and some records may need to be retained
          where required for security, legal, or operational reasons.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          This policy may be updated as the product changes. The date at the top
          of this page will be revised when material updates are published.
        </p>

        <h2>Contact</h2>
        <p>
          Email{" "}
          <a href="mailto:ashokudu.14@gmail.com">ashokudu.14@gmail.com</a> for
          privacy, support, or legal questions about IronCore OS.
        </p>
      </article>
    </PageTransition>
  );
}
