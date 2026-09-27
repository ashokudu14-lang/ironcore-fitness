import { useEffect, useRef, useState } from "react";
import "./index.css";

const githubUrl =
  "https://github.com/ashokudu14-lang/ironcore-fitness";

const programs = [
  {
    number: "01",
    title: "Strength Training",
    text: "Build serious strength and muscle with structured programs designed around your goals.",
  },
  {
    number: "02",
    title: "Fat Loss",
    text: "Train smarter, move better, and build sustainable habits without crash diets.",
  },
  {
    number: "03",
    title: "Personal Training",
    text: "One-on-one coaching, personalized programming, and accountability every step of the way.",
  },
  {
    number: "04",
    title: "Group Classes",
    text: "High-energy sessions built to keep you consistent, challenged, and connected.",
  },
];

const benefits = [
  "Expert coaches",
  "Premium equipment",
  "Personalized programs",
  "Flexible training hours",
];

const testimonials = [
  {
    quote:
      "I stopped guessing in the gym. My coach gave me a clear plan and the results followed.",
    name: "Rahul M.",
    role: "Member · 8 months",
  },
  {
    quote:
      "The atmosphere is serious without being intimidating. I actually look forward to training now.",
    name: "Sneha K.",
    role: "Member · 1 year",
  },
  {
    quote:
      "The biggest difference was accountability. I became consistent and finally saw progress.",
    name: "Arjun P.",
    role: "Member · 6 months",
  },
];

function App() {
  const target = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const current = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const frame = useRef(null);

  const [cursor, setCursor] = useState({
    x: -200,
    y: -200,
    tiltX: 0,
    tiltY: 0,
    pageX: 0,
    pageY: 0,
  });

  const [interactive, setInteractive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    goal: "",
  });

  const [formStatus, setFormStatus] = useState("idle");

  /*
   * ======================================================
   * CURSOR + PARALLAX
   * ======================================================
   */

  useEffect(() => {
    const move = (event) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
    };

    const animate = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;

      current.current.x += dx * 0.12;
      current.current.y += dy * 0.12;

      const tiltY = Math.max(-7, Math.min(7, dx * 0.035));
      const tiltX = Math.max(-7, Math.min(7, dy * -0.035));

      const normalizedX =
        current.current.x / Math.max(window.innerWidth, 1);

      const normalizedY =
        current.current.y / Math.max(window.innerHeight, 1);

      const pageX = (normalizedX - 0.5) * 18;
      const pageY = (normalizedY - 0.5) * 14;

      setCursor({
        x: current.current.x,
        y: current.current.y,
        tiltX,
        tiltY,
        pageX,
        pageY,
      });

      frame.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    frame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);

      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, []);

  /*
   * ======================================================
   * INTERACTIVE ELEMENTS
   * ======================================================
   */

  useEffect(() => {
    const elements = document.querySelectorAll(
      "a, button, input, select, textarea"
    );

    const enter = () => setInteractive(true);
    const leave = () => setInteractive(false);

    elements.forEach((element) => {
      element.addEventListener("mouseenter", enter);
      element.addEventListener("mouseleave", leave);
    });

    return () => {
      elements.forEach((element) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      });
    };
  }, [formStatus, menuOpen]);

  /*
   * ======================================================
   * SCROLL REVEAL
   * ======================================================
   */

  useEffect(() => {
    const revealElements = document.querySelectorAll(
      "[data-reveal]"
    );

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          observerInstance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * ======================================================
   * MOBILE NAVIGATION
   * ======================================================
   */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /*
   * ======================================================
   * FORM
   * ======================================================
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formStatus !== "idle") {
      setFormStatus("idle");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { name, phone, email, goal } = formData;

    if (!name.trim() || !phone.trim() || !email.trim() || !goal) {
      setFormStatus("error");
      return;
    }

    console.log("Demo enquiry submitted:", {
      name,
      phone,
      email,
      goal,
    });

    setFormStatus("success");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      goal: "",
    });

    setFormStatus("idle");
  };

  const size = interactive ? 145 : 125;

  return (
    <div className="site">

      {/* CURSOR ELEVATION */}

      <div
        className={`cursor-elevation ${
          interactive ? "cursor-elevation-active" : ""
        }`}
        style={{
          left: `${cursor.x}px`,
          top: `${cursor.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          "--tilt-x": `${cursor.tiltX}deg`,
          "--tilt-y": `${cursor.tiltY}deg`,
        }}
      />

      {/* AMBIENT LIGHT */}

      <div
        className="ambient-glow"
        style={{
          left: `${cursor.x}px`,
          top: `${cursor.y}px`,
        }}
      />

      {/* BACKGROUND MOTION */}

      <div
        className="parallax-background"
        style={{
          "--parallax-x": `${cursor.pageX}px`,
          "--parallax-y": `${cursor.pageY}px`,
        }}
      >
        <div className="parallax-orb parallax-orb-one" />
        <div className="parallax-orb parallax-orb-two" />
        <div className="parallax-ring parallax-ring-one" />
        <div className="parallax-ring parallax-ring-two" />
      </div>

      {/* NAVBAR */}

      <header className="navbar">
        <div className="container nav-inner">

          <a
            href="#home"
            className="brand"
            onClick={closeMenu}
          >
            <span className="brand-mark">I</span>

            <span>
              <strong>IRONCORE</strong>
              <small>FITNESS STUDIO</small>
            </span>
          </a>

          <nav
            className={`nav-links ${
              menuOpen
                ? "nav-links-mobile-open"
                : ""
            }`}
            aria-label="Main navigation"
          >
            <a
              href="#case-study"
              onClick={closeMenu}
            >
              Case Study
            </a>

            <a
              href="#programs"
              onClick={closeMenu}
            >
              Programs
            </a>

            <a
              href="#why-us"
              onClick={closeMenu}
            >
              Why Us
            </a>

            <a
              href="#membership"
              onClick={closeMenu}
            >
              Membership
            </a>

            <a
              href="#contact"
              onClick={closeMenu}
            >
              Contact
            </a>
          </nav>

          <div className="nav-actions">

            <a
              href={githubUrl}
              className="nav-cta"
              target="_blank"
              rel="noreferrer"
            >
              View Source
            </a>

            <button
              type="button"
              className={`mobile-menu-button ${
                menuOpen
                  ? "mobile-menu-button-open"
                  : ""
              }`}
              aria-label={
                menuOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={menuOpen}
              onClick={() =>
                setMenuOpen((value) => !value)
              }
            >
              <span />
              <span />
            </button>

          </div>

        </div>
      </header>

      <main>

        {/* HERO */}

        <section
          className="hero"
          id="home"
        >
          <div
            className="hero-image"
            style={{
              "--image-x": `${cursor.pageX * -0.45}px`,
              "--image-y": `${cursor.pageY * -0.35}px`,
            }}
          />

          <div className="hero-overlay" />
          <div className="hero-vignette" />

          <div
            className="hero-content container"
            data-reveal="fade-up"
          >
            <div className="hero-copy">

              <p className="eyebrow">
                <span className="eyebrow-line" />
                PREMIUM TRAINING · HYDERABAD
              </p>

              <h1>
                BUILD A
                <span>STRONGER</span>
                VERSION OF YOU.
              </h1>

              <p className="hero-description">
                Personalized training, expert coaching, and a community that
                keeps you accountable.
              </p>

              <div className="hero-actions">
                <a
                  href="#contact"
                  className="button button-primary"
                >
                  Book Your Free Trial <span>↗</span>
                </a>

                <a
                  href="#programs"
                  className="button button-secondary"
                >
                  Explore Programs
                </a>
              </div>

              <div className="hero-trust">
                <div>
                  <strong>7 DAYS</strong>
                  <span>FREE TRIAL</span>
                </div>

                <div>
                  <strong>5★</strong>
                  <span>MEMBER RATING</span>
                </div>

                <div>
                  <strong>500+</strong>
                  <span>MEMBERS</span>
                </div>
              </div>

            </div>
          </div>

          <div className="hero-scroll">
            <span>SCROLL TO EXPLORE</span>
            <span className="scroll-line" />
          </div>
        </section>

        {/* PORTFOLIO CASE STUDY */}

        <section
          className="portfolio-case-study section"
          id="case-study"
        >
          <div className="container">
            <div
              className="portfolio-case-study-header"
              data-reveal="fade-up"
            >
              <div>
                <p className="section-label">
                  PROJECT SPOTLIGHT / CLIENT-READY DEMO
                </p>

                <h2>
                  IRONCORE <em>FITNESS.</em>
                </h2>
              </div>

              <p className="portfolio-case-study-intro">
                A premium business website concept built to show potential
                clients what a modern, conversion-focused local business site
                can look and feel like.
              </p>
            </div>

            <div className="portfolio-project-grid">
              <article className="portfolio-project-card" data-reveal="fade-up">
                <span>01 / PURPOSE</span>
                <h3>Turn attention into enquiries.</h3>
                <p>
                  Clear messaging, service highlights, social proof, pricing,
                  strong calls to action, and a focused enquiry flow.
                </p>
              </article>

              <article
                className="portfolio-project-card"
                data-reveal="fade-up"
                data-reveal-delay="100"
              >
                <span>02 / BUILD</span>
                <h3>Modern frontend, responsive by default.</h3>
                <p>
                  React + Vite, responsive layouts, mobile navigation,
                  motion, hover states, and accessible form controls.
                </p>
              </article>

              <article
                className="portfolio-project-card"
                data-reveal="fade-up"
                data-reveal-delay="200"
              >
                <span>03 / DELIVERY</span>
                <h3>Ready for a real business.</h3>
                <p>
                  The concept can be adapted for gyms, restaurants, salons,
                  local services, consultants, creators, and other businesses.
                </p>
              </article>
            </div>

            <div
              className="portfolio-project-meta"
              data-reveal="fade-up"
              data-reveal-delay="160"
            >
              <div className="portfolio-tech">
                <span>React</span>
                <span>Vite</span>
                <span>Responsive UI</span>
                <span>Vercel-ready</span>
              </div>

              <div className="portfolio-project-actions">
                <a
                  href={githubUrl}
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  View source on GitHub <span>↗</span>
                </a>

                <a
                  href="#hire"
                  className="button button-primary"
                >
                  Build one like this <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO */}

        <section className="intro section">
          <div className="container intro-grid">

            <div data-reveal="fade-up">
              <p className="section-label">
                01 / THE IRONCORE APPROACH
              </p>

              <h2>
                TRAIN WITH
                <br />
                <em>INTENTION.</em>
              </h2>
            </div>

            <div
              className="intro-copy"
              data-reveal="fade-up"
              data-reveal-delay="120"
            >
              <p className="large-copy">
                No random workouts. No quick fixes. Just intelligent training
                built around your body, your goals, and your lifestyle.
              </p>

              <p>
                IronCore combines expert coaching, proven programming, and a
                focused training environment to help you make progress you can
                actually maintain.
              </p>
            </div>

          </div>
        </section>

        {/* PROGRAMS */}

        <section
          className="programs section"
          id="programs"
        >
          <div className="container">

            <div
              className="section-heading"
              data-reveal="fade-up"
            >
              <div>

                <p className="section-label">
                  02 / OUR PROGRAMS
                </p>

                <h2>
                  TRAIN FOR <em>RESULTS.</em>
                </h2>

              </div>

              <p>
                Whether you're building strength, losing fat, or simply trying
                to become more consistent, we have a program for you.
              </p>

            </div>

            <div className="program-grid">

              {programs.map((program, index) => (

                <article
                  className="program-card"
                  key={program.number}
                  data-reveal="fade-up"
                  data-reveal-delay={index * 100}
                >

                  <span className="program-number">
                    {program.number}
                  </span>

                  <div className="program-arrow">
                    ↗
                  </div>

                  <div className="program-content">
                    <h3>{program.title}</h3>
                    <p>{program.text}</p>
                  </div>

                </article>

              ))}

            </div>

          </div>
        </section>

        {/* WHY US */}

        <section
          className="why-us section"
          id="why-us"
        >
          <div className="container why-grid">

            <div
              className="why-image"
              data-reveal="scale"
            >
              <div
                className="why-image-photo"
                style={{
                  "--image-x": `${cursor.pageX * 0.35}px`,
                  "--image-y": `${cursor.pageY * 0.28}px`,
                }}
              />

              <div className="why-image-overlay" />

              <div className="image-caption">
                <span>IRONCORE / 2026</span>
                <span>HYDERABAD</span>
              </div>
            </div>

            <div
              className="why-content"
              data-reveal="fade-up"
              data-reveal-delay="130"
            >

              <p className="section-label">
                03 / WHY IRONCORE
              </p>

              <h2>
                YOUR GOALS.
                <br />
                OUR <em>EXPERTISE.</em>
              </h2>

              <p className="why-text">
                The hardest part isn't knowing that you should train. It's
                knowing what to do, doing it consistently, and having someone
                who knows when to push you further.
              </p>

              <div className="benefits">

                {benefits.map((benefit, index) => (

                  <div
                    className="benefit"
                    key={benefit}
                    data-reveal="fade-right"
                    data-reveal-delay={index * 80}
                  >
                    <span>0{index + 1}</span>
                    <strong>{benefit}</strong>
                  </div>

                ))}

              </div>

              <a
                href="#contact"
                className="text-link"
              >
                Meet IronCore <span>↗</span>
              </a>

            </div>

          </div>
        </section>

        {/* MEMBERSHIP */}

        <section
          className="membership section"
          id="membership"
        >
          <div className="container">

            <div
              className="membership-top"
              data-reveal="fade-up"
            >

              <div>

                <p className="section-label">
                  04 / MEMBERSHIP
                </p>

                <h2>
                  START YOUR
                  <br />
                  <em>JOURNEY.</em>
                </h2>

              </div>

              <p>
                Experience the studio, meet the coaches, and see why members
                stay for the long run.
              </p>

            </div>

            <div
              className="pricing-card"
              data-reveal="scale"
              data-reveal-delay="120"
            >

              <div className="price-main">
                <span className="price-label">
                  MONTHLY MEMBERSHIP
                </span>

                <div>
                  <span className="currency">
                    ₹
                  </span>

                  <span className="price">
                    2,999
                  </span>

                  <span className="period">
                    / month
                  </span>
                </div>
              </div>

              <div className="price-features">
                <span>✓ Full gym access</span>
                <span>✓ Trainer guidance</span>
                <span>✓ Fitness assessment</span>
                <span>✓ No joining fee</span>
              </div>

              <a
                href="#contact"
                className="button button-primary"
              >
                Book Free Trial <span>↗</span>
              </a>

            </div>

            <p className="pricing-note">
              No contracts. No pressure. Just 7 days to experience IronCore.
            </p>

          </div>
        </section>

        {/* TESTIMONIALS */}

        <section className="testimonials section">
          <div className="container">

            <div
              className="section-heading"
              data-reveal="fade-up"
            >
              <div>

                <p className="section-label">
                  05 / MEMBER STORIES
                </p>

                <h2>
                  BUILT ON
                  <br />
                  <em>CONSISTENCY.</em>
                </h2>

              </div>
            </div>

            <div className="testimonial-grid">

              {testimonials.map((item, index) => (

                <article
                  className="testimonial-card"
                  key={item.name}
                  data-reveal="fade-up"
                  data-reveal-delay={index * 100}
                >

                  <div className="stars">
                    ★★★★★
                  </div>

                  <p>
                    “{item.quote}”
                  </p>

                  <div className="person">

                    <div className="avatar">
                      {item.name.charAt(0)}
                    </div>

                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </div>

                  </div>

                </article>

              ))}

            </div>

          </div>
        </section>

        {/* FINAL CTA */}

        <section className="final-cta section">
          <div
            className="container final-cta-inner"
            data-reveal="fade-up"
          >

            <p className="section-label">
              06 / TAKE THE FIRST STEP
            </p>

            <h2>
              READY TO
              <br />
              <em>GET STRONGER?</em>
            </h2>

            <p>
              Try IronCore for 7 days. No contracts. No pressure. Just show up
              and train.
            </p>

            <a
              href="#contact"
              className="button button-primary"
            >
              Book Your Free Trial <span>↗</span>
            </a>

          </div>
        </section>

        {/* HIRE ME */}

        <section
          className="portfolio-hire section"
          id="hire"
        >
          <div
            className="container portfolio-hire-inner"
            data-reveal="fade-up"
          >
            <p className="section-label">
              07 / WEBSITE SERVICES
            </p>

            <h2>
              NEED A WEBSITE
              <br />
              <em>LIKE THIS?</em>
            </h2>

            <p>
              I build modern, responsive business websites designed to make
              your brand look credible, explain your offer clearly, and turn
              visitors into enquiries.
            </p>

            <div className="portfolio-service-list">
              <span>Business Websites</span>
              <span>Landing Pages</span>
              <span>Local Business Sites</span>
              <span>Portfolio Websites</span>
              <span>Responsive Design</span>
              <span>Deployment</span>
            </div>

            <div className="portfolio-hire-actions">
              <a
                href="#contact"
                className="button button-primary"
              >
                Start a Project <span>↗</span>
              </a>

              <a
                href={githubUrl}
                className="button button-secondary"
                target="_blank"
                rel="noreferrer"
              >
                View GitHub <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* CONTACT */}

        <section
          className="contact section"
          id="contact"
        >
          <div className="container contact-grid">

            <div
              data-reveal="fade-up"
            >

              <p className="section-label">
                08 / PROJECT ENQUIRY
              </p>

              <h2>
                LET'S BUILD YOUR
                <br />
                <em>WEBSITE.</em>
              </h2>

              <div className="contact-details">

                <div>
                  <span>WHAT I BUILD</span>
                  <strong>
                    Business websites · Landing pages
                  </strong>
                </div>

                <div>
                  <span>STACK</span>
                  <strong>
                    React · Vite · Responsive UI
                  </strong>
                </div>

                <div>
                  <span>PROCESS</span>
                  <strong>
                    Design · Develop · Deploy
                  </strong>
                </div>

              </div>

            </div>

            <form
              className="contact-form"
              onSubmit={handleSubmit}
              noValidate
              data-reveal="fade-up"
              data-reveal-delay="120"
            >

              <div className="form-row">

                <label>
                  Your Name

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                  />
                </label>

                <label>
                  Phone

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                  />
                </label>

              </div>

              <label>
                Email

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  autoComplete="email"
                />
              </label>

              <label>
                Your Goal

                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                >

                  <option
                    value=""
                    disabled
                  >
                    Select the type of website
                  </option>

                  <option value="Business website">
                    Business website
                  </option>

                  <option value="Landing page">
                    Landing page
                  </option>

                  <option value="Portfolio website">
                    Portfolio website
                  </option>

                  <option value="Local business website">
                    Local business website
                  </option>

                </select>

              </label>

              {formStatus === "error" && (

                <p className="form-message form-message-error">
                  Please complete every field before submitting.
                </p>

              )}

              {formStatus === "success" && (

                <div className="form-success">

                  <strong>
                    ENQUIRY RECEIVED.
                  </strong>

                  <span>
                    Thanks, {formData.name}. Your project enquiry demo has been
                    captured. Connect this form to your preferred email, form
                    backend, or WhatsApp workflow before publishing.
                  </span>

                  <button
                    type="button"
                    onClick={resetForm}
                  >
                    Submit another enquiry
                  </button>

                </div>

              )}

              {formStatus !== "success" && (

                <button
                  type="submit"
                  className="button button-primary form-button"
                >
                  Send Project Enquiry <span>↗</span>
                </button>

              )}

            </form>

          </div>
        </section>

      </main>

      {/* FOOTER */}

      <footer className="footer">
        <div className="container footer-inner">

          <div className="brand footer-brand">
            <span className="brand-mark">I</span>

            <span>
              <strong>IRONCORE</strong>
              <small>FITNESS STUDIO</small>
            </span>
          </div>

          <p>
            © 2026 IronCore Fitness website concept. Built by Ashok.
          </p>

          <div className="footer-links">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              View GitHub ↗
            </a>

            <a href="#home">
              Back to top ↑
            </a>
          </div>

        </div>
      </footer>

      {/* FLOATING CTA */}

      <a
        className="whatsapp"
        href="#hire"
        aria-label="Need a website like this?"
      >
        Need a Website?
      </a>

    </div>
  );
}

export default App;