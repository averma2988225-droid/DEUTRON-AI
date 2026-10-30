"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LandingHero } from "@/components/LandingHero";
import { ScanForm } from "@/components/ScanForm";
import { ScanProgress } from "@/components/ScanProgress";
import { ImpactReport } from "@/components/ImpactReport";
import { ScanReport } from "@/types";
import { CHANGELOG_PRESETS } from "@/lib/presets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Poll scan status when currentScanId is set
  useEffect(() => {
    if (!currentScanId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/${currentScanId}`);
        if (!res.ok) return;

        const data: ScanReport = await res.json();
        if (!isSubscribed) return;

        setScanReport(data);

        if (data.status === "completed" || data.status === "failed") {
          setIsLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 600);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [currentScanId]);

  const handleStartScan = async (
    repoUrl: string,
    branch: string = "main",
    changelogText: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setScanReport(null);
    setActiveTab("workspace");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, branch, changelogText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start scan");
      }

      setCurrentScanId(data.scanId);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage((err as Error).message);
    }
  };

  const resolveChangelogForRepo = (url: string) => {
    const lower = url.toLowerCase();
    if (
      lower.includes("stripe") ||
      lower.includes("billing") ||
      lower.includes("payment")
    ) {
      return CHANGELOG_PRESETS[0].changelogText;
    }
    if (lower.includes("firebase") || lower.includes("auth")) {
      return CHANGELOG_PRESETS[1].changelogText;
    }
    if (
      lower.includes("openai") ||
      lower.includes("gpt") ||
      lower.includes("davinci") ||
      lower.includes("ai")
    ) {
      return CHANGELOG_PRESETS[2].changelogText;
    }
    if (
      lower.includes("github") ||
      lower.includes("octokit") ||
      lower.includes("webhook")
    ) {
      return CHANGELOG_PRESETS[3].changelogText;
    }

    return `### Universal API Deprecation & Compatibility Audit
1. Stripe 2025-03-31 (Basil): Removed invoice.payment_intent and direct charge creation.
2. Firebase v9: Deprecated namespaced firebase.auth() in favor of modular tree-shakeable functions.
3. OpenAI: Sunset text-davinci-003 and /v1/completions; require chat.completions.create with modern chat models.
4. GitHub REST API: Disallowed ?access_token= in URL query strings; require Authorization: Bearer header.`;
  };

  const handleDirectRepoAnalyze = (
    repoInput: string,
    optionalChangelog?: string
  ) => {
    const cleanRepo =
      repoInput.trim() || "https://github.com/stripe-samples/accept-a-payment";
    const changelog = optionalChangelog || resolveChangelogForRepo(cleanRepo);
    handleStartScan(cleanRepo, "main", changelog);
  };

  const handleNewScan = () => {
    setCurrentScanId(null);
    setScanReport(null);
    setIsLoading(false);
    setErrorMessage(null);
    setActiveTab("workspace");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      <Navbar
        onNewScan={handleNewScan}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Error notification bar */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between sticky-shadow">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Overview / Landing */}
        {activeTab === "landing" && (
          <LandingHero
            onStart={(query) => {
              if (query && query.trim()) {
                handleDirectRepoAnalyze(query);
              } else {
                setActiveTab("workspace");
              }
            }}
            onAnalyzeRepo={(repoUrl) => {
              handleDirectRepoAnalyze(repoUrl);
            }}
            onExplorePreset={(presetId) => {
              const preset = CHANGELOG_PRESETS.find((p) => p.id === presetId);
              if (preset) {
                handleStartScan(
                  preset.recommendedRepoUrl,
                  "main",
                  preset.changelogText
                );
              } else {
                setActiveTab("workspace");
              }
            }}
          />
        )}

        {/* Tab 2: Workbench */}
        {activeTab === "workspace" && (
          <div className="space-y-8">
            {/* If no scan or user clicked new scan */}
            {!currentScanId && !scanReport && (
              <ScanForm onSubmit={handleStartScan} isLoading={isLoading} />
            )}

            {/* If scanning in progress */}
            {isLoading && (
              <ScanProgress
                currentStep={scanReport?.currentStep || "connecting"}
                stepMessage={
                  scanReport?.stepMessage || "Connecting to GitHub repository..."
                }
                progressPercent={scanReport?.progressPercent || 15}
                thoughts={scanReport?.thoughts || []}
              />
            )}

            {/* If scan completed */}
            {!isLoading && scanReport && scanReport.status === "completed" && (
              <ImpactReport report={scanReport} onNewScan={handleNewScan} />
            )}
          </div>
        )}

        {/* Tab 3: Architecture Deep-Dive */}
        {activeTab === "architecture" && (
          <div className="max-w-4xl mx-auto space-y-8 py-6">
            <div className="text-center">
              <span className="font-handwriting text-3xl text-neutral-500">
                how it works under the hood
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight text-neutral-900 mt-1">
                Deterministic Engine + AI Synthesis
              </h2>
              <p className="text-sm text-neutral-600 mt-2 max-w-xl mx-auto">
                Deterministic scanning eliminates hallucinations, providing verifiable ground truth for automated code repairs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-[30px] bg-[#f4f3ef] border border-neutral-200 p-7 sticky-shadow -rotate-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Phase 1 - Ground Truth
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-1 mb-2">
                  Regex & Pattern AST
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  The engine scans exact method signatures, prototype chains, and API query parameters before any LLM inference occurs.
                </p>
              </div>

              <div className="rounded-[30px] bg-[#f4f3ef] border border-neutral-200 p-7 sticky-shadow rotate-1">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Phase 2 - Contextual AI
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-1 mb-2">
                  Surgical Code Synthesis
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  The AI model only receives verified code snippets and changelog diffs to produce isolated, reversible patches.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200/80 bg-white/70 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PatchPilot — Detect API changes. Find affected code. Generate reliable fixes.</span>
          <span className="font-mono text-[11px] text-neutral-400">
            Open Innovation Track • Live GitHub Inspection
          </span>
        </div>
      </footer>
    </div>
  );
}
