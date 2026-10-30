"use client";

import React, { useState } from "react";
import { CHANGELOG_PRESETS } from "@/lib/presets";
import { parseGithubUrl } from "@/lib/github";
import {
  GitBranch,
  FileCode,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Globe,
} from "lucide-react";

interface ScanFormProps {
  onSubmit: (repoUrl: string, branch: string, changelogText: string) => void;
  isLoading?: boolean;
}

const POPULAR_PUBLIC_REPOS = [
  {
    name: "Stripe Payment Sample",
    repo: "https://github.com/stripe-samples/accept-a-payment",
    branch: "main",
    provider: "Stripe",
    presetId: "stripe-basil-invoices",
  },
  {
    name: "Firebase Auth Quickstart",
    repo: "https://github.com/firebase/quickstart-js",
    branch: "master",
    provider: "Firebase",
    presetId: "firebase-modular-v9",
  },
  {
    name: "OpenAI Node Quickstart",
    repo: "https://github.com/openai/openai-quickstart-node",
    branch: "master",
    provider: "OpenAI",
    presetId: "openai-chat-migration",
  },
  {
    name: "GitHub Octokit SDK",
    repo: "https://github.com/octokit/octokit.js",
    branch: "main",
    provider: "GitHub",
    presetId: "github-query-token-deprecation",
  },
];

export function ScanForm({ onSubmit, isLoading }: ScanFormProps) {
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/stripe-samples/accept-a-payment"
  );
  const [branch, setBranch] = useState("main");
  const [selectedPreset, setSelectedPreset] = useState<string>("stripe-basil-invoices");
  const [changelogText, setChangelogText] = useState(
    CHANGELOG_PRESETS[0].changelogText
  );

  const parsedLiveRepo = parseGithubUrl(repoUrl);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = CHANGELOG_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setChangelogText(preset.changelogText);
      setRepoUrl(preset.recommendedRepoUrl);
    }
  };

  const handleQuickPublicRepoSelect = (
    url: string,
    targetBranch: string,
    presetId: string
  ) => {
    setRepoUrl(url);
    setBranch(targetBranch);
    setSelectedPreset(presetId);
    const preset = CHANGELOG_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setChangelogText(preset.changelogText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() || !changelogText.trim()) return;
    onSubmit(repoUrl.trim(), branch.trim() || "main", changelogText.trim());
  };

  return (
    <div className="rounded-[36px] bg-white border border-neutral-200/90 p-8 sm:p-10 sticky-shadow backdrop-blur-sm max-w-5xl mx-auto">
      {/* Title Header with Handwritten Accent */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <span className="font-handwriting text-2xl text-neutral-500">
            inspection workbench
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 font-sans mt-0.5">
            Connect Repo & API Change
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Inspect any live public GitHub repository or evaluate pre-configured migration scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-600 font-medium bg-[#f4f3ef] px-3.5 py-1.5 rounded-full border border-neutral-200 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-neutral-700" />
            Live GitHub REST API Connected
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quick-Pick Live Public Repositories Row */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-neutral-900" />
              Live Public Repositories (GitHub REST API):
            </label>
            <span className="text-[11px] text-neutral-400 font-mono">
              one-click real inspection
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {POPULAR_PUBLIC_REPOS.map((pop) => {
              const isCurrent = repoUrl.includes(pop.repo.replace("https://github.com/", ""));
              return (
                <button
                  key={pop.repo}
                  type="button"
                  onClick={() =>
                    handleQuickPublicRepoSelect(pop.repo, pop.branch, pop.presetId)
                  }
                  className={`text-left p-3.5 rounded-[20px] border transition active:scale-98 ${
                    isCurrent
                      ? "bg-white border-neutral-900 ring-2 ring-neutral-900 shadow-sm"
                      : "bg-[#f4f3ef] border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-800">
                      {pop.provider}
                    </span>
                    <ExternalLink className="h-3 w-3 text-neutral-400" />
                  </div>
                  <div className="text-xs font-bold text-neutral-900 font-sans line-clamp-1">
                    {pop.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono line-clamp-1 mt-0.5">
                    {pop.repo.replace("https://github.com/", "")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Notes Preset Picker in 3-Color Scheme */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-neutral-900" />
              Pre-configured Sticky Note Scenarios:
            </label>
            <span className="font-handwriting text-base text-neutral-500">
              click any note to populate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHANGELOG_PRESETS.map((preset, idx) => {
              const isSelected = selectedPreset === preset.id;
              const rotation =
                idx === 0
                  ? "-rotate-2"
                  : idx === 1
                  ? "rotate-1"
                  : idx === 2
                  ? "-rotate-1"
                  : "rotate-2";

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`flex flex-col text-left p-5 rounded-[24px] border transition duration-300 sticky-shadow-hover ${rotation} ${
                    isSelected
                      ? "bg-white border-neutral-900 ring-2 ring-neutral-900 ring-offset-2 scale-[1.02]"
                      : "bg-[#f4f3ef] border-neutral-200/90 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-800">
                      {preset.provider}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-neutral-900" />
                    )}
                  </div>

                  <span className="text-sm font-bold text-neutral-900 line-clamp-1 mb-1 font-sans">
                    {preset.title}
                  </span>
                  <span className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {preset.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Repository Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#f4f3ef] p-5 rounded-[24px] border border-neutral-200/80">
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Public GitHub Repository URL
              </label>
              {parsedLiveRepo && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-700 bg-white border border-neutral-200 px-2.5 py-0.5 rounded-full">
                  <Globe className="h-3 w-3 text-neutral-900" />
                  GitHub: {parsedLiveRepo.owner}/{parsedLiveRepo.repo}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository or owner/repo"
                required
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs sm:text-sm font-mono text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              Enter any real public GitHub repository URL (e.g. <code>stripe-samples/accept-a-payment</code>, <code>openai/openai-quickstart-node</code>, <code>sankalp2515/PatchPilot</code>).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Git Branch
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <GitBranch className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full rounded-2xl border border-neutral-200 bg-white pl-9 pr-4 py-3 text-xs sm:text-sm font-mono text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Auto-detects default branch (main / master)
            </p>
          </div>
        </div>

        {/* API Changelog Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-neutral-900" />
              API Changelog / Migration Guide
            </label>
            <span className="text-[11px] text-neutral-500 font-mono">
              Markdown / Plain Text
            </span>
          </div>
          <textarea
            value={changelogText}
            onChange={(e) => setChangelogText(e.target.value)}
            rows={7}
            required
            placeholder="Paste API changelog, deprecated endpoints, removed parameters, or migration instructions here..."
            className="w-full rounded-3xl border border-neutral-200 bg-[#fafaf8] p-4 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neutral-900" />
            Live GitHub tree indexing, deterministic scanning and verified code repair.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full bg-[#111113] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 transition active:scale-95 disabled:opacity-50"
          >
            <span>Launch Inspection Engine</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
