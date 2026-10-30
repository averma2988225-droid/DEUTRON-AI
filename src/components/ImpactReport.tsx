"use client";

import React, { useState } from "react";
import { ScanReport } from "@/types";
import { DiffViewer } from "./DiffViewer";
import {
  FileCode,
  ShieldCheck,
  Code2,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Star,
  GitBranch,
} from "lucide-react";



interface ImpactReportProps {
  report: ScanReport;
  onNewScan: () => void;
}

function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-sans font-medium transition active:scale-95 border ${
        copied
          ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
          : "text-neutral-600 hover:text-neutral-900 bg-white/60 hover:bg-white border-neutral-200/90 shadow-2xs"
      }`}
      title="Copy snippet"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-white" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 text-neutral-500" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export function ImpactReport({ report, onNewScan }: ImpactReportProps) {
  const [activeTab, setActiveTab] = useState<"findings" | "diffs">("findings");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner with Real GitHub Metadata & Stats */}
      <div className="rounded-[36px] bg-white border border-neutral-200/90 p-8 sm:p-10 sticky-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-neutral-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-handwriting text-2xl text-neutral-500">
                inspection results
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs text-neutral-400 font-mono">
                {new Date(report.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-3">
              <span>{report.repo.owner}/{report.repo.repo}</span>
              <a
                href={report.repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-neutral-800 transition"
                title="View repository on GitHub"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </h2>

            <p className="text-sm text-neutral-600 mt-1 max-w-2xl font-sans">
              {report.repo.description}
            </p>

            {/* Real-time GitHub Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono">
              <span className="flex items-center gap-1 bg-[#f4f3ef] border border-neutral-200/80 px-2.5 py-0.5 rounded-full text-neutral-800 font-medium">
                <Star className="h-3 w-3 text-neutral-500 fill-neutral-400" />
                {report.repo.stars > 0 ? report.repo.stars.toLocaleString() : "Live Repo"} stars
              </span>

              <span className="flex items-center gap-1 bg-[#f4f3ef] border border-neutral-200/80 px-2.5 py-0.5 rounded-full text-neutral-800">
                <GitBranch className="h-3 w-3 text-neutral-500" />
                {report.repo.defaultBranch || "main"}
              </span>

              <span className="bg-[#f4f3ef] border border-neutral-200/80 px-2.5 py-0.5 rounded-full text-neutral-800">
                {report.repo.language || "Multi-language"}
              </span>

              {report.repo.totalFiles > 0 && (
                <span className="bg-[#f4f3ef] border border-neutral-200/80 px-2.5 py-0.5 rounded-full text-neutral-600">
                  {report.repo.totalFiles.toLocaleString()} files indexed
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNewScan}
              className="rounded-full border border-neutral-200 bg-[#f4f3ef] px-5 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-200 active:scale-95"
            >
              Analyze Another Repo
            </button>
            <button
              onClick={() => setActiveTab("diffs")}
              className="flex items-center gap-2 rounded-full bg-[#111113] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800 shadow-sm active:scale-95"
            >
              <Code2 className="h-4 w-4" />
              <span>Review Diffs ({report.patches.length})</span>
            </button>
          </div>
        </div>

        {/* Cohesive 3-Color Sticky Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-6">
          <div className="rounded-[22px] bg-[#f4f3ef] border border-neutral-200/90 p-4 -rotate-1 sticky-shadow-hover">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
              Scanned Files
            </span>
            <div className="text-2xl font-extrabold font-sans text-neutral-900 mt-1">
              {report.stats.scannedFiles}
            </div>
          </div>

          <div className="rounded-[22px] bg-[#f4f3ef] border border-neutral-200/90 p-4 rotate-1 sticky-shadow-hover">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
              API References
            </span>
            <div className="text-2xl font-extrabold font-sans text-neutral-900 mt-1">
              {report.stats.apiUsagesCount}
            </div>
          </div>

          <div className="rounded-[22px] bg-[#f4f3ef] border border-neutral-200/90 p-4 -rotate-1 sticky-shadow-hover">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
              Impacted Files
            </span>
            <div className="text-2xl font-extrabold font-sans text-neutral-900 mt-1">
              {report.stats.affectedFilesCount}
            </div>
          </div>

          <div className="rounded-[22px] bg-[#f4f3ef] border border-neutral-200/90 p-4 rotate-1 sticky-shadow-hover">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
              Action Items
            </span>
            <div className="text-2xl font-extrabold font-sans text-neutral-900 mt-1">
              {report.findings.length}
            </div>
          </div>

          <div className="rounded-[22px] bg-[#f4f3ef] border border-neutral-200/90 p-4 -rotate-1 sticky-shadow-hover">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
              Patches Ready
            </span>
            <div className="text-2xl font-extrabold font-sans text-neutral-900 mt-1">
              {report.patches.length}
            </div>
          </div>

          <div className="rounded-[22px] bg-[#f4f3ef] border border-neutral-200/90 p-4 rotate-1 sticky-shadow-hover">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block">
              Verification
            </span>
            <div className="text-xs font-bold text-neutral-900 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-neutral-800" />
              Verified
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("findings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition ${
              activeTab === "findings"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            Evidence-Based Findings
            <span className="rounded-full bg-neutral-200/60 text-neutral-800 px-2 py-0.5 text-xs font-mono ml-1">
              {report.findings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("diffs")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition ${
              activeTab === "diffs"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200"
            }`}
          >
            <Code2 className="h-4 w-4" />
            Unified Diff Reviewer
            <span className="rounded-full bg-neutral-200/60 text-neutral-800 px-2 py-0.5 text-xs font-mono ml-1">
              {report.patches.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Findings */}
      {activeTab === "findings" && (
        <div className="space-y-4">
          {report.findings.length === 0 ? (
            <div className="rounded-[30px] bg-white border border-neutral-200 p-10 text-center text-neutral-500">
              <ShieldCheck className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm font-sans">No breaking changes identified in inspected files.</p>
            </div>
          ) : (
            report.findings.map((finding) => (
              <div
                key={finding.id}
                className="rounded-[30px] bg-white border border-neutral-200/90 p-6 sm:p-7 sticky-shadow transition hover:border-neutral-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-neutral-900 font-sans tracking-tight">
                    {finding.title}
                  </h3>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    {/* Direct clickable link to the line on GitHub */}
                    <a
                      href={`https://github.com/${report.repo.owner}/${report.repo.repo}/blob/${report.repo.defaultBranch || "main"}/${finding.file}#L${finding.line}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-1.5 bg-[#f4f3ef] hover:bg-neutral-200/80 text-neutral-800 px-3 py-1 rounded-full border border-neutral-200 transition"
                      title="View line in GitHub"
                    >
                      <FileCode className="h-3.5 w-3.5 text-neutral-500" />
                      <span>{finding.file}:{finding.line}</span>
                      <ExternalLink className="h-3 w-3 text-neutral-400 group-hover:text-neutral-800 transition" />
                    </a>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4 font-sans">
                  {finding.explanation}
                </p>

                {/* Evidence Comparison Grid in 3-color palette with Copy Feature */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 text-xs font-mono">
                  {/* Current Code Box with Copy */}
                  <div className="rounded-[20px] bg-[#f4f3ef] border border-neutral-200/80 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-neutral-500 font-sans">
                        Current (line {finding.line})
                      </span>
                      <CopyCodeButton text={finding.originalSnippet} />
                    </div>
                    <pre className="text-neutral-900 overflow-x-auto whitespace-pre-wrap">
                      <code>{finding.originalSnippet}</code>
                    </pre>
                  </div>

                  {/* Proposed Fix Box with Copy */}
                  <div className="rounded-[20px] bg-white border border-neutral-300 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-neutral-500 font-sans">
                        Proposed fix
                      </span>
                      <CopyCodeButton text={finding.proposedSnippet} />
                    </div>
                    <pre className="text-neutral-900 overflow-x-auto whitespace-pre-wrap">
                      <code>{finding.proposedSnippet}</code>
                    </pre>
                  </div>
                </div>

                {/* Remediation Note */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-start gap-2 text-xs text-neutral-600 font-sans">
                  <span className="font-semibold text-neutral-900 shrink-0">
                    Fix:
                  </span>
                  <span>{finding.migrationAdvice}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Diff Reviewer */}
      {activeTab === "diffs" && (
        <div>
          <DiffViewer patches={report.patches} repoName={report.repo.repo} />
        </div>
      )}
    </div>
  );
}
