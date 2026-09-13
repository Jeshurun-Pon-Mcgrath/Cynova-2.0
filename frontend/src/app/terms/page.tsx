import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms governing use of Cynova.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      intro="These terms govern access to and use of Cynova. By using the service, you agree to them."
    >
      <section>
        <h2>The service</h2>
        <p>
          Cynova is a life-planning game that helps users organize real-world
          tasks and reflect progress. It is not medical, financial, legal, or
          professional advice.
        </p>
      </section>
      <section>
        <h2>Prototype status</h2>
        <p>
          The current build uses mock authentication and in-memory data. It is
          provided for evaluation and must not be treated as secure or durable
          production storage.
        </p>
      </section>
      <section>
        <h2>Your account</h2>
        <p>
          You are responsible for accurate account information, safeguarding
          your credentials, and activity performed through your account. Notify
          the operator promptly if you suspect unauthorized use.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not misuse the service, interfere with its operation, attempt
          unauthorized access, upload unlawful material, infringe another
          person&apos;s rights, or use Cynova to harm others.
        </p>
      </section>
      <section>
        <h2>Your content</h2>
        <p>
          You retain ownership of content you enter. You grant the operator the
          limited rights needed to host, process, and display that content
          solely to provide and protect the service.
        </p>
      </section>
      <section>
        <h2>Intellectual property</h2>
        <p>
          Cynova&apos;s software, interface, branding, and original content are
          protected by applicable intellectual property laws. These terms do not
          transfer ownership to you.
        </p>
      </section>
      <section>
        <h2>Availability and changes</h2>
        <p>
          The service may change, pause, or end. Features may be added or
          removed, and reasonable notice will be given when a change materially
          affects users where practicable.
        </p>
      </section>
      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          To the extent permitted by law, the service is provided as available
          without warranties that cannot lawfully be excluded. Liability is
          limited only to the extent permitted by applicable law.
        </p>
      </section>
      <section>
        <h2>Suspension and termination</h2>
        <p>
          Access may be suspended or terminated for serious or repeated
          violations, security risks, legal requirements, or discontinuation of
          the service.
        </p>
      </section>
      <section>
        <h2>Applicable law</h2>
        <p>
          These terms are governed by the laws that apply to the Cynova operator
          and the user, including any mandatory consumer protections that cannot
          be waived.
        </p>
      </section>
      <section>
        <h2>Changes to these terms</h2>
        <p>
          Material changes will be posted here with an updated revision date.
          Continued use after a change takes effect constitutes acceptance where
          permitted by law.
        </p>
      </section>
    </LegalPage>
  );
}
