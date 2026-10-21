import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import CoreSculpture from "../../components/three/CoreSculpture.jsx";
import DimensionalIcon from "../../components/three/DimensionalIcon.jsx";
import ProductStage from "../../components/three/ProductStage.jsx";
import Reveal from "../../components/motion/Reveal.jsx";
import SpotlightCard from "../../components/ui/SpotlightCard.jsx";
import Icon from "../../components/ui/Icon.jsx";
const features = [
  [
    "members",
    "Member records",
    "Know the person. Keep the details.",
    "Contact details, membership status, and plan dates, together in one organized directory.",
  ],
  [
    "payments",
    "Payment tracking",
    "Every payment, accounted for.",
    "Record collections and keep payment history attached to the right member.",
  ],
  [
    "renewals",
    "Renewal workspace",
    "Stay ahead of the expiry date.",
    "See who’s due in the next seven days. Follow up and renew without losing the thread.",
  ],
  [
    "grid",
    "Gym overview",
    "Start the day with a clear picture.",
    "Active members, monthly collections, and upcoming renewals. Your real records, in focus.",
  ],
];
export default function HomePage() {
  const hero = useRef(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { duration: 0.6, ease: "power3.out", clearProps: "all" },
          })
          .from(".hero-eyebrow", { y: 12, opacity: 0 })
          .from(".hero-line", { y: 22, opacity: 0, stagger: 0.07 }, 0.08)
          .from(
            ".hero-description, .hero-actions, .hero-footnote",
            { y: 12, opacity: 0, stagger: 0.06 },
            0.3,
          )
          .from(".hero-art", { y: 20, opacity: 0 }, 0.36);
      });
      return () => media.revert();
    },
    { scope: hero },
  );
  return (
    <div className="dimensional-home">
      <section className="hero-section dimensional-hero" ref={hero}>
        <div className="hero-atmosphere" aria-hidden="true">
          <div className="hero-grid-lines" />
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              <span className="accent-dash" /> A stronger dimension of gym
              management
            </span>
            <h1>
              <span className="hero-line">Manage your gym members,</span>
              <span className="hero-line">payments, and renewals</span>
              <span className="hero-line">in one place.</span>
            </h1>
            <p className="hero-description">
              Built for the way you move.
              <br />
              One focused workspace for every side of your gym.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/signup">
                Build your workspace <Icon name="arrow" />
              </Link>
              <a className="button button-secondary" href="#product-preview">
                Explore the product <Icon name="chevron" size={16} />
              </a>
            </div>
            <p className="hero-footnote">
              <Icon name="shield" size={14} /> Members. Payments. Renewals. One
              clear routine.
            </p>
          </div>
          <div className="hero-art">
            <div className="sculpture-stage">
              <div className="sculpture-coordinate" aria-hidden="true">
                <span>IC / CORE SYSTEM</span>
                <span>01 — IN CONTROL</span>
              </div>
              <CoreSculpture />
              <div className="floating-module float-members" aria-hidden="true">
                <span className="floating-module-icon">
                  <Icon name="members" />
                </span>
                <div>
                  <small>PEOPLE, CONNECTED</small>
                  <strong>Every member matters.</strong>
                </div>
                <span className="floating-check">
                  <Icon name="check" size={12} />
                </span>
              </div>
              <div
                className="floating-module float-collection"
                aria-hidden="true"
              >
                <Icon name="payments" />
                <div>
                  <small>COLLECTIONS, ORGANIZED</small>
                  <strong>Keep your business moving.</strong>
                </div>
              </div>
              <span
                className="sculpture-crosshair crosshair-top"
                aria-hidden="true"
              >
                +
              </span>
              <span
                className="sculpture-crosshair crosshair-bottom"
                aria-hidden="true"
              >
                +
              </span>
            </div>
            <div className="sculpture-legend" aria-hidden="true">
              <span>
                <i /> PRECISION IN EVERY DETAIL
              </span>
              <span>DESIGNED FOR MOMENTUM ↗</span>
            </div>
          </div>
        </div>
      </section>
      <div className="product-strip">
        <div className="container">
          {[
            ["members", "Member management"],
            ["payments", "Payment records"],
            ["renewals", "Renewal tracking"],
            ["shield", "Gym-scoped access"],
          ].map(([icon, text]) => (
            <span key={text}>
              <Icon name={icon} size={17} />
              {text}
            </span>
          ))}
        </div>
      </div>
      <section
        className="section product-dimension-section"
        id="product-preview"
        aria-labelledby="workspace-heading"
      >
        <div className="container">
          <Reveal className="product-dimension-heading">
            <div>
              <span className="eyebrow">The bigger picture</span>
              <h2 id="workspace-heading">
                Clarity.
                <br />
                <span className="muted-heading">From every angle.</span>
              </h2>
            </div>
            <p>
              A space for the people, payments, and plans that keep your gym
              moving. Everything connected. Nothing lost in the noise.
            </p>
          </Reveal>
          <ProductStage />
        </div>
      </section>
      <section className="section" aria-labelledby="product-heading">
        <div className="container">
          <Reveal className="section-heading">
            <span className="eyebrow">Built for the everyday</span>
            <h2 id="product-heading">
              Less admin.
              <br />
              <span className="muted-heading">More forward motion.</span>
            </h2>
            <p>
              The essentials to run your member business, without another
              complicated system to manage.
            </p>
          </Reveal>
          <div className="bento-grid">
            {features.map(([icon, label, title, text], index) => (
              <Reveal key={label} delay={(index % 2) * 0.05}>
                <SpotlightCard className="bento-card">
                  <div className="feature-topline">
                    <DimensionalIcon type={icon} />
                    <span className="feature-index">
                      0{index + 1} / {label}
                    </span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <div className="feature-detail" aria-hidden="true">
                    {index === 0 ? (
                      <>
                        <span className="mini-avatar">IC</span>
                        <div>
                          <strong>Every member matters</strong>
                          <small>Details · Plans · Membership status</small>
                        </div>
                      </>
                    ) : index === 1 ? (
                      <>
                        <Icon name="check" />
                        <span>Collections, clearly recorded.</span>
                      </>
                    ) : index === 2 ? (
                      <>
                        <Icon name="calendar" />
                        <span>Your next 7 days, in view.</span>
                      </>
                    ) : (
                      <>
                        <Icon name="activity" />
                        <span>Actual records. Useful perspective.</span>
                      </>
                    )}
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section
        className="section process-section"
        id="workflow"
        aria-labelledby="process-heading"
      >
        <div className="container process-grid">
          <Reveal>
            <span className="eyebrow">A better daily routine</span>
            <h2 id="process-heading">
              Set up.
              <br />
              Show up.
              <br />
              <span className="muted-heading">Stay on track.</span>
            </h2>
            <p>From your first plan to your next renewal.</p>
            <Link to="/signup" className="text-button inline-link">
              Create your workspace <Icon name="arrow" />
            </Link>
          </Reveal>
          <div className="process-list">
            {[
              [
                "Define your plans",
                "Set the prices and membership periods you actually offer.",
              ],
              [
                "Bring your members together",
                "Add contact details and assign the right membership plan.",
              ],
              [
                "Record what comes in",
                "Keep a clear history of payments against each member.",
              ],
              [
                "Make follow-up a habit",
                "Review upcoming expiries and renew memberships in one place.",
              ],
            ].map(([title, text], index) => (
              <Reveal className="process-item" key={title}>
                <span>0{index + 1}</span>
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
        <div className="container final-cta dimensional-cta">
          <Reveal>
            <span className="eyebrow">Your gym. Your momentum.</span>
            <h2>
              Strong gyms run
              <br />
              on clear routines.
            </h2>
            <p>Give your member operations a workspace that keeps up.</p>
            <Link className="button button-primary" to="/signup">
              Get started with IronCore <Icon name="arrow" />
            </Link>
          </Reveal>
          <div className="cta-dimensional-mark" aria-hidden="true">
            <div className="iron-emblem">
              <span />
              <span />
              <span />
            </div>
            <span className="cta-orbit" />
          </div>
        </div>
      </section>
    </div>
  );
}
