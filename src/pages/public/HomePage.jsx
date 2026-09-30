import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import DashboardPreview from "../../components/marketing/DashboardPreview.jsx";
import Reveal from "../../components/motion/Reveal.jsx";
import PageTransition from "../../components/motion/PageTransition.jsx";
import { motionTiming } from "../../motion/presets.js";

const heroLines = [
  "Manage your gym members,",
  "payments, and renewals",
  "in one place.",
];

const features = [
  {
    title: "Member records",
    text: "Keep contact details, membership status, and plan dates in one clear record.",
    className: "bento-card bento-card-wide",
  },
  {
    title: "Payment tracking",
    text: "Record what was paid, when it was paid, and which member it belongs to.",
    className: "bento-card",
  },
  {
    title: "Renewal view",
    text: "See memberships that are due soon so follow-up is part of the daily routine.",
    className: "bento-card",
  },
  {
    title: "Real dashboard data",
    text: "The dashboard will show actual membership and revenue data from your gym. No invented counters.",
    className: "bento-card bento-card-wide",
  },
];

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <PageTransition>
      <section className="hero-section">
        <div className="hero-atmosphere" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-grid-lines" />
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Gym management software</span>
            <h1>
              {heroLines.map((line, index) => (
                <motion.span
                  className="hero-line"
                  key={line}
                  initial={reduceMotion ? false : { opacity: 0, y: 32, rotateX: 12 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { ...motionTiming.intro, delay: index * 0.1 }
                  }
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="hero-description"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? undefined
                  : { ...motionTiming.intro, delay: 0.32 }
              }
            >
              IronCore OS gives independent gym owners a clear place to manage
              members, record payments, and keep track of upcoming renewals.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? undefined
                  : { ...motionTiming.intro, delay: 0.42 }
              }
            >
              <Link className="button button-primary" to="/signup">
                Start free <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-secondary" to="/pricing">
                View pricing
              </Link>
            </motion.div>
          </div>

          <Reveal className="hero-preview" delay={0.16}>
            <DashboardPreview />
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="product-heading">
        <div className="container">
          <Reveal className="section-heading">
            <span className="eyebrow">Daily operations</span>
            <h2 id="product-heading">Less admin. Clearer follow-up.</h2>
            <p>
              Start with the work that matters every day: members, money, and
              memberships that are about to expire.
            </p>
          </Reveal>

          <div className="bento-grid">
            {features.map((feature, index) => (
              <Reveal className={feature.className} delay={index * 0.08} interactive key={feature.title}>
                <div className="feature-topline"><span className="feature-index">0{index + 1}</span><span className="feature-arrow" aria-hidden="true">↗</span></div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section process-section" aria-labelledby="process-heading">
        <div className="container process-grid">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 id="process-heading">Set up the gym, then keep the routine simple.</h2>
          </Reveal>

          <div className="process-list">
            {[
              ["01", "Add your plans", "Define the membership plans you actually sell."],
              ["02", "Add members", "Store member details and their current membership period."],
              ["03", "Record payments", "Keep payment history attached to the right member."],
              ["04", "Review renewals", "Work through upcoming expiries from one list."],
            ].map(([number, title, text], index) => (
              <Reveal interactive className="process-item" delay={index * 0.04} key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container final-cta">
          <Reveal>
            <span className="eyebrow">IronCore OS</span>
            <h2>Run the member side of your gym from one workspace.</h2>
            <p>
              The MVP is focused on practical gym operations. More features can
              come after the core workflow is proven with real users.
            </p>
            <Link className="button button-primary" to="/signup">
              Create an account
            </Link>
          </Reveal>
        </div>
      </section>
    </PageTransition>
  );
}
