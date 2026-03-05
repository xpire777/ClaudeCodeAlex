import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - CABN",
};

export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/"
        className="mb-12 inline-block text-sm tracking-wide text-taupe transition-colors hover:text-dark"
      >
        &larr; Back to home
      </Link>

      <h1 className="mb-8 text-3xl font-bold tracking-[0.12em] text-dark">
        Privacy Policy
      </h1>
      <p className="mb-6 text-sm text-taupe">Last updated: March 3, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-dark/80">
        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">1. Introduction</h2>
          <p>
            CABN (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website cabn.io. This
            Privacy Policy explains how we collect, use, and protect your
            information when you visit our website and join our waitlist.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            2. Information We Collect
          </h2>
          <p>
            We collect only the information you voluntarily provide to us. When
            you join our waitlist, we collect your <strong>email address</strong>.
            We do not collect any other personal information, payment details, or
            sensitive data at this time.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            3. How We Use Your Information
          </h2>
          <p>We use your email address solely to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-dark/70">
            <li>Notify you when CABN launches</li>
            <li>Send occasional updates about our progress</li>
            <li>Provide early access or promotional offers related to CABN</li>
          </ul>
          <p className="mt-2">
            We will never sell, rent, or share your email address with third
            parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            4. Data Storage and Security
          </h2>
          <p>
            Your email address is stored securely using Supabase, a trusted
            cloud database provider. We implement appropriate technical measures
            to protect your data against unauthorized access, alteration, or
            destruction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            5. Cookies and Tracking
          </h2>
          <p>
            Our website does not use cookies or third-party tracking tools at
            this time. We may implement analytics in the future, and this policy
            will be updated accordingly.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-dark/70">
            <li>Request access to the data we hold about you</li>
            <li>Request deletion of your email from our waitlist</li>
            <li>Opt out of future communications at any time</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please contact us at the email
            below.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            7. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or want to request
            removal from our waitlist, please contact us at{" "}
            <a
              href="mailto:hello@cabn.io"
              className="text-burgundy underline"
            >
              hello@cabn.io
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
