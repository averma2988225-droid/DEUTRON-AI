"use client";

import React, { useState } from "react";
import { PatchResult } from "@/types";
import { parseUnifiedDiff } from "@/lib/differ";
import {
  Copy,
  Download,
  Check,
  ShieldCheck,
  FileCode,
} from "lucide-react";

interface DiffViewerProps {
  patches: PatchResult[];
  repoName: string;
}

export function DiffViewer({ patches, repoName }: DiffViewerProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!patches || patches.length === 0) {
    return (
      <div className="rounded-[30px] bg-white border border-neutral-200 p-10 text-center text-neutral-500">
        <FileCode className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
        <p className="text-sm font-sans">No code changes required for this investigation.</p>
      </div>
    );
  }

  const currentPatch = patches[selectedFileIndex] || patches[0];
  const parsedLines = parseUnifiedDiff(currentPatch.diff);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPatch.diff);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentPatch.diff], { type: "text/x-diff;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentPatch.file.replace(/[^a-zA-Z0-9_-]/g, "_")}.patch`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const combined = patches.map((p) => p.diff).join("\n\n");
    const blob = new Blob([combined], { type: "text/x-diff;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `patchpilot-${repoName}-all-patches.patch`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-[32px] bg-white border border-neutral-200/90 sticky-shadow overflow-hidden">
      {/* File Tabs & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-200/80 bg-[#fafaf8] px-6 py-4 gap-4">
        {/* File Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {patches.map((patch, idx) => (
            <button
              key={patch.file}
              onClick={() => setSelectedFileIndex(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition shrink-0 ${
                selectedFileIndex === idx
                  ? "bg-[#111113] text-white font-semibold shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200"
              }`}
            >
              <FileCode className="h-3.5 w-3.5 text-neutral-400" />
              <span>{patch.file}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4f3ef] text-neutral-800 font-sans">
                Verified
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-neutral-900" />
                Copied Diff
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-neutral-500" />
                Copy Patch
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition active:scale-95 shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-neutral-500" />
            Download .patch
          </button>

          {patches.length > 1 && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 rounded-full bg-[#111113] px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition active:scale-95 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Download All ({patches.length})
            </button>
          )}
        </div>
      </div>

      {/* Safety & Verification Checklist Bar */}
      <div className="bg-[#fcfcfa] border-b border-neutral-200/60 px-6 py-3 flex flex-wrap items-center gap-5 text-xs">
        <span className="text-neutral-800 font-bold flex items-center gap-1.5 font-sans uppercase tracking-wider text-[11px]">
          <ShieldCheck className="h-4 w-4 text-neutral-900" />
          Verification Audit:
        </span>
        {currentPatch.checks.map((chk) => (
          <div key={chk.id} className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span
              className={`h-2 w-2 rounded-full ${
                chk.passed ? "bg-neutral-900" : "bg-neutral-400"
              }`}
            />
            <span>{chk.name}</span>
          </div>
        ))}
      </div>

      {/* Diff Code Container */}
      <div className="font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto bg-white p-6 leading-relaxed">
        {parsedLines.map((line, idx) => {
          if (line.type === "header") {
            return (
              <div
                key={idx}
                className="text-neutral-500 bg-[#f4f3ef] py-1 px-3 my-1.5 rounded-lg font-semibold select-none text-[11px]"
              >
                {line.content}
              </div>
            );
          }

          if (line.type === "addition") {
            return (
              <div
                key={idx}
                className="flex items-start bg-[#f4f3ef] text-neutral-900 px-3 py-1 rounded-md border-l-2 border-neutral-900 my-0.5"
              >
                <span className="w-10 shrink-0 text-neutral-400 select-none text-[10px] text-right pr-3">
                  {line.newLineNumber}
                </span>
                <span className="w-4 shrink-0 text-neutral-900 select-none font-bold">
                  +
                </span>
                <span className="whitespace-pre font-mono">{line.content}</span>
              </div>
            );
          }

          if (line.type === "deletion") {
            return (
              <div
                key={idx}
                className="flex items-start bg-[#fafaf8] text-neutral-400 line-through px-3 py-1 rounded-md border-l-2 border-neutral-300 my-0.5"
              >
                <span className="w-10 shrink-0 text-neutral-400 select-none text-[10px] text-right pr-3">
                  {line.oldLineNumber}
                </span>
                <span className="w-4 shrink-0 text-neutral-400 select-none font-bold">
                  -
                </span>
                <span className="whitespace-pre font-mono">{line.content}</span>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="flex items-start text-neutral-600 px-3 py-0.5 hover:bg-neutral-50 rounded"
            >
              <span className="w-10 shrink-0 text-neutral-400 select-none text-[10px] text-right pr-3">
                {line.oldLineNumber || line.newLineNumber}
              </span>
              <span className="w-4 shrink-0 text-neutral-300 select-none font-bold">
                {" "}
              </span>
              <span className="whitespace-pre text-neutral-800 font-mono">{line.content}</span>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-neutral-200/80 bg-[#fafaf8] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600">
        <div>
          <span className="font-bold text-neutral-900 font-sans">Target: </span>
          <code className="text-neutral-900 font-mono font-bold">{currentPatch.file}</code>
          <span className="mx-2 text-neutral-300">|</span>
          <span className="font-sans">{currentPatch.summary}</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-800 font-semibold font-sans">
          <ShieldCheck className="h-4 w-4 text-neutral-900" />
          Ready for Developer Code Review
        </div>
      </div>
    </div>
  );
}
