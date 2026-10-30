import * as Diff from "diff";

export function generateUnifiedDiff(
  filePath: string,
  originalCode: string,
  patchedCode: string
): string {
  const patch = Diff.createTwoFilesPatch(
    `a/${filePath}`,
    `b/${filePath}`,
    originalCode,
    patchedCode,
    "",
    "",
    { context: 3 }
  );

  return patch;
}

export interface DiffLine {
  type: "addition" | "deletion" | "normal" | "header";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function parseUnifiedDiff(rawDiff: string): DiffLine[] {
  const lines = rawDiff.split("\n");
  const result: DiffLine[] = [];

  let oldCounter = 0;
  let newCounter = 0;

  for (const line of lines) {
    if (line.startsWith("---") || line.startsWith("+++")) {
      result.push({ type: "header", content: line });
      continue;
    }

    if (line.startsWith("@@")) {
      // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
      const match = line.match(/@@\s+-([0-9]+)(?:,[0-9]+)?\s+\+([0-9]+)(?:,[0-9]+)?\s+@@/);
      if (match) {
        oldCounter = parseInt(match[1], 10);
        newCounter = parseInt(match[2], 10);
      }
      result.push({ type: "header", content: line });
      continue;
    }

    if (line.startsWith("+")) {
      result.push({
        type: "addition",
        content: line.slice(1),
        newLineNumber: newCounter++,
      });
    } else if (line.startsWith("-")) {
      result.push({
        type: "deletion",
        content: line.slice(1),
        oldLineNumber: oldCounter++,
      });
    } else {
      result.push({
        type: "normal",
        content: line.startsWith(" ") ? line.slice(1) : line,
        oldLineNumber: oldCounter++,
        newLineNumber: newCounter++,
      });
    }
  }

  return result;
}

