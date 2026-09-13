import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Cynova handles personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what information Cynova handles, why it is used, and the choices available to you."
    >
      <section>
        <h2>Information you provide</h2>
        <p>
          Cynova may process account details such as your name and email
          address, plus the quests, notes, preferences, and progress information
          you choose to enter.
        </p>
      </section>
      <section>
        <h2>Current prototype behavior</h2>
        <p>
          This repository uses a mock service. Game data is held in the running
          application and is not production-grade account storage. Reloading or
          restarting the application may reset it.
        </p>
      </section>
      <section>
        <h2>How information is used</h2>
        <p>
          Information is used to provide account flows, display your quests and
          progress, maintain preferences, secure the service, diagnose faults,
          and improve accessibility and reliability.
        </p>
      </section>
      <section>
        <h2>Hosting and service providers</h2>
        <p>
          When Cynova is deployed, hosting and infrastructure providers may
          process technical information such as IP address, device details,
          request times, and error logs. Their access is limited to operating
          and protecting the service.
        </p>
      </section>
      <section>
        <h2>Sharing and sale</h2>
        <p>
          Cynova does not sell personal information. Information may be shared
          with service providers acting on the operator&apos;s instructions,
          when required by law, or to protect users and the service.
        </p>
      </section>
      <section>
        <h2>Retention and security</h2>
        <p>
          Information should be kept only as long as needed for the purposes
          above or as required by law. Reasonable safeguards are used, but no
          internet service can guarantee absolute security.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You may ask to access, correct, export, or delete personal information
          where applicable. You can also enable reduced motion and high contrast
          in settings.
        </p>
      </section>
      <section>
        <h2>Children</h2>
        <p>
          Cynova is not directed to children below the minimum age required to
          consent to online services in their location.
        </p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>
          Material changes will be reflected by updating this page and its
          revision date.
        </p>
      </section>
    </LegalPage>
  );
}
