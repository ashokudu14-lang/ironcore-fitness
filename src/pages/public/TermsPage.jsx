import PageTransition from "../../components/motion/PageTransition.jsx";

export default function TermsPage() {
  return (
    <PageTransition className="page-section legal-page">
      <article className="container narrow-container">
        <span className="eyebrow">Terms and Conditions</span>
        <h1 className="page-title">Terms for using IronCore OS.</h1>
        <p className="legal-date">Last updated: September 30, 2026</p>

        <h2>Operator</h2>
        <p>
          IronCore OS is operated independently by Ashok Peddapuram. Questions
          about these terms may be sent to{" "}
          <a href="mailto:ashokudu.14@gmail.com">ashokudu.14@gmail.com</a>.
        </p>

        <h2>Service</h2>
        <p>
          IronCore OS provides software for gym operators to manage member
          records, membership plans, payments, renewals, and related operational
          information.
        </p>

        <h2>Accounts</h2>
        <p>
          Users are responsible for providing accurate account information,
          keeping login credentials secure, and limiting access to authorized
          people. Activity performed through an account may be treated as
          activity authorized by the account holder unless reported otherwise.
        </p>

        <h2>Customer and member data</h2>
        <p>
          Gym operators are responsible for the information they enter into
          IronCore OS and for having an appropriate legal basis to collect,
          store, and use that information. Users must not upload information
          they are not permitted to process.
        </p>

        <h2>Acceptable use</h2>
        <p>
          Users must not use IronCore OS to break the law, interfere with the
          service, attempt unauthorized access, distribute malicious software,
          or use another customer&apos;s information without permission.
        </p>

        <h2>Payments and subscriptions</h2>
        <p>
          The current MVP may be offered as beta access or under manually
          arranged commercial terms. If online subscription billing is enabled,
          pricing, taxes, cancellation terms, refund rules, and payment provider
          details will be shown before a customer is charged.
        </p>

        <h2>Availability and changes</h2>
        <p>
          Features may change as IronCore OS develops. Reasonable efforts are
          made to keep the service available, but uninterrupted or error-free
          operation is not guaranteed.
        </p>

        <h2>Suspension and termination</h2>
        <p>
          Access may be restricted or terminated when necessary to protect the
          service, address abuse or security risks, comply with legal
          obligations, or respond to material violations of these terms.
        </p>

        <h2>Disclaimers</h2>
        <p>
          IronCore OS is provided as software for gym administration. It does
          not provide legal, accounting, medical, or financial advice. Gym
          operators remain responsible for their business decisions, member
          relationships, and regulatory obligations.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by applicable law, IronCore OS and its
          operator are not liable for indirect, incidental, special, or
          consequential losses arising from use of the service. Any liability
          that cannot legally be excluded remains subject to applicable law.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          These terms may be updated as the service changes. The date at the top
          of this page will be revised when material updates are published.
        </p>

        <h2>Contact</h2>
        <p>
          Email{" "}
          <a href="mailto:ashokudu.14@gmail.com">ashokudu.14@gmail.com</a> for
          support or legal questions about IronCore OS.
        </p>
      </article>
    </PageTransition>
  );
}
