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
      <p className="mb-6 text-sm text-taupe">Last updated: March 13, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-dark/80">
        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">1. Introduction</h2>
          <p>
            CABN (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website and application at cabn.io. This
            Privacy Policy explains how we collect, use, store, and protect your
            information when you use our platform, including our AI companion chat service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            2. Information We Collect
          </h2>
          <p>We collect the following types of information:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-dark/70">
            <li><strong>Account information:</strong> Email address, display name, and authentication credentials when you create an account.</li>
            <li><strong>Conversation data:</strong> Messages you send to and receive from AI personas, including text content and any images shared or generated within conversations.</li>
            <li><strong>Usage data:</strong> Information about how you interact with the platform, including which personas you engage with and conversation history.</li>
            <li><strong>Device information:</strong> Browser type, device type, and IP address collected automatically when you access the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            3. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-dark/70">
            <li>Provide and operate the CABN platform and AI companion services</li>
            <li>Maintain conversation context and persona memory to improve your experience</li>
            <li>Generate AI-created images based on conversation context</li>
            <li>Monitor and review conversations for safety, quality assurance, content moderation, and to improve our services</li>
            <li>Enforce our Terms of Service and protect against misuse</li>
            <li>Send service-related communications and updates</li>
          </ul>
          <p className="mt-2">
            We will never sell your personal data or conversation content to third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            4. Conversation Monitoring and Moderation
          </h2>
          <p>
            By using CABN, you acknowledge and agree that your conversations with AI personas
            may be reviewed by CABN team members for the purposes of safety monitoring, content
            moderation, quality assurance, and service improvement. While we take reasonable steps
            to limit access to authorized personnel only, you should not share sensitive personal
            information (such as financial details, passwords, or government IDs) in conversations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            5. AI-Generated Content
          </h2>
          <p>
            CABN uses artificial intelligence to generate text responses and images within conversations.
            All personas are fictional AI characters, not real people. AI-generated images are created
            using third-party AI services and are stored on our platform. You understand that AI-generated
            content may not always be accurate or appropriate.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            6. Data Storage and Security
          </h2>
          <p>
            Your data is stored securely using Supabase, a trusted cloud database provider.
            Images are stored in secure cloud storage. We implement appropriate technical and
            organizational measures to protect your data against unauthorized access, alteration,
            disclosure, or destruction. However, no method of electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            7. Third-Party Services
          </h2>
          <p>We use the following third-party services to operate our platform:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-dark/70">
            <li><strong>Supabase:</strong> Authentication and data storage</li>
            <li><strong>Anthropic (Claude):</strong> AI conversation generation</li>
            <li><strong>fal.ai:</strong> AI image generation</li>
            <li><strong>Vercel:</strong> Application hosting</li>
          </ul>
          <p className="mt-2">
            These services have their own privacy policies and may process your data as described in their respective policies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            8. Cookies and Tracking
          </h2>
          <p>
            We use essential cookies for authentication and session management. We do not
            use third-party advertising or tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">9. Data Retention</h2>
          <p>
            We retain your account information and conversation data for as long as your
            account is active. You may request deletion of your account and associated data
            at any time by contacting us. Upon account deletion, your data will be permanently
            removed within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">10. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-dark/70">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Export your conversation data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            11. Age Requirement
          </h2>
          <p>
            CABN is intended for users aged 18 and older. We do not knowingly collect
            information from anyone under the age of 18. If we learn that we have collected
            data from a minor, we will promptly delete that information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">
            12. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated date. Continued use of the
            platform after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-dark">13. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or want to exercise your
            data rights, please contact us at{" "}
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
