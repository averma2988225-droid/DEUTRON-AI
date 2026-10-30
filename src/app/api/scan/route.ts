import { NextRequest, NextResponse } from "next/server";
import { parseGithubUrl } from "@/lib/github";
import { executeScan, listScans, saveScan } from "@/lib/store";
import { ScanReport } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl, branch = "main", changelogText } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "A valid GitHub repository URL is required" },
        { status: 400 }
      );
    }

    if (!changelogText || typeof changelogText !== "string") {
      return NextResponse.json(
        { error: "API changelog or announcement text is required" },
        { status: 400 }
      );
    }

    const parsed = parseGithubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Invalid GitHub URL format. Use 'https://github.com/owner/repo' or 'owner/repo'.",
        },
        { status: 400 }
      );
    }

    const scanId = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const initialReport: ScanReport = {
      id: scanId,
      repo: {
        owner: parsed.owner,
        repo: parsed.repo,
        url: `https://github.com/${parsed.owner}/${parsed.repo}`,
        description: `Inspecting ${parsed.owner}/${parsed.repo}`,
        defaultBranch: branch,
        stars: 0,
        language: "Analyzing...",
        totalFiles: 0,
      },
      changelogText,
      createdAt: new Date().toISOString(),
      status: "in_progress",
      currentStep: "connecting",
      stepMessage: "Initializing investigation pipeline...",
      progressPercent: 5,
      thoughts: [
        {
          id: `thought-${Date.now()}-init`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          type: "pondering",
          content: `Initializing pipeline for ${parsed.owner}/${parsed.repo}`,
        },
      ],
      stats: {
        totalFiles: 0,
        scannedFiles: 0,
        apiUsagesCount: 0,
        affectedFilesCount: 0,
        criticalCount: 0,
        breakingCount: 0,
        warningsCount: 0,
        durationMs: 0,
      },
      detectedUsages: [],
      findings: [],
      patches: [],
      verificationPassed: false,
    };

    saveScan(initialReport);

    // Asynchronously kick off the analysis pipeline
    executeScan(scanId, parsed.owner, parsed.repo, branch, changelogText).catch(
      (err) => {
        console.error("Scan execution failed:", err);
      }
    );

    return NextResponse.json({
      scanId,
      status: "in_progress",
      message: "Investigation started successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const scans = listScans();
  return NextResponse.json({ scans });
}
