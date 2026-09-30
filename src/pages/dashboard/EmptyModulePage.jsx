import PageTransition from "../../components/motion/PageTransition.jsx";

export default function EmptyModulePage({
  title,
  description,
  actionLabel,
}) {
  return (
    <PageTransition>
      <div className="app-page-heading">
        <div>
          <span className="eyebrow">IronCore OS</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <button className="button button-primary" type="button" disabled>
          {actionLabel}
        </button>
      </div>

      <section className="app-panel">
        <div className="empty-state large">
          <strong>{title} is ready for its data layer.</strong>
          <p>
            The UI shell is in place. The next build step connects this module
            to the dedicated IronCore OS Supabase project.
          </p>
        </div>
      </section>
    </PageTransition>
  );
}
