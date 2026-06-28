import Link from "next/link";
import { Bebas_Neue, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import styles from "./ExpRwExperience.module.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const services = [
  "Marketing",
  "Event Management",
  "PR & Communications",
  "Branding",
];

const highlights = [
  {
    title: "Launches with pull",
    text: "Campaigns that feel clean, current, and hard to ignore.",
  },
  {
    title: "Events with presence",
    text: "From private rooms to public moments, every detail lands.",
  },
  {
    title: "Stories that travel",
    text: "Sharp messaging, media handling, and brand rhythm in one move.",
  },
];

const featuredWork = [
  "Destination campaigns",
  "Brand launches",
  "Corporate events",
  "Public relations",
];

export default function ExpRwExperience() {
  return (
    <main
      className={`${styles.shell} ${spaceGrotesk.variable} ${bebasNeue.variable} ${ibmPlexMono.variable}`}
    >
      <section className={styles.hero} id="top">
        <div className={styles.backdrop} aria-hidden="true">
          <div className={`${styles.glow} ${styles.glowLeft}`} />
          <div className={`${styles.glow} ${styles.glowRight}`} />
          <div className={styles.grid} />
        </div>

        <header className={styles.topbar}>
          <a
            className={`${styles.topbarLink} ${styles.topbarStrong} ${styles.topbarStart}`}
            href="#work"
          >
            Featured Work <span>[04]</span>
          </a>
          <a
            className={`${styles.topbarLink} ${styles.hideOnTablet}`}
            href="#services"
          >
            Services <span>[04]</span>
          </a>
          <a className={styles.brandMark} href="#top" aria-label="EXP.RW home">
            <svg
              className={styles.brandGlyph}
              viewBox="0 0 52 22"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14.5586 1L24.2694 10.8136L14.5586 21H3.84908L13.5174 10.8136L3.84908 1H14.5586Z"
                fill="#F4ECDA"
              />
              <path
                d="M37.4414 1L47.1522 10.8136L37.4414 21H26.7318L36.4002 10.8136L26.7318 1H37.4414Z"
                fill="#F4ECDA"
              />
            </svg>
          </a>
          <a
            className={`${styles.topbarLink} ${styles.hideOnTablet}`}
            href="#about"
          >
            About
          </a>
          <a
            className={`${styles.topbarLink} ${styles.topbarEnd}`}
            href="#contact"
          >
            Contact
          </a>
        </header>

        <div className={`${styles.meta} ${styles.metaLeft}`}>
          <span className={styles.eyebrow}>Based in Kigali</span>
          <p className={styles.metaCopy}>
            Marketing, events, PR, and brand systems built for memorable
            moments.
          </p>
        </div>

        <div className={`${styles.meta} ${styles.metaRight}`}>
          <span className={styles.eyebrow}>Portfolio company</span>
          <p className={styles.metaCopy}>
                  Integrated into Syncabi without mixing code into the main
            marketing pages.
          </p>
        </div>

        <div className={styles.copy}>
          <p className={styles.kicker}>Experience Rwanda</p>
          <h1 className={styles.title}>EXP.RW</h1>
          <p className={styles.summary}>
            We shape attention for hospitality brands, launches, and events
            that need to be seen clearly.
          </p>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#contact">
              Start a project
            </a>
            <Link
              className={styles.secondaryAction}
              href="/case-studies"
            >
              Back to category
            </Link>
          </div>
        </div>

        <div className={styles.year}>2026</div>

        <div className={styles.bottomRail}>
          <div className={styles.progressLine} aria-hidden="true">
            <span />
          </div>
          <div className={styles.bottomRailCopy}>
            <span>EXP.RW</span>
            <span>Hospitality</span>
            <span>Events</span>
            <span>Brand-led growth</span>
          </div>
        </div>
      </section>

      <section className={styles.contentBlock} id="services">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIndex}>(01)</span>
          <h2>Built for modern visibility.</h2>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article className={styles.serviceCard} key={service}>
              <p className={styles.serviceTitle}>{service}</p>
              <p className={styles.serviceText}>
                Clear strategy, elegant delivery, and less noise.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.contentBlock} ${styles.featureBand}`}
        id="work"
      >
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIndex}>(02)</span>
          <h2>Featured work, framed simply.</h2>
        </div>
        <div className={styles.featureLayout}>
          <div className={styles.featureList}>
            {featuredWork.map((item, index) => (
              <div className={styles.featureRow} key={item}>
                <span>{`${String(index + 1).padStart(2, "0")}`}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className={styles.featurePanel}>
            {highlights.map((item) => (
              <article className={styles.highlightCard} key={item.title}>
                <p className={styles.highlightTitle}>{item.title}</p>
                <p className={styles.highlightText}>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.contentBlock} ${styles.aboutBand}`} id="about">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIndex}>(03)</span>
          <h2>Experience Rwanda, expressed with precision.</h2>
        </div>
        <p className={styles.aboutCopy}>
          EXP.RW connects strategy, storytelling, and execution so brands show
          up with confidence across rooms, screens, and headlines.
        </p>
      </section>

      <section
        className={styles.contentBlock}
        id="contact"
      >
        <div className={styles.sectionHeading}>
          <span className={styles.sectionIndex}>(04)</span>
          <h2>Let&apos;s make the next moment count.</h2>
        </div>
        <div className={styles.contactPanel}>
          <p>For campaigns, launches, partnerships, and event production.</p>
          <a className={styles.contactLink} href="mailto:hello@exp.rw">
            hello@exp.rw
          </a>
        </div>
      </section>
    </main>
  );
}
