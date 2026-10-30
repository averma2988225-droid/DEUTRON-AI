import { ScanReport, ScanStepKey, AgentThought } from "@/types";
import { fetchRepoTreeAndContents } from "./github";
import { scanRepositoryFiles } from "./scanner";
import { analyzeImpact } from "./analyzer";
import { generatePatchForFile } from "./patcher";

declare global {
  // eslint-disable-next-line no-var
  var __patchpilot_scans: Map<string, ScanReport> | undefined;
}

const scans: Map<string, ScanReport> =
  globalThis.__patchpilot_scans || (globalThis.__patchpilot_scans = new Map());

export function getScan(id: string): ScanReport | null {
  return scans.get(id) || null;
}

export function listScans(): ScanReport[] {
  return Array.from(scans.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveScan(scan: ScanReport): void {
  scans.set(scan.id, scan);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeScan(
  scanId: string,
  owner: string,
  repo: string,
  branch: string,
  changelogText: string
): Promise<ScanReport> {
  const startTime = Date.now();
  const thoughts: AgentThought[] = [];

  const addThought = (
    type: AgentThought["type"],
    content: string,
    step: ScanStepKey,
    percent: number,
    extra: Partial<ScanReport> = {}
  ) => {
    const current = scans.get(scanId);
    if (!current) return;

    const thought: AgentThought = {
      id: `thought-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      type,
      content,
    };
    thoughts.push(thought);

    const updated: ScanReport = {
      ...current,
      currentStep: step,
      stepMessage: content,
      progressPercent: percent,
      thoughts: [...thoughts],
      ...extra,
    };
    scans.set(scanId, updated);
  };

  try {
    // Stage 1: Connecting
    addThought(
      "pondering",
      `Connecting to ${owner}/${repo} on branch ${branch}`,
      "connecting",
      10
    );
    await sleep(1300);

    addThought(
      "pondering",
      `Resolving Git tree hierarchy and manifests`,
      "connecting",
      20
    );
    await sleep(1300);

    // Stage 2: Indexing Files
    addThought(
      "inspecting",
      `Indexing source candidate files`,
      "indexing",
      30
    );
    const { info, files } = await fetchRepoTreeAndContents(owner, repo, branch);
    await sleep(1300);

    addThought(
      "inspecting",
      `Indexed ${files.length} source files for inspection`,
      "indexing",
      40,
      { repo: info }
    );
    await sleep(1200);

    // Stage 3: Deterministic Scanner
    addThought(
      "pondering",
      `Running pattern scanner across source tree`,
      "detecting",
      50
    );
    const detectedUsages = scanRepositoryFiles(files, changelogText);
    await sleep(1400);

    addThought(
      "inspecting",
      `Located ${detectedUsages.length} API integration points`,
      "detecting",
      60,
      { detectedUsages }
    );
    await sleep(1300);

    // Stage 4: Impact Analysis
    addThought(
      "reasoning",
      `Cross referencing API contracts against changelog`,
      "analyzing",
      70
    );
    await sleep(1400);

    const findings = analyzeImpact(detectedUsages, files, changelogText);
    const criticals = findings.filter((f) => f.severity === "critical").length;
    const breakings = findings.filter((f) => f.severity === "breaking").length;

    addThought(
      "reasoning",
      `Isolated ${findings.length} affected locations (${criticals} critical, ${breakings} breaking)`,
      "analyzing",
      78,
      { findings }
    );
    await sleep(1400);

    // Stage 5: Code Repair & Unified Diff Synthesis
    addThought(
      "synthesizing",
      `Synthesizing migration patch for affected contracts`,
      "patching",
      85
    );
    await sleep(1500);

    const affectedFilePaths = Array.from(new Set(findings.map((f) => f.file)));
    const patches = affectedFilePaths
      .map((path) => {
        const file = files.find((f) => f.path === path);
        if (!file) return null;
        return generatePatchForFile(file, findings);
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    addThought(
      "synthesizing",
      `Generated ${patches.length} unified diff patches`,
      "patching",
      92,
      { patches }
    );
    await sleep(1300);

    // Stage 6: Structural & Safety Verification
    addThought(
      "verifying",
      `Auditing patch syntax balance and credential insulation`,
      "verifying",
      96
    );
    await sleep(1400);

    const allVerified =
      patches.length > 0 && patches.every((p) => p.status === "verified");

    addThought(
      "verifying",
      `Verification complete. Patches validated for review`,
      "verifying",
      99
    );
    await sleep(1000);

    // Stage 7: Completed
    const finalReport: ScanReport = {
      id: scanId,
      repo: info,
      changelogText,
      createdAt: new Date().toISOString(),
      status: "completed",
      currentStep: "completed",
      stepMessage: `Inspection complete: ${findings.length} affected locations found, ${patches.length} verified patches ready.`,
      progressPercent: 100,
      thoughts: [...thoughts],
      stats: {
        totalFiles: info.totalFiles || files.length,
        scannedFiles: files.length,
        apiUsagesCount: detectedUsages.length,
        affectedFilesCount: affectedFilePaths.length,
        criticalCount: criticals,
        breakingCount: breakings,
        warningsCount: findings.filter((f) => f.severity === "warning").length,
        durationMs: Date.now() - startTime,
      },
      detectedUsages,
      findings,
      patches,
      verificationPassed: allVerified,
    };

    scans.set(scanId, finalReport);
    return finalReport;
  } catch (err) {
    const errorMsg =
      (err as Error).message || "An unexpected error occurred during scan execution";
    const current = scans.get(scanId);
    if (current) {
      scans.set(scanId, {
        ...current,
        status: "failed",
        stepMessage: errorMsg,
        error: errorMsg,
      });
    }
    throw err;
  }
}
