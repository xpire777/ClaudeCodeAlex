import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - CABN",
};

export default function Terms() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/"
        className="mb-12 inline-block text-sm tracking-wide text-taupe transition-colors hover:text-dark"
      >
        &larr; Back to home
      </Link>

      <h1 className="mb-8 text-3xl font-bold tracking-[0.12em] text-dark">
        Terms of Service
      </h1>
      <p className="mb-6 text-sm text-taupe">Last updated: March 3, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-dark/80">
        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the CABN website at cabn.io, you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            2. Description of Service
          </h2>
          <p>
            CABN is currently in pre-launch. Our website allows you to join a
            waitlist to be notified when our service becomes available. The full
            CABN platform, when launched, will provide access to curated digital
            persona companions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            3. Waitlist Registration
          </h2>
          <p>
            By submitting your email address to our waitlist, you consent to
            receiving communications from CABN regarding our launch, updates,
            and related information. You may unsubscribe at any time by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            4. Intellectual Property
          </h2>
          <p>
            All content on this website, including text, graphics, logos, images,
            and software, is the property of CABN and is protected by
            applicable intellectual property laws. You may not reproduce,
            distribute, or create derivative works from any content without our
            express written permission.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            5. User Conduct
          </h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-dark/70">
            <li>Use the website for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Submit false or misleading information</li>
            <li>Interfere with the proper functioning of the website</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            6. Disclaimer of Warranties
          </h2>
          <p>
            The website is provided &quot;as is&quot; without warranties of any kind,
            either express or implied. CABN does not guarantee that the website
            will be uninterrupted, error-free, or free of harmful components.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            7. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, CABN shall not be liable for
            any indirect, incidental, special, or consequential damages arising
            from your use of or inability to use the website.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            8. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Service at any time.
            Changes will be effective when posted on this page. Your continued
            use of the website constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">9. Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact
            us at{" "}
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
