"use client";

import React, { useRef, useEffect } from "react";
import { ScanStepKey, AgentThought } from "@/types";
import {
  CheckCircle2,
  Loader2,
  Circle,
  Terminal,
} from "lucide-react";

interface StepConfig {
  key: ScanStepKey;
  label: string;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    key: "connecting",
    label: "1. Repository Connection",
    description: "Connect to GitHub REST API and fetch tree commits",
  },
  {
    key: "indexing",
    label: "2. Tree Indexing & Filter",
    description: "Filter code candidate files (.ts, .js, .py, .go)",
  },
  {
    key: "detecting",
    label: "3. Deterministic Scanner",
    description: "Scan SDK imports, method calls, endpoint URLs",
  },
  {
    key: "analyzing",
    label: "4. Impact Analysis",
    description: "Cross-reference detected tokens against breaking changelogs",
  },
  {
    key: "patching",
    label: "5. Code Repair Synthesis",
    description: "Generate surgical code replacements & unified diffs",
  },
  {
    key: "verifying",
    label: "6. Safety Verification",
    description: "Verify AST bracket balance & zero credential leaks",
  },
];

interface ScanProgressProps {
  currentStep: ScanStepKey;
  stepMessage: string;
  progressPercent: number;
  thoughts?: AgentThought[];
}

export function ScanProgress({
  currentStep,
  stepMessage,
  progressPercent,
  thoughts = [],
}: ScanProgressProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the thought stream to the newest thought
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thoughts.length]);

  const getStepStatus = (stepKey: ScanStepKey) => {
    const stepOrder: ScanStepKey[] = [
      "connecting",
      "indexing",
      "detecting",
      "analyzing",
      "patching",
      "verifying",
      "completed",
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    const thisIndex = stepOrder.indexOf(stepKey);

    if (currentStep === "completed" || thisIndex < currentIndex) {
      return "completed";
    }
    if (thisIndex === currentIndex) {
      return "active";
    }
    return "pending";
  };

  const getThoughtTag = (type: AgentThought["type"]) => {
    switch (type) {
      case "pondering":
        return <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider">[plan]</span>;
      case "inspecting":
        return <span className="text-neutral-300 font-mono text-[10px] uppercase font-bold tracking-wider">[scan]</span>;
      case "reasoning":
        return <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider">[diff]</span>;
      case "synthesizing":
        return <span className="text-neutral-300 font-mono text-[10px] uppercase font-bold tracking-wider">[patch]</span>;
      case "verifying":
        return <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider">[check]</span>;
      default:
        return <span className="text-neutral-500 font-mono text-[10px] uppercase font-bold tracking-wider">[step]</span>;
    }
  };

  return (
    <div className="rounded-[36px] bg-white border border-neutral-200/90 p-8 sm:p-10 sticky-shadow max-w-5xl mx-auto space-y-8">
      {/* Top Header & Pacing Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-sans font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-900" />
            Inspection & Code Repair in Progress
          </span>
          <span className="font-mono text-sm text-neutral-600 font-bold">
            {progressPercent}%
          </span>
        </div>

        {/* Pill Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 p-0.5 border border-neutral-200/60">
          <div
            className="h-full bg-neutral-900 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="mt-3 text-xs sm:text-sm text-neutral-700 font-mono flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 animate-ping" />
          {stepMessage}
        </p>
      </div>

      {/* Agent Thought / Pondering Terminal Console */}
      <div className="rounded-[28px] bg-[#141416] border border-neutral-800 text-neutral-200 p-6 sticky-shadow overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-400 flex items-center gap-2 ml-2">
              <Terminal className="h-3.5 w-3.5 text-neutral-400" />
              Agent Execution Log
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-300 bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-700">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-pulse" />
            active
          </div>
        </div>

        {/* Thought Items Stream */}
        <div className="font-mono text-xs space-y-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
          {thoughts.map((thought) => (
            <div
              key={thought.id}
              className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200"
            >
              <span className="text-neutral-500 shrink-0 text-[11px] select-none">
                [{thought.timestamp}]
              </span>
              <span className="shrink-0">{getThoughtTag(thought.type)}</span>
              <span className="text-neutral-300 leading-relaxed">
                {thought.content}
              </span>
            </div>
          ))}

          {/* Active Thinking Cursor Animation */}
          {currentStep !== "completed" && (
            <div className="flex items-center gap-2 text-neutral-500 text-xs pt-1 font-mono">
              <span className="select-none">processing</span>
              <span className="inline-block w-1.5 h-3.5 bg-neutral-400 animate-pulse" />
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Grid of Checklist Cards in 3-Color Scheme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {STEPS.map((step) => {
          const status = getStepStatus(step.key);

          return (
            <div
              key={step.key}
              className={`flex items-start gap-3.5 p-4 rounded-[22px] border transition duration-300 ${
                status === "active"
                  ? "bg-[#f4f3ef] border-neutral-300 sticky-shadow scale-[1.02]"
                  : status === "completed"
                  ? "bg-white border-neutral-200/90 text-neutral-800"
                  : "bg-white border-neutral-100 text-neutral-400 opacity-60"
              }`}
            >
              <div className="mt-0.5">
                {status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-neutral-800" />
                ) : status === "active" ? (
                  <Loader2 className="h-5 w-5 text-neutral-900 animate-spin" />
                ) : (
                  <Circle className="h-5 w-5 text-neutral-300" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold tracking-tight text-neutral-900 font-sans">
                  {step.label}
                </h4>
                <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
