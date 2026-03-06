"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { personas, type Persona } from "@/data/personas";

interface Question {
  question: string;
  options: { label: string; tags: string[] }[];
}

const questions: Question[] = [
  {
    question: "What kind of energy do you vibe with most?",
    options: [
      { label: "Warm and easygoing", tags: ["Warm", "Easygoing", "Genuine"] },
      { label: "Bold and confident", tags: ["Bold", "Confident", "Unfiltered"] },
      { label: "Calm and intentional", tags: ["Calm", "Intentional", "Elegant"] },
      { label: "Playful and spontaneous", tags: ["Playful", "Spontaneous", "Adventurous"] },
    ],
  },
  {
    question: "Your ideal way to spend a Saturday?",
    options: [
      { label: "Coffee shop and a good book", tags: ["Thoughtful", "Cozy", "Gentle"] },
      { label: "Something outdoors or active", tags: ["Adventurous", "Driven", "Disciplined"] },
      { label: "Exploring the city, no plan", tags: ["Spontaneous", "Bohemian", "Effortless"] },
      { label: "Staying in, music, candles", tags: ["Dreamy", "Artistic", "Introspective"] },
    ],
  },
  {
    question: "What matters most in a conversation?",
    options: [
      { label: "Depth and real talk", tags: ["Grounding", "Wise", "Nurturing"] },
      { label: "Humor and banter", tags: ["Witty", "Chill", "Low-key"] },
      { label: "Support and encouragement", tags: ["Supportive", "Caring", "Optimistic"] },
      { label: "Passion and intensity", tags: ["Passionate", "Romantic", "Tender"] },
    ],
  },
  {
    question: "Pick a vibe:",
    options: [
      { label: "Golden hour on a rooftop", tags: ["Glamorous", "Aspirational", "Magnetic"] },
      { label: "Late night deep conversation", tags: ["Introspective", "Honest", "Spiritual"] },
      { label: "Laughing until your stomach hurts", tags: ["Bubbly", "Joyful", "Charming"] },
      { label: "Quiet morning, no rush", tags: ["Poised", "Graceful", "Focused"] },
    ],
  },
  {
    question: "What draws you to someone?",
    options: [
      { label: "They feel like home", tags: ["Warm", "Genuine", "Nurturing"] },
      { label: "They challenge me", tags: ["Bold", "Confident", "Sharp"] },
      { label: "They inspire me", tags: ["Creative", "Artistic", "Dreamy"] },
      { label: "They make everything fun", tags: ["Playful", "Bright", "Adventurous"] },
    ],
  },
];

function getMatch(selectedTags: string[]): Persona {
  const tagCounts: Record<string, number> = {};
  for (const tag of selectedTags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }

  let bestMatch = personas[0];
  let bestScore = 0;

  for (const persona of personas) {
    let score = 0;
    for (const vibe of persona.vibeTags) {
      if (tagCounts[vibe]) score += tagCounts[vibe];
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = persona;
    }
  }

  return bestMatch;
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [result, setResult] = useState<Persona | null>(null);
  const router = useRouter();

  function handleSelect(tags: string[]) {
    const newTags = [...selectedTags, ...tags];
    setSelectedTags(newTags);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setResult(getMatch(newTags));
    }
  }

  if (result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-taupe/50">
          Your Match
        </p>
        <div className="relative mb-4 h-48 w-48 overflow-hidden rounded-full ring-2 ring-burgundy/40">
          <Image
            src={result.image}
            alt={result.name}
            fill
            className="object-cover object-[center_20%]"
          />
        </div>
        <h2 className="text-2xl font-bold tracking-wider text-cream">
          {result.name}, {result.age}
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-burgundy">
          {result.archetype}
        </p>
        <p className="mt-2 max-w-sm text-center text-sm text-taupe/60">
          {result.tagline}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/chat/${result.slug}`)}
            className="rounded-full bg-burgundy px-6 py-2.5 text-xs font-bold tracking-wider text-cream transition-opacity hover:opacity-90"
          >
            Start Chatting
          </button>
          <button
            onClick={() => router.push(`/profile/${result.slug}`)}
            className="rounded-full border border-taupe/20 px-6 py-2.5 text-xs font-bold tracking-wider text-taupe transition-colors hover:text-cream"
          >
            View Profile
          </button>
        </div>
        <button
          onClick={() => {
            setCurrent(0);
            setSelectedTags([]);
            setResult(null);
          }}
          className="mt-4 text-[10px] font-bold tracking-wider text-taupe/40 transition-colors hover:text-taupe"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      {/* Progress */}
      <div className="mb-8 flex gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1 w-8 rounded-full transition-colors ${
              i <= current ? "bg-burgundy" : "bg-taupe/15"
            }`}
          />
        ))}
      </div>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-taupe/40">
        Question {current + 1} of {questions.length}
      </p>
      <h2 className="mb-8 max-w-md text-center text-xl font-bold tracking-wider text-cream">
        {q.question}
      </h2>

      <div className="flex w-full max-w-md flex-col gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(opt.tags)}
            className="rounded-xl border border-taupe/15 bg-surface-light px-5 py-4 text-left text-sm font-medium tracking-wider text-cream transition-all hover:border-burgundy/40 hover:bg-surface-lighter"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
