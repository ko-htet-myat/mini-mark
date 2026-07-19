"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const INK = "#201E19";
const FOREST = "#123D2E";
const GOLD = "#D9A441";

export function ShopsHero({ total }: { total: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/shops?name=${encodeURIComponent(query)}&page=0`);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-28 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide"
          style={{
            borderColor: "#E4DFD1",
            fontFamily: "var(--font-mono)",
            color: FOREST,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: GOLD }}
          />
          MARKETPLACE DIRECTORY
        </span>

        <h1
          className="mt-6 text-5xl sm:text-6xl leading-[1.05]"
          style={{
            fontFamily: "var(--font-display)",
            color: INK,
            fontWeight: 600,
          }}
        >
          Find shops worth
          <br />
          <span style={{ color: FOREST }}>bookmarking.</span>
        </h1>

        <p className="mt-5 text-base" style={{ color: "#5B564C" }}>
          Every storefront on the platform, in one browsable directory.
        </p>

        {/* Search pill — overlaps the hero/section boundary */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 flex max-w-xl items-center gap-2 rounded-full border bg-white p-2 shadow-sm"
          style={{ borderColor: "#E4DFD1" }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shops by name..."
            className="border-0 shadow-none focus-visible:ring-0 h-11 pl-4"
          />
          <Button
            type="submit"
            className="rounded-full h-11 px-6"
            style={{ backgroundColor: INK, color: "#F7F4EC" }}
          >
            Search
          </Button>
        </form>
      </div>

      {/* Signature element: awning-stripe divider */}
      <div
        aria-hidden
        className="h-2 w-full"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, ${FOREST} 0 18px, ${GOLD} 18px 36px)`,
        }}
      />
    </section>
  );
}
