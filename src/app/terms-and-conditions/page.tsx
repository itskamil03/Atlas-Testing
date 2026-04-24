import FooterSection from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Atlas Fintech products, tools, and trading-related services.",
}

export default function TermsAndConditionsPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:py-14">
        <h1 className="text-3xl font-semibold md:text-4xl">Terms & Conditions</h1>
        <p className="mt-4 text-sm text-muted-foreground">Effective date: April 20, 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-muted-foreground md:text-base">
          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using Atlas Fintech websites, applications, tools, signals, dashboards, and related services, you agree
              to these Terms & Conditions. If you do not agree, you must stop using the services immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">2. Service Scope</h2>
            <p className="mt-2">
              Atlas Fintech provides technology-driven trading tools, analytics, automation workflows, educational materials, and market
              information. We do not provide personalized financial, tax, legal, or investment advice unless explicitly stated in a
              separate written agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">3. Trading Risk and User Responsibility</h2>
            <p className="mt-2">
              Trading in forex, crypto, indices, and derivatives involves substantial risk, including possible loss of capital.
              Performance shown on the platform, in examples, or in backtests is not a guarantee of future results.
            </p>
            <p className="mt-2">
              You are solely responsible for position sizing, leverage, stop-loss use, account security, and final trade execution
              decisions. You must only trade with funds you can afford to lose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">4. Eligibility and Compliance</h2>
            <p className="mt-2">
              You confirm that you are legally allowed to use our services in your jurisdiction and that your use complies with all
              applicable laws, exchange rules, and broker policies. You are responsible for local tax and regulatory obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">5. No Guaranteed Outcomes</h2>
            <p className="mt-2">
              Atlas Fintech does not guarantee profitability, trade frequency, drawdown limits, win rates, or uninterrupted availability
              of any strategy, model, signal, or automation pipeline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">6. Account and Security</h2>
            <p className="mt-2">
              You must maintain accurate account information and keep authentication credentials secure. You are responsible for all
              activity under your account, including actions by authorized users on your team.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">7. Prohibited Use</h2>
            <p className="mt-2">
              You may not misuse the platform, attempt unauthorized access, interfere with infrastructure, reverse engineer restricted
              modules, distribute malicious code, or use services for unlawful market activity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">8. Intellectual Property</h2>
            <p className="mt-2">
              All platform content, code, branding, strategy framework documentation, and analytics formats remain the property of Atlas
              Fintech or its licensors. No ownership rights are transferred to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">9. Suspension and Termination</h2>
            <p className="mt-2">
              We may suspend or terminate access for abuse, policy violations, legal requirements, non-payment, or security risk. We may
              also update, pause, or discontinue features at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">10. Limitation of Liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, Atlas Fintech is not liable for indirect, incidental, consequential, or special
              damages, including trading losses, missed opportunities, service interruptions, or third-party platform failures.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">11. Changes to Terms</h2>
            <p className="mt-2">
              We may revise these terms from time to time. Continued use after updates means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground md:text-xl">12. Contact</h2>
            <p className="mt-2">
              For policy questions, contact: support@atlasfintech.example
            </p>
          </section>
        </div>
      </div>
      {/* <FooterSection /> */}
    </>
  )
}
