import Link from "next/link";

export const metadata = {
  title: "The DesignOps Book | DesignOps.dev",
  description:
    "A visual field guide to building calmer, clearer operating systems for growing companies.",
};

const chapters = [
  {
    kicker: "Operating thesis",
    title: "Start with the work people already do.",
    body:
      "The strongest systems begin by observing the real rhythm of a team: the handoffs, notes, delays, approvals, and quiet exceptions that never make it into a clean process diagram.",
    image: "/images/book/section-observe.svg",
    tags: ["Discovery", "Workflow", "Context"],
  },
  {
    kicker: "Design layer",
    title: "Turn messy activity into a clear interface.",
    body:
      "A good operating surface makes the next action obvious. It reduces ambiguity, separates signal from noise, and gives every role the exact amount of context needed to move.",
    image: "/images/book/section-interface.svg",
    tags: ["Screens", "Roles", "Decisions"],
  },
  {
    kicker: "System layer",
    title: "Make proof a byproduct of execution.",
    body:
      "When operations are structured well, reporting stops being a monthly reconstruction. Every transaction, task, and approval leaves behind the evidence a business needs to be trusted.",
    image: "/images/book/section-proof.svg",
    tags: ["Records", "Audit", "Trust"],
  },
  {
    kicker: "Growth layer",
    title: "Let better operations unlock better capital.",
    body:
      "Reliable systems create reliable visibility. With clean books, traceable decisions, and measurable performance, a growing company can ask for capital from a position of proof.",
    image: "/images/book/section-capital.svg",
    tags: ["Credit", "Scale", "Confidence"],
  },
];

const principles = [
  "Observe before designing",
  "Remove avoidable choices",
  "Structure the trail",
  "Keep the system legible",
  "Let the work compound",
];

export default function BookPage() {
  return (
    <main className="book-shell">
      <header className="book-rail">
        <div className="container book-rail__inner">
          <Link href="/" className="book-rail__brand">
            DesignOps.dev
          </Link>
          <nav className="book-rail__links" aria-label="Book navigation">
            <a href="#chapters">Chapters</a>
            <a href="#principles">Principles</a>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="book-hero">
        <div className="container book-hero__grid">
          <div className="book-hero__copy">
            <p className="book-eyebrow">Field book / 2026 edition</p>
            <h1>The DesignOps book for operating companies.</h1>
            <p>
              A visual guide to designing the systems that help businesses run
              cleaner, prove more, and grow with confidence.
            </p>
            <div className="book-hero__actions">
              <a href="#chapters" className="book-button book-button--solid">
                Read the chapters
              </a>
              <Link href="/business/syncabi" className="book-button">
                See the platform
              </Link>
            </div>
          </div>
          <figure className="book-hero__visual">
            <img
              src="/images/book/hero-system-map.svg"
              alt="Layered operating system map with workflows, records, and capital signals"
            />
          </figure>
        </div>
      </section>

      <section className="book-story">
        <div className="container book-story__grid">
          <div>
            <p className="book-eyebrow">Why this exists</p>
            <h2>Most businesses do not fail from lack of effort.</h2>
          </div>
          <div className="book-story__body">
            <p>
              They struggle because the work is scattered across messages,
              notebooks, spreadsheets, memory, and late-night follow-up. DesignOps
              is the discipline of making that work visible, usable, and
              repeatable.
            </p>
            <p>
              This book treats operations as a design material: something you can
              observe, shape, test, and improve until the business itself becomes
              easier to trust.
            </p>
          </div>
          <figure className="book-story__visual">
            <img
              src="/images/book/story-workbench.svg"
              alt="Editorial workbench showing notes becoming structured workflows"
            />
          </figure>
        </div>
      </section>

      <section className="book-chapters" id="chapters">
        <div className="container">
          <div className="book-section-head">
            <p className="book-eyebrow">Chapters</p>
            <h2>Each section has a job: observe, clarify, prove, and grow.</h2>
          </div>
          <div className="book-chapters__list">
            {chapters.map((chapter, index) => (
              <article className="book-chapter" key={chapter.title}>
                <div className="book-chapter__main">
                  <p className="book-chapter__kicker">{chapter.kicker}</p>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.body}</p>
                </div>
                <figure className="book-chapter__visual">
                  <img src={chapter.image} alt={`${chapter.title} illustration`} />
                </figure>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="book-principles" id="principles">
        <div className="container book-principles__grid">
          <div>
            <p className="book-eyebrow">Principles</p>
            <h2>Calm systems are built from practical rules.</h2>
          </div>
          <ol className="book-principles__list">
            {principles.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ol>
          <figure className="book-principles__visual">
            <img
              src="/images/book/principles-stack.svg"
              alt="Five stacked principles connected by a thin red operating line"
            />
          </figure>
        </div>
      </section>

      <footer className="book-footer">
        <div className="container book-footer__grid">
          <div>
            <p className="book-eyebrow">Portal ready</p>
            <h2>Use the book as a working map.</h2>
          </div>
          <div>
            <p>
              The sections are intentionally visual and scannable so you can read
              it like a field guide, review it with a team, or use it to frame a
              client conversation.
            </p>
            <Link href="/contact" className="book-button book-button--solid">
              Start a conversation
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
