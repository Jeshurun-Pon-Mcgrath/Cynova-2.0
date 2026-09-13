import Link from "next/link";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/layout/marketing-nav";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const legalEmail = process.env.NEXT_PUBLIC_LEGAL_EMAIL;

  return (
    <>
      <MarketingNav />
      <main id="main" className="legal-shell">
        <article className="legal-shell-inner">
          <Link href="/" className="text-link">
            Back to Cynova
          </Link>
          <p className="eyebrow">Legal</p>
          <h1 className="display">{title}</h1>
          <p className="legal-intro">{intro}</p>
          <p className="legal-updated">Last updated: 13 September 2026</p>
          <div className="legal-content">{children}</div>
          <section>
            <h2>Contact</h2>
            {legalEmail ? (
              <p>
                Email <a href={`mailto:${legalEmail}`}>{legalEmail}</a> for
                privacy or legal questions.
              </p>
            ) : (
              <p>
                The operator contact address will be published before public
                launch.
              </p>
            )}
          </section>
        </article>
      </main>
    </>
  );
}
