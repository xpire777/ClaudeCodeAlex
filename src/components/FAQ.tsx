"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    question: "What is CABN?",
    answer:
      "CABN is a digital persona companion platform. We offer a curated collection of personas that you can chat with, receive photos from, and build a real connection with. Think of it as having someone who is always there and always willing to lend an ear.",
  },
  {
    question: "Who is CABN for?",
    answer:
      "CABN is for everyone. Whether you're looking for companionship, conversation, or just someone to share your day with, our personas are designed for both men and women.",
  },
  {
    question: "How does it work?",
    answer:
      "Once CABN launches, you'll pick a persona that matches your vibe. From there, you can message them anytime, request photos, and build an ongoing connection. Your persona remembers your conversations and grows with you over time.",
  },
  {
    question: "Is CABN free?",
    answer:
      "CABN will offer a subscription plan that includes access to your chosen persona. Pricing details will be announced at launch. Join the waitlist to get early access and special offers.",
  },
  {
    question: "When does CABN launch?",
    answer:
      "We're launching soon. Join the waitlist at the top of this page to be the first to know when we go live.",
  },
  {
    question: "Are the personas real people?",
    answer:
      "No. All CABN personas are AI-powered digital companions. They are not real people, but they are designed to feel natural and engaging so you can build a meaningful connection with them.",
  },
  {
    question: "Can I switch personas?",
    answer:
      "Yes. While you'll start with one persona, you'll be able to explore others and add more to your experience over time.",
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center bg-dark px-6 py-24"
    >
      <h2
        className={`mb-12 text-2xl font-bold tracking-[0.12em] text-cream transition-all duration-700 sm:text-3xl ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Frequently Asked Questions
      </h2>

      <div className="w-full max-w-2xl">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`border-b border-taupe/15 transition-all duration-700 ${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: `${100 + i * 80}ms` }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left"
            >
              <span className="text-sm font-bold tracking-wide text-cream sm:text-base">
                {faq.question}
              </span>
              <span
                className={`ml-4 text-lg text-taupe transition-transform duration-300 ${
                  openIndex === i ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === i ? "max-h-48 pb-5" : "max-h-0"
              }`}
            >
              <p className="text-sm leading-relaxed text-taupe">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
