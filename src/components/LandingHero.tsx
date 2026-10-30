"use client";

import React, { useState } from "react";
import { Search, ArrowRight, Sparkles, Check, Globe } from "lucide-react";
import { parseGithubUrl } from "@/lib/github";

interface LandingHeroProps {
  onStart: (initialQuery?: string) => void;
  onAnalyzeRepo: (repoUrl: string) => void;
  onExplorePreset: (presetId: string) => void;
}

const QUICK_HERO_REPOS = [
  { label: "Stripe Payment Sample", url: "https://github.com/stripe-samples/accept-a-payment" },
  { label: "Firebase Quickstart", url: "https://github.com/firebase/quickstart-js" },
  { label: "OpenAI Node Quickstart", url: "https://github.com/openai/openai-quickstart-node" },
  { label: "GitHub Octokit SDK", url: "https://github.com/octokit/octokit.js" },
];

export function LandingHero({ onStart, onAnalyzeRepo, onExplorePreset }: LandingHeroProps) {
  const [repoInput, setRepoInput] = useState("https://github.com/stripe-samples/accept-a-payment");

  const parsedRepo = parseGithubUrl(repoInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onAnalyzeRepo(repoInput.trim());
    } else {
      onStart();
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 sm:py-20 overflow-hidden">
      {/* Background Soft Ambient Light */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sky-100/40 via-amber-100/30 to-purple-100/40 blur-3xl opacity-70" />
      </div>

      {/* Outer Grid Container for Center Text & Sticky Notes */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Floating Sticky Note 1: Top-Left */}
        <div className="lg:absolute lg:top-4 lg:left-4 mb-6 lg:mb-0 w-full max-w-[280px] sm:max-w-[310px]">
          <div className="relative rounded-[28px] bg-[#dff0fe] p-6 sticky-shadow sticky-shadow-hover -rotate-3 cursor-pointer border border-[#cbe5fd]">
            <div className="inline-block rounded-full bg-[#c0e4fe] px-3 py-1 text-[11px] font-bold tracking-wider text-[#1d528d] uppercase mb-4">
              STRATEGY
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-1.5 font-sans">
              Deterministic First
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-4">
              Regex & language AST pattern matching for Stripe, Firebase & OpenAI.
            </p>

            {/* Handwritten doodle squiggle */}
            <div className="pt-2 flex items-center justify-between">
              <svg
                className="w-28 h-6 text-[#1d528d]"
                viewBox="0 0 120 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M 4,18 Q 30,4 60,16 T 116,8" />
              </svg>
              <span className="font-handwriting text-lg text-neutral-500 select-none">
                built for speed
              </span>
            </div>
          </div>
        </div>

        {/* Floating Sticky Note 2: Top-Right */}
        <div className="lg:absolute lg:top-8 lg:right-6 mb-6 lg:mb-0 w-full max-w-[280px] sm:max-w-[310px]">
          <div className="relative rounded-[28px] bg-[#ffeedb] p-6 sticky-shadow sticky-shadow-hover rotate-3 cursor-pointer border border-[#fde1c5]">
            <div className="inline-block rounded-full bg-[#fddbc0] px-3 py-1 text-[11px] font-bold tracking-wider text-[#8a4b16] uppercase mb-4">
              LIVE STATS
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-1.5 font-sans">
              Precision Impact
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-neutral-900 font-sans tracking-tight">
                +100%
              </span>
              <span className="rounded-full bg-[#cbf3e5] px-2 py-0.5 text-[11px] font-bold text-[#0e684d]">
                Verified
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              Direct line references grounded in your repository. Zero hallucinations.
            </p>
          </div>
        </div>

        {/* Center Content: Handwritten Headline + Search/Repo Bar + Black Pill CTA */}
        <div className="my-10 lg:my-28 text-center max-w-xl mx-auto flex flex-col items-center z-20">
          {/* Handwritten Whimsical Headline */}
          <h1 className="text-5xl sm:text-7xl font-handwriting text-neutral-900 tracking-tight leading-none mb-6 select-none">
            what's your
            <br />
            repair goal?
          </h1>

          {/* Subtitle instructions */}
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mb-6 font-sans">
            Throw any public GitHub repository URL into the engine below to immediately inspect live code against API changes.
          </p>

          {/* Pill Search / Repo Input Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg relative flex flex-col items-center mb-4"
          >
            <div className="w-full relative flex items-center">
              <div className="absolute left-5 text-neutral-400">
                <Globe className="w-4 h-4 text-neutral-600" />
              </div>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="Paste any public repo (e.g. owner/repo or https://github.com/...)"
                className="w-full rounded-full border border-neutral-300 bg-white/95 py-3.5 pl-12 pr-4 text-xs sm:text-sm font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/15 focus:border-neutral-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition"
              />
            </div>

            {/* Live Indicator Pill */}
            {parsedRepo && (
              <div className="mt-2 text-[11px] font-mono text-neutral-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Target: <strong>{parsedRepo.owner}/{parsedRepo.repo}</strong></span>
              </div>
            )}
          </form>

          {/* Quick-Pick Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8 max-w-lg">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mr-1">
              Quick Pick:
            </span>
            {QUICK_HERO_REPOS.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => setRepoInput(item.url)}
                className="rounded-full bg-white border border-neutral-200 px-2.5 py-1 text-[11px] font-mono text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Signature Action Button */}
          <button
            onClick={() => {
              if (repoInput.trim()) {
                onAnalyzeRepo(repoInput.trim());
              } else {
                onStart();
              }
            }}
            className="group flex items-center gap-3 rounded-full bg-[#111113] px-9 py-4 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 transition active:scale-95"
          >
            <span>Start Your Engine</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white text-xs transition group-hover:translate-x-0.5">
              →
            </div>
          </button>
        </div>

        {/* Floating Sticky Note 3: Bottom-Left */}
        <div className="lg:absolute lg:bottom-4 lg:left-8 mb-6 lg:mb-0 w-full max-w-[280px] sm:max-w-[310px]">
          <div className="relative rounded-[28px] bg-[#daf5e5] p-6 sticky-shadow sticky-shadow-hover rotate-1 cursor-pointer border border-[#c2ecd2]">
            <div className="inline-block rounded-full bg-[#c0edd2] px-3 py-1 text-[11px] font-bold tracking-wider text-[#166542] uppercase mb-4">
              PLATFORM
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-1.5 font-sans">
              Multi-Provider
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-4">
              Stripe, Firebase, OpenAI, and GitHub APIs. Zero unreviewed code pushes.
            </p>

            {/* Provider badges */}
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-900 shadow-sm">
                ST
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-900 shadow-sm border border-amber-200">
                FB
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-900 shadow-sm border border-emerald-200">
                AI
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm">
                GH
              </span>
            </div>
          </div>
        </div>

        {/* Floating Sticky Note 4: Bottom-Right */}
        <div className="lg:absolute lg:bottom-4 lg:right-10 mb-6 lg:mb-0 w-full max-w-[280px] sm:max-w-[310px]">
          <div className="relative rounded-[28px] bg-[#f2e7fe] p-6 sticky-shadow sticky-shadow-hover -rotate-2 cursor-pointer border border-[#e4d1fd]">
            <div className="inline-block rounded-full bg-[#e3cdfe] px-3 py-1 text-[11px] font-bold tracking-wider text-[#6b21a8] uppercase mb-4">
              SYSTEM
            </div>
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-1.5 font-sans">
              Growth Studio
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-3">
              Automated code repair, syntax validation and unified diff downloads.
            </p>
            <div className="text-right">
              <span className="font-handwriting text-lg text-purple-600 select-none">
                fully verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
