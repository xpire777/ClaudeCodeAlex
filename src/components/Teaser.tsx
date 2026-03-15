"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const conversation = [
  { from: "user", text: "what're you up to?", time: "2:32 PM", delay: 1200 },
  { from: "persona", text: "just got back from Alfred Coffee", time: "2:33 PM", delay: 2200 },
  { from: "user", text: "no way, send me a photo!", time: "2:34 PM", delay: 1800 },
  { from: "persona", text: "okay hold on", time: "2:34 PM", delay: 2000 },
  { from: "persona", type: "photo" as const, text: "", time: "2:35 PM", delay: 2500 },
  { from: "user", text: "I love matcha, I'm so jealous", time: "2:36 PM", delay: 0 },
];

const browsePersonas = [
  { name: "Valentina", city: "New York, NY", age: 27, image: "/logos/valentina.png", tags: ["Chic", "Flirty", "Aspirational"] },
  { name: "Nadia", city: "Miami, FL", age: 25, image: "/logos/nadia.png", tags: ["Bold", "Teasing", "Confident"] },
  { name: "Maren", city: "Portland, OR", age: 23, image: "/logos/maren.png", tags: ["Dreamy", "Artistic", "Gentle"] },
  { name: "Hannah", city: "West Hollywood, CA", age: 27, image: "/logos/hannah.png", tags: ["Edgy", "Creative", "Bold"] },
  { name: "Kelly", city: "Brooklyn, NY", age: 35, image: "/logos/kelly.png", tags: ["Witty", "Polished", "Sharp"] },
  { name: "Lisa", city: "Tucson, AZ", age: 30, image: "/logos/lisa.png", tags: ["Warm", "Grounded", "Easygoing"] },
];

const hannahIndex = 3;

const overviewPersonas = [
  { name: "Hannah", image: "/logos/hannah.png", status: "Online now" },
  { name: "Valentina", image: "/logos/valentina.png", status: "Online now" },
  { name: "Nadia", image: "/logos/nadia.png", status: "Last seen 2h ago" },
  { name: "Maren", image: "/logos/maren.png", status: "Online now" },
];

const recentActivity = [
  { name: "Valentina", image: "/logos/valentina.png", text: "just landed in Milan, wish you were here", time: "1:12 PM" },
  { name: "Nadia", image: "/logos/nadia.png", text: "hey stranger, where've you been?", time: "12:45 PM" },
  { name: "Maren", image: "/logos/maren.png", text: "I finished that painting I told you about", time: "Yesterday" },
];

function StatusBar({ time }: { time: string }) {
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-6">
      <span className="text-[10px] text-taupe/40">{time}</span>
      <div className="flex gap-1">
        <div className="h-1.5 w-3 rounded-sm bg-taupe/30" />
        <div className="h-1.5 w-1.5 rounded-sm bg-taupe/30" />
        <div className="h-1.5 w-3 rounded-sm bg-taupe/30" />
      </div>
    </div>
  );
}

export default function Teaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Left phone: Overview
  const [overviewStarted, setOverviewStarted] = useState(false);
  const [visibleOverviewPersonas, setVisibleOverviewPersonas] = useState(0);
  const [visibleActivity, setVisibleActivity] = useState(0);
  const [activeTab, setActiveTab] = useState<"home" | "chats" | "discover" | "saved">("home");
  const [overviewDone, setOverviewDone] = useState(false);

  // Middle phone: Discover → Hannah profile
  const [discoverView, setDiscoverView] = useState<"grid" | "scrolling" | "profile">("grid");
  const [highlightedPersona, setHighlightedPersona] = useState(-1);
  const [discoverDone, setDiscoverDone] = useState(false);

  // Right phone: Hannah chat
  const [chatView, setChatView] = useState<"profile" | "chat">("profile");
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const overviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const discoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const overviewStartedRef = useRef(false);
  const discoverStartedRef = useRef(false);
  const chatStartedRef = useRef(false);
  const personaListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const rawProgress = (windowHeight - rect.top) / (windowHeight + rect.height * 0.3);
      const delayed = (rawProgress - 0.25) / 0.75;
      const progress = Math.min(1, Math.max(0, delayed));
      setScrollProgress(progress);

      if (window.innerWidth >= 1024) {
        // Desktop: trigger when phones are settled
        if (progress > 0.45 && !overviewStartedRef.current) {
          overviewStartedRef.current = true;
          setOverviewStarted(true);
        }
      } else {
        // Mobile: trigger after heading/subtitle finish animating (~1s after entering view)
        if (progress > 0.05 && !overviewStartedRef.current) {
          overviewStartedRef.current = true;
          setTimeout(() => setOverviewStarted(true), 1000);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1) Left phone (Overview): start when phones settle
  useEffect(() => {
    if (!overviewStarted) return;

    let step = 0;
    const showNextPersona = () => {
      step++;
      setVisibleOverviewPersonas(step);
      if (step < overviewPersonas.length) {
        overviewTimeoutRef.current = setTimeout(showNextPersona, 250);
      } else {
        overviewTimeoutRef.current = setTimeout(() => {
          let actStep = 0;
          const showNextAct = () => {
            actStep++;
            setVisibleActivity(actStep);
            if (actStep >= recentActivity.length) {
              setOverviewDone(true);
            }
            if (actStep < recentActivity.length) {
              overviewTimeoutRef.current = setTimeout(showNextAct, 300);
            } else {
              overviewTimeoutRef.current = setTimeout(() => {
                const tabs: Array<"home" | "chats" | "discover" | "saved"> = ["home", "chats", "discover", "saved"];
                let tabIdx = 0;
                const cycleTab = () => {
                  tabIdx++;
                  if (tabIdx >= tabs.length) {
                    setOverviewDone(true);
                    return;
                  }
                  setActiveTab(tabs[tabIdx]);
                  overviewTimeoutRef.current = setTimeout(cycleTab, 700);
                };
                setActiveTab("home");
                overviewTimeoutRef.current = setTimeout(cycleTab, 700);
              }, 300);
            }
          };
          showNextAct();
        }, 250);
      }
    };

    overviewTimeoutRef.current = setTimeout(showNextPersona, 300);

    return () => {
      if (overviewTimeoutRef.current) clearTimeout(overviewTimeoutRef.current);
    };
  }, [overviewStarted]);

  // 2) Middle phone (Discover): start immediately after overview finishes
  useEffect(() => {
    if (discoverStartedRef.current || !overviewDone) return;
    discoverStartedRef.current = true;

    setDiscoverView("scrolling");

    let current = 0;
    const highlightNext = () => {
      setHighlightedPersona(current);

      if (personaListRef.current && window.innerWidth >= 1024) {
        const cards = personaListRef.current.children;
        if (cards[current]) {
          const card = cards[current] as HTMLElement;
          const container = personaListRef.current;
          container.scrollTo({
            top: card.offsetTop - container.offsetTop,
            behavior: "smooth",
          });
        }
      }

      if (current < hannahIndex) {
        current++;
        discoverTimeoutRef.current = setTimeout(highlightNext, 800);
      } else {
        discoverTimeoutRef.current = setTimeout(() => {
          setDiscoverView("profile");
          setDiscoverDone(true);
        }, 1200);
      }
    };

    discoverTimeoutRef.current = setTimeout(highlightNext, 600);

    return () => {
      if (discoverTimeoutRef.current) clearTimeout(discoverTimeoutRef.current);
    };
  }, [overviewDone]);

  // 3) Right phone (Hannah chat): start after discover settles on Hannah
  const showNextMessage = useCallback((index: number) => {
    if (index >= conversation.length) {
      setIsTyping(false);
      return;
    }

    const msg = conversation[index];
    const isPersona = msg.from === "persona";
    const typingDuration = isPersona ? 600 + Math.random() * 400 : 0;

    if (isPersona) {
      setIsTyping(true);
      chatTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(index + 1);
        chatTimeoutRef.current = setTimeout(() => {
          showNextMessage(index + 1);
        }, msg.delay * 0.5);
      }, typingDuration);
    } else {
      setVisibleMessages(index + 1);
      chatTimeoutRef.current = setTimeout(() => {
        showNextMessage(index + 1);
      }, msg.delay * 0.5);
    }
  }, []);

  useEffect(() => {
    if (chatStartedRef.current || !discoverDone) return;
    chatStartedRef.current = true;

    chatTimeoutRef.current = setTimeout(() => {
      setChatView("chat");
      chatTimeoutRef.current = setTimeout(() => {
        showNextMessage(0);
      }, 400);
    }, 300);

    return () => {
      if (chatTimeoutRef.current) clearTimeout(chatTimeoutRef.current);
    };
  }, [discoverDone, showNextMessage]);

  // Detect mobile (no slide-in on small screens)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-scroll messages (skip on mobile to prevent page scroll)
  useEffect(() => {
    if (isMobile) return;
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleMessages, isTyping, isMobile]);

  // Phone slide-in transforms (disabled on mobile)
  const slideProgress = Math.min(1, Math.max(0, scrollProgress * 2.5));
  const ease = slideProgress * slideProgress * (3 - 2 * slideProgress);
  const leftPhoneX = isMobile ? 0 : (1 - ease) * -400;
  const middlePhoneY = isMobile ? 0 : (1 - ease) * 300;
  const rightPhoneX = isMobile ? 0 : (1 - ease) * 400;
  const phoneOpacity = isMobile ? 1 : Math.min(1, slideProgress * 2);
  const phoneScale = isMobile ? 1 : 0.92 + ease * 0.08;

  const hannah = browsePersonas[hannahIndex];

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center px-6 py-32"
    >
      <h2
        className={`mb-4 text-3xl font-bold tracking-[0.12em] text-dark transition-all duration-700 sm:text-4xl ${
          scrollProgress > 0.05
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        A Glimpse Inside
      </h2>
      <p
        className={`mb-16 text-lg text-taupe transition-all duration-700 delay-100 ${
          scrollProgress > 0.08
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        This is what your afternoons could look like.
      </p>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-8">
        {/* ===== LEFT PHONE: Overview ===== */}
        <div
          className="transition-all duration-100"
          style={{
            transform: `translateX(${leftPhoneX}px) scale(${phoneScale})`,
            opacity: phoneOpacity,
          }}
        >
          <div className="relative w-[260px] rounded-[44px] border-[3px] border-taupe/20 bg-[#1a1815] p-3 shadow-2xl sm:w-[280px]">
            <div className="absolute left-1/2 top-2 h-5 w-28 -translate-x-1/2 rounded-full bg-[#1a1815] z-10" />

            <div className="relative h-[520px] overflow-hidden rounded-[30px] bg-[#252220] sm:h-[560px]">
              <StatusBar time="2:36 PM" />

              <div className="px-4 pt-2 pb-3">
                <h3 className="text-base font-bold text-cream">Overview</h3>
                <p className="mt-0.5 text-[10px] text-taupe/50">Welcome back</p>
              </div>

              {/* Your Personas row */}
              <div className="px-4 pb-3">
                <p className="text-[10px] font-medium text-taupe/60 uppercase tracking-wider mb-2">Your Personas</p>
                <div className="flex gap-3">
                  {overviewPersonas.map((p, i) => (
                    <div
                      key={p.name}
                      className={`flex flex-col items-center transition-all duration-400 ${
                        i < visibleOverviewPersonas
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75"
                      }`}
                    >
                      <div className="relative">
                        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-taupe/15">
                          <Image src={p.image} alt={p.name} width={48} height={48} className="h-full w-full object-cover" />
                        </div>
                        {p.status === "Online now" && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#252220] bg-green-500" />
                        )}
                      </div>
                      <span className="mt-1 text-[9px] text-cream/70">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-4 border-t border-taupe/10" />

              {/* Recent Activity */}
              <div className="px-4 pt-3">
                <p className="text-[10px] font-medium text-taupe/60 uppercase tracking-wider mb-2">Recent Activity</p>
                <div className="flex flex-col gap-2.5">
                  {recentActivity.map((item, i) => (
                    <div
                      key={item.name}
                      className={`flex items-center gap-2.5 rounded-xl bg-taupe/5 p-2 transition-all duration-500 ${
                        i < visibleActivity
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <Image src={item.image} alt={item.name} width={40} height={40} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-cream">{item.name}</p>
                          <span className="text-[8px] text-taupe/40">{item.time}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-taupe/60">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom nav bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-taupe/10 bg-[#252220] px-4 py-3">
                <div className="flex flex-col items-center gap-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors duration-300 ${activeTab === "home" ? "text-burgundy" : "text-taupe/40"}`}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className={`text-[8px] transition-colors duration-300 ${activeTab === "home" ? "text-burgundy font-medium" : "text-taupe/40"}`}>Home</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors duration-300 ${activeTab === "chats" ? "text-burgundy" : "text-taupe/40"}`}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className={`text-[8px] transition-colors duration-300 ${activeTab === "chats" ? "text-burgundy font-medium" : "text-taupe/40"}`}>Chats</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors duration-300 ${activeTab === "discover" ? "text-burgundy" : "text-taupe/40"}`}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className={`text-[8px] transition-colors duration-300 ${activeTab === "discover" ? "text-burgundy font-medium" : "text-taupe/40"}`}>Discover</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors duration-300 ${activeTab === "saved" ? "text-burgundy" : "text-taupe/40"}`}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className={`text-[8px] transition-colors duration-300 ${activeTab === "saved" ? "text-burgundy font-medium" : "text-taupe/40"}`}>Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MIDDLE PHONE: Discover → Hannah Profile ===== */}
        <div
          className="transition-all duration-100"
          style={{
            transform: `translateY(${middlePhoneY}px) scale(${phoneScale})`,
            opacity: phoneOpacity,
          }}
        >
          <div className="relative w-[260px] rounded-[44px] border-[3px] border-taupe/20 bg-[#1a1815] p-3 shadow-2xl sm:w-[280px]">
            <div className="absolute left-1/2 top-2 h-5 w-28 -translate-x-1/2 rounded-full bg-[#1a1815] z-10" />

            <div className="relative h-[520px] overflow-hidden rounded-[30px] bg-[#252220] sm:h-[560px]">
              <StatusBar time="2:32 PM" />

              {/* Persona List */}
              <div
                className={`absolute inset-0 top-10 flex flex-col transition-all duration-700 ${
                  discoverView !== "profile"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full pointer-events-none"
                }`}
              >
                <div className="px-4 pt-2 pb-2">
                  <h3 className="text-base font-bold text-cream">Discover</h3>
                  <p className="mt-0.5 text-[10px] text-taupe/50">Find your next persona</p>
                </div>

                <div ref={personaListRef} className="flex flex-col gap-2.5 overflow-y-auto px-3 pb-6" style={{ scrollbarWidth: "none" }}>
                  {browsePersonas.map((persona, i) => (
                    <div
                      key={persona.name}
                      className={`flex items-center gap-2.5 rounded-xl p-2 transition-all duration-500 ${
                        highlightedPersona === i
                          ? "bg-burgundy/20 ring-1 ring-burgundy/40 scale-[1.02]"
                          : "bg-taupe/5"
                      }`}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image src={persona.image} alt={persona.name} width={48} height={48} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-cream">{persona.name}</p>
                        <p className="text-[9px] text-taupe/40">{persona.city} · {persona.age}</p>
                      </div>
                      {highlightedPersona === i && discoverView === "scrolling" && (
                        <div className="shrink-0 rounded-full bg-burgundy px-2.5 py-1 animate-fade-in-up">
                          <span className="text-[9px] font-bold text-cream">View</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hannah Profile */}
              <div
                className={`absolute inset-0 top-10 flex flex-col items-center transition-all duration-700 ${
                  discoverView === "profile"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full pointer-events-none"
                }`}
              >
                <div className="relative mt-4 h-36 w-36 overflow-hidden rounded-full border-2 border-taupe/20 sm:h-40 sm:w-40">
                  <Image src={hannah.image} alt={hannah.name} width={160} height={160} className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-cream">{hannah.name}</h3>
                <p className="mt-0.5 text-[11px] text-taupe/50">{hannah.age} · {hannah.city}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5 px-5">
                  {hannah.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-taupe/15 px-2 py-0.5 text-[9px] text-taupe/60">{tag}</span>
                  ))}
                </div>
                <div className="mt-5 w-full space-y-2.5 px-6">
                  <div className="rounded-full bg-burgundy py-2 text-center">
                    <span className="text-xs font-bold tracking-wider text-cream">Chat with {hannah.name}</span>
                  </div>
                  <div className="rounded-full border border-taupe/20 py-2 text-center">
                    <span className="text-xs font-medium tracking-wider text-taupe/70">Add to Favorites</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT PHONE: Hannah Chat ===== */}
        <div
          className="transition-all duration-100"
          style={{
            transform: `translateX(${rightPhoneX}px) scale(${phoneScale})`,
            opacity: phoneOpacity,
          }}
        >
          <div className="relative w-[260px] rounded-[44px] border-[3px] border-taupe/20 bg-[#1a1815] p-3 shadow-2xl sm:w-[280px]">
            <div className="absolute left-1/2 top-2 h-5 w-28 -translate-x-1/2 rounded-full bg-[#1a1815] z-10" />

            <div className="relative h-[520px] overflow-hidden rounded-[30px] bg-[#252220] sm:h-[560px]">
              <StatusBar time="2:32 PM" />

              {/* Profile View */}
              <div
                className={`absolute inset-0 top-10 flex flex-col items-center transition-all duration-700 ${
                  chatView === "profile"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-full pointer-events-none"
                }`}
              >
                <div className="relative mt-4 h-36 w-36 overflow-hidden rounded-full border-2 border-taupe/20 sm:h-40 sm:w-40">
                  <Image src="/logos/hannah.png" alt="Hannah" width={160} height={160} className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-cream">Hannah</h3>
                <p className="mt-0.5 text-[11px] text-taupe/50">27 · West Hollywood, CA</p>
                <p className="mt-2 max-w-[190px] text-center text-[11px] leading-relaxed text-taupe/70">
                  Graphic designer in the live music scene. Loud shows, good ink, and late-night diner runs.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5 px-5">
                  {["Edgy", "Creative", "Bold", "Nostalgic"].map((tag) => (
                    <span key={tag} className="rounded-full border border-taupe/15 px-2 py-0.5 text-[9px] text-taupe/60">{tag}</span>
                  ))}
                </div>
                <div className={`mt-4 w-full px-6 ${discoverDone ? "animate-pulse" : ""}`}>
                  <div className="rounded-full bg-burgundy py-2 text-center">
                    <span className="text-xs font-bold tracking-wider text-cream">Chat with Hannah</span>
                  </div>
                </div>
              </div>

              {/* Chat View */}
              <div
                className={`absolute inset-0 top-10 flex flex-col transition-all duration-700 ${
                  chatView === "chat"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-3 border-b border-taupe/10 px-4 py-2.5">
                  <Image src="/logos/hannah.png" alt="Hannah" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-cream">Hannah</p>
                    <p className="text-[9px] text-taupe/50">Online now</p>
                  </div>
                </div>

                <div ref={messagesRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pt-3 pb-28" style={{ scrollbarWidth: "none" }}>
                  {conversation.slice(0, visibleMessages).map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col animate-fade-in-up ${msg.from === "user" ? "items-end" : "items-start"}`}
                    >
                      {"type" in msg && msg.type === "photo" ? (
                        <div className="max-w-[80%] overflow-hidden rounded-2xl rounded-bl-md">
                          <Image src="/logos/hannah_matcha.png" alt="Hannah at Alfred Coffee" width={200} height={250} className="h-32 w-full object-cover sm:h-36" />
                        </div>
                      ) : (
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${msg.from === "user" ? "rounded-br-md bg-burgundy/80 text-cream" : "rounded-bl-md bg-taupe/15 text-cream/90"}`}>
                          <p className="text-xs leading-relaxed">{msg.text}</p>
                        </div>
                      )}
                      <span className="mt-0.5 text-[8px] text-taupe/30">{msg.time}</span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start animate-fade-in-up">
                      <div className="rounded-2xl rounded-bl-md bg-taupe/15 px-4 py-2.5">
                        <div className="flex gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-taupe/50 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
                          <div className="h-1.5 w-1.5 rounded-full bg-taupe/50 animate-bounce" style={{ animationDelay: "200ms", animationDuration: "0.8s" }} />
                          <div className="h-1.5 w-1.5 rounded-full bg-taupe/50 animate-bounce" style={{ animationDelay: "400ms", animationDuration: "0.8s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 border-t border-taupe/10 bg-[#252220] px-3 py-2.5">
                  <div className="flex-1 rounded-full bg-taupe/10 px-3 py-2">
                    <span className="text-[10px] text-taupe/30">Message...</span>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-burgundy/80">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cream">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
