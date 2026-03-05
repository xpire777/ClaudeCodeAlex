"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Overview", href: "/overview" },
  { label: "Discover", href: "/discover" },
  { label: "Chats", href: "/chats" },
  { label: "Saved", href: "/saved" },
];

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="relative flex items-center justify-between border-b border-taupe/10 px-5 py-4">
        {/* Logo - left aligned, text only */}
        <Link href="/overview" className="text-lg font-bold tracking-[0.2em] text-cream">
          CABN
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px]"
          aria-label="Menu"
        >
          <span
            className={`h-[2px] w-5 bg-cream transition-all duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-5 bg-cream transition-all duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[2px] w-5 bg-cream transition-all duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </header>

      {/* Dropdown menu - right aligned under hamburger */}
      {open && (
        <div className="absolute right-5 top-[65px] z-50 rounded-xl border border-taupe/10 bg-surface-light shadow-lg">
          {menuItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-6 py-3 text-right text-sm tracking-wider transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  active
                    ? "font-bold text-cream"
                    : "text-taupe hover:text-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
