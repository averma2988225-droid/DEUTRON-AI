import { NextRequest, NextResponse } from "next/server";
import { getScan } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scan = getScan(id);

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const targetFile = searchParams.get("file");
  const download = searchParams.get("download") === "true";

  let combinedDiff = "";

  if (targetFile) {
    const patch = scan.patches.find((p) => p.file === targetFile);
    if (!patch) {
      return NextResponse.json(
        { error: "Patch for requested file not found" },
        { status: 404 }
      );
    }
    combinedDiff = patch.diff;
  } else {
    combinedDiff = scan.patches.map((p) => p.diff).join("\n\n");
  }

  if (download) {
    const fileName = targetFile
      ? `${targetFile.replace(/[^a-zA-Z0-9_-]/g, "_")}.patch`
      : `patchpilot-${scan.repo.repo}-${id.slice(-5)}.patch`;

    return new NextResponse(combinedDiff, {
      status: 200,
      headers: {
        "Content-Type": "text/x-diff; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  }

  return NextResponse.json({
    scanId: scan.id,
    repo: scan.repo.repo,
    diff: combinedDiff,
    patchesCount: scan.patches.length,
  });
}

