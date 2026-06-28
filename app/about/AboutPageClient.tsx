"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import MutaraCapitalNav from "../components/MutaraCapitalNav";

const principles = [
  {
    label: "What we have seen",
    title: "A business needs more than money to grow well.",
    body:
      "Capital matters, but it is not enough. Companies also need structure, strong operations, good people, and clear direction.",
  },
  {
    label: "What we noticed",
    title: "The support is here, but it is not organized.",
    body:
      "Across Rwanda, the talent, capital, and experience already exist. Too often, they remain scattered and fail to reach the businesses that need them most.",
  },
  {
    label: "What we built",
    title: "We are building the ecosystem that connects these parts.",
    body:
    "Syncabi brings capital, operational support, and strategic guidance into one system so more companies can survive, grow, and create value.",
  },
];

const pillars = [
  {
    title: "Our observation",
    text:
      "If we want to change the idea that opportunity only exists abroad, then local companies must have a better chance to succeed.",
  },
  {
    title: "Our response",
    text:
      "We start by organizing what already exists and making it work together in a practical way.",
  },
  {
    title: "For businesses",
    text:
      "We work with existing companies first, helping them improve operations, strengthen structure, and build the foundation for scale.",
  },
  {
    title: "For investors",
    text:
      "As businesses grow stronger, they create jobs, return value to owners and investors, and contribute more to the economy.",
  },
  {
    title: "An invitation",
    text:
      "We are open to entrepreneurs and investors who want to build a stronger private sector in Rwanda together.",
  },
];

const sectionViewport = { once: true, amount: 0.28 } as const;

function MotionCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <article className={className}>{children}</article>;
  }

  return (
    <motion.article
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={sectionViewport}
      transition={{
        duration: 0.62,
        delay,
        ease: [0, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.article>
  );
}

export default function AboutPageClient() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
  });
  const smoothedProgress = useSpring(scrollYProgress, {
    mass: 1,
    stiffness: 100,
    damping: 20,
  });
  const statementScale = useTransform(smoothedProgress, [0.08, 0.32], [0.95, 1]);

  return (
    <>
      <MutaraCapitalNav />

      <main className="about">
        <section className="about__hero">
          <div className="container">
            <motion.div
              className="about__hero-inner about__motion-surface"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.7, ease: "easeOut" }
              }
            >
              <div className="about__eyebrow">About</div>
              <h1 className="about__title">
                It takes a village to raise a child, and an ecosystem to build
                successful companies.
              </h1>
              <p className="about__lead">
                If we want more opportunity in Rwanda, then more local companies
                must have a real chance to succeed.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="about__principles">
          <div className="container">
            <div className="about__principles-grid">
              {principles.map((item, index) => (
                <MotionCard
                  key={item.label}
                  className="about__card about__motion-surface"
                  delay={index * 0.12}
                >
                  <div className="about__card-label">{item.label}</div>
                  <h2 className="about__card-title">{item.title}</h2>
                  <p className="about__card-body">{item.body}</p>
                </MotionCard>
              ))}
            </div>
          </div>
        </section>

        <section className="about__statement">
          <div className="container">
            <motion.div
              className="about__statement-shell about__motion-surface"
              style={reduceMotion ? undefined : { scale: statementScale }}
            >
              <div className="about__statement-label">What guides us</div>
              <p className="about__statement-copy">
                We want to see a private sector in Rwanda that is rooted,
                strong, and able to last.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="about__statement">
          <div className="container">
            <motion.div
              className="about__statement-shell about__motion-surface"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={sectionViewport}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.7, ease: "easeOut" }
              }
            >
              <div className="about__statement-label">What drives us</div>
              <p className="about__statement-copy">
                When companies grow well, they create jobs, build confidence,
                and make local opportunity more real.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="about__pillars">
          <div className="container">
            <motion.div
              className="about__section-head"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={sectionViewport}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.6, ease: "easeOut" }
              }
            >
              <div className="about__section-label">Mission and thesis</div>
              <h2 className="about__section-title">
                Capital works best when the rest of the system is in place.
              </h2>
            </motion.div>

            <div className="about__pillar-grid">
              {pillars.map((pillar, index) => (
                <MotionCard
                  key={pillar.title}
                  className="about__pillar about__motion-surface"
                  delay={index * 0.08}
                >
                  <h3 className="about__pillar-title">{pillar.title}</h3>
                  <p className="about__pillar-text">{pillar.text}</p>
                </MotionCard>
              ))}
            </div>

            <motion.div
              className="about__cta-row"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={sectionViewport}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.6, ease: "easeOut", delay: 0.08 }
              }
            >
              <Link href="/login" className="pill-btn pill-btn--solid">
                Try Syncabi
              </Link>
              <Link
                href="/contact"
                className="pill-btn pill-btn--outline"
              >
                Let&apos;s build together
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
          <div className="footer__logo">Syncabi</div>
              <p className="footer__tagline">
                Helping Rwandan businesses build the operations and financial
                proof that makes them worth investing in.
              </p>
            </div>
            <div className="footer__links">
              <div>
                <div className="footer__col-title">Product</div>
                <ul className="footer__col-list">
                  <li>
                    <Link href="/ventures/manufacturing-operations">Mfg &amp; Operations</Link>
                  </li>
                  <li>
                    <Link href="/ventures/services-consumer-brands">Services &amp; Brands</Link>
                  </li>
                  <li>
                    <Link href="/business/butik">Butik</Link>
                  </li>
                  <li>
                    <Link href="/business/noetic-credit-line">Line of Credit</Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="footer__col-title">Syncabi</div>
                <ul className="footer__col-list">
                  <li>
                    <Link href="/business/syncabi">Overview</Link>
                  </li>
                  <li>
                    <Link href="/business/syncabi#services">Digitize Operations</Link>
                  </li>
                  <li>
                    <Link href="/business/syncabi#services">Automate Processes</Link>
                  </li>
                  <li>
                    <Link href="/business/syncabi#services">Optimize Performance</Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="footer__col-title">Company</div>
                <ul className="footer__col-list">
                  <li>
                    <Link href="/about">About</Link>
                  </li>
                  <li>
                    <a href="#">Careers</a>
                  </li>
                  <li>
                    <a href="#">Press</a>
                  </li>
                  <li>
                    <Link href="/contact">Contact</Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="footer__col-title">Support</div>
                <ul className="footer__col-list">
                  <li>
                    <a href="#">Help centre</a>
                  </li>
                  <li>
                    <a href="#">Legal &amp; terms</a>
                  </li>
                  <li>
                    <a href="#">Privacy</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <span>&copy; 2026 Syncabi. All rights reserved.</span>
            <div className="footer__bottom-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
