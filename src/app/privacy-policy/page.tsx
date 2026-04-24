import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Atlas Fintech services and trading technology platform.",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:py-14">
        <h1 className="text-3xl font-semibold md:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Effective date: April 20, 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground md:text-base">
          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">1. Overview</h2>
            <p className="mt-2">
              This Privacy Policy explains how Atlas Fintech collects, uses, stores, and protects personal and account-related information
              when you use our website, apps, and trading technology services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">2. Information We Collect</h2>
            <p className="mt-2">We may collect:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Identity and contact details (name, email, organization details).</li>
              <li>Authentication and account metadata.</li>
              <li>Usage logs, device/browser details, and diagnostic data.</li>
              <li>Trading-related settings, strategy preferences, and platform interaction events.</li>
              <li>Support communications and feedback.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">3. How We Use Information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To provide and improve platform features and analytics.</li>
              <li>To maintain account security and detect abuse or fraud.</li>
              <li>To send service updates, alerts, and operational notices.</li>
              <li>To respond to support requests and troubleshoot issues.</li>
              <li>To meet legal and regulatory obligations where required.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">4. Trading Data and Sensitive Context</h2>
            <p className="mt-2">
              We treat trading behavior data with heightened care. Strategy inputs, execution preferences, and performance analytics are
              used primarily to deliver product functionality and risk controls. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">5. Cookies and Similar Technologies</h2>
            <p className="mt-2">
              We may use cookies and local storage for authentication, session continuity, user preferences, and performance monitoring.
              You can control cookies through browser settings, though some features may not function correctly if disabled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">6. Data Sharing</h2>
            <p className="mt-2">We may share information with:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Trusted infrastructure and analytics providers under contractual safeguards.</li>
              <li>Security, legal, or compliance authorities when required by law.</li>
              <li>Professional advisors for audit, legal, and operational compliance needs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">7. Data Retention</h2>
            <p className="mt-2">
              We retain data only as long as needed for service delivery, security, legal obligations, dispute resolution, and legitimate
              business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">8. Security Measures</h2>
            <p className="mt-2">
              We use administrative, technical, and organizational safeguards designed to protect your data. No system is completely
              secure, so you should also maintain strong account security practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">9. Your Rights</h2>
            <p className="mt-2">
              Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, or object to processing of your
              personal data. You may also request a copy of your information where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">10. Children and Minors</h2>
            <p className="mt-2">
              Our services are not intended for children under the legal age required by applicable law in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">11. Policy Updates</h2>
            <p className="mt-2">
              We may update this policy periodically. Material changes will be communicated through our platform or official channels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">12. Contact</h2>
            <p className="mt-2">
              Privacy inquiries: privacy@atlasfintech.example
            </p>
          </section>
        </div>
      </div>
      {/* <FooterSection /> */}
    </>
  )
}
