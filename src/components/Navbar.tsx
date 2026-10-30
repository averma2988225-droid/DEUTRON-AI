"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface NavbarProps {
  onNewScan?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}



export function Navbar({ onNewScan, activeTab, setActiveTab }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#fbfbfa]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab?.("landing")}
          className="text-left group flex items-center transition"
        >
          <span className="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
            PatchPilot<span className="text-black font-extrabold">.</span>
          </span>
        </button>

        {/* Center Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
          <button
            onClick={() => setActiveTab?.("landing")}
            className={`transition hover:text-neutral-900 ${
              activeTab === "landing" ? "text-neutral-900 font-semibold" : ""
            }`}
          >
            Engine
          </button>
          <button
            onClick={() => setActiveTab?.("workspace")}
            className={`transition hover:text-neutral-900 ${
              activeTab === "workspace" ? "text-neutral-900 font-semibold" : ""
            }`}
          >
            Workbench
          </button>
          <button
            onClick={() => setActiveTab?.("architecture")}
            className={`transition hover:text-neutral-900 ${
              activeTab === "architecture" ? "text-neutral-900 font-semibold" : ""
            }`}
          >
            Architecture
          </button>
          <a
            href="https://github.com/averma2988225-droid/DEUTRON-AI.git"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-neutral-900"
          >
            Showcase
          </a>
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewScan}
            className="flex items-center gap-2 rounded-full bg-[#111113] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
          >
            <span>Launch Engine</span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white text-[10px]">
              →
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
