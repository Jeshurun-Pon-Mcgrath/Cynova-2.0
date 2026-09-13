import {
  ArrowRight,
  BookOpen,
  Brain,
  Dumbbell,
  HeartPulse,
  MessageCircle,
  Palette,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { DemoRealmButton } from "@/components/auth/demo-realm-button";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Logo } from "@/components/layout/logo";
import { ActionPreview } from "@/components/motion/action-preview";
import { ProgressionStory } from "@/components/motion/progression-story";
import { Reveal } from "@/components/motion/reveal";
import { SceneShell } from "@/components/three/scene-shell";

const attributes = [
  ["Intellect", Brain],
  ["Strength", Dumbbell],
  ["Vitality", HeartPulse],
  ["Charisma", MessageCircle],
  ["Creativity", Palette],
  ["Discipline", ShieldCheck],
] as const;

const uses = [
  ["Study", BookOpen],
  ["Train", Dumbbell],
  ["Create", Palette],
  ["Recover", HeartPulse],
] as const;

export default function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <MarketingNav />
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A practical life RPG</p>
            <h1 className="display">
              Turn the work you already do into <em>quests you can finish.</em>
            </h1>
            <p>
              Plan a real task, complete it away from the screen, and record the
              progress in one focused place. Cynova makes effort visible without
              pretending the game is the work.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/register">
                Create your first quest <ArrowRight aria-hidden="true" />
              </Link>
              <DemoRealmButton />
            </div>
            <div className="use-row" aria-label="Useful for">
              {uses.map(([label, Icon]) => (
                <span key={label}>
                  <Icon aria-hidden="true" /> {label}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <SceneShell />
            <span className="sr-only">
              A floating crystal Nova Core becomes brighter as quests are
              completed.
            </span>
          </div>
        </section>

        <Reveal>
          <section id="how" className="section">
            <div className="section-head">
              <p className="eyebrow">The daily loop</p>
              <h2>Small actions. Visible momentum.</h2>
              <p>
                Write down one meaningful action, do it in real life, then mark
                it complete. The interface responds only when you act.
              </p>
            </div>
            <div className="card-grid">
              {[
                [
                  "01",
                  "Choose a quest",
                  "Make the next action specific and achievable.",
                ],
                [
                  "02",
                  "Do the real work",
                  "Step away and finish it where life happens.",
                ],
                [
                  "03",
                  "Record the result",
                  "Mark it complete and see your character respond.",
                ],
              ].map(([number, heading, copy]) => (
                <article className="panel feature-card" key={number}>
                  <span className="number">{number}</span>
                  <h3>{heading}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="attributes" className="section">
            <div className="section-head">
              <p className="eyebrow">Build the whole hero</p>
              <h2>Six attributes show where your effort goes.</h2>
              <p>
                Each quest belongs to a clear area of life, so your character
                reflects the work you actually choose to do.
              </p>
            </div>
            <div className="attribute-grid">
              {attributes.map(([name, Icon]) => (
                <article className="panel attribute-card" key={name}>
                  <span className="attribute-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <strong>{name}</strong>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="features" className="section">
            <div className="section-head">
              <p className="eyebrow">Action-driven feedback</p>
              <h2>Try the completion interaction.</h2>
              <p>
                Feedback is brief, tactile, and tied to your input. Nothing
                moves just to compete for attention.
              </p>
            </div>
            <ActionPreview />
          </section>
        </Reveal>

        <ProgressionStory />

        <Reveal>
          <section id="rewards" className="section">
            <div className="section-head">
              <p className="eyebrow">Progress with a purpose</p>
              <h2>The game layer supports the habit.</h2>
            </div>
            <div className="card-grid">
              <article className="panel principle-card">
                <ShieldCheck className="cyan" aria-hidden="true" />
                <h3>Clear before clever</h3>
                <p>
                  Quest status, deadlines, and next actions stay easy to scan.
                </p>
              </article>
              <article className="panel principle-card">
                <Trophy className="cyan" aria-hidden="true" />
                <h3>Rewards follow effort</h3>
                <p>
                  Progress changes after a completed action, never on a timer.
                </p>
              </article>
              <article className="panel principle-card">
                <HeartPulse className="cyan" aria-hidden="true" />
                <h3>Built for real routines</h3>
                <p>
                  Motion is short, optional, and removed when reduced motion is
                  enabled.
                </p>
              </article>
            </div>
          </section>
        </Reveal>

        <section className="section">
          <div className="cta-banner">
            <p className="eyebrow">Start with one real action</p>
            <h2>Write the quest. Do the work. Record the win.</h2>
            <Link className="button button-primary" href="/register">
              Create your first quest
            </Link>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <Logo />
          <p>© 2026 Cynova. Built for real-world momentum.</p>
          <nav className="footer-links" aria-label="Legal and account">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
