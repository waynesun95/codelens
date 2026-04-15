import type { FileReview, ReviewResponse } from "../types/review";

const EMPTY_REVIEW: ReviewResponse = {
  summary: "",
  overallSeverity: "clean",
  issues: [],
  stats: {
    critical: 0,
    warning: 0,
    suggestion: 0,
    praise: 0,
  },
};

interface ParsedDiffContent {
  oldCode: string;
  newCode: string;
}

function stripGitPrefix(path: string): string {
  if (path.startsWith("a/") || path.startsWith("b/")) {
    return path.slice(2);
  }

  return path;
}

function parseFilenameFromDiff(diffText: string, fallbackFilename: string): string {
  const plusPlusMatch = diffText.match(/^\+\+\+\s+(.+)$/m);
  if (plusPlusMatch) {
    const plusPlusPath = plusPlusMatch[1].trim();
    if (plusPlusPath !== "/dev/null") {
      return stripGitPrefix(plusPlusPath);
    }
  }

  const diffGitMatch = diffText.match(/^diff --git\s+a\/(.+)\s+b\/(.+)$/m);
  if (diffGitMatch) {
    return diffGitMatch[2].trim();
  }

  const minusMinusMatch = diffText.match(/^---\s+(.+)$/m);
  if (minusMinusMatch) {
    const minusMinusPath = minusMinusMatch[1].trim();
    if (minusMinusPath !== "/dev/null") {
      return stripGitPrefix(minusMinusPath);
    }
  }

  return fallbackFilename;
}

export function parseUnifiedDiffToCode(diffText: string): ParsedDiffContent {
  const oldLines: string[] = [];
  const newLines: string[] = [];
  const lines = diffText.split("\n");
  let inHunk = false;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      inHunk = true;
      continue;
    }

    if (!inHunk) {
      continue;
    }

    if (line.startsWith("\\ No newline at end of file")) {
      continue;
    }

    if (line.startsWith("+")) {
      newLines.push(line.slice(1));
      continue;
    }

    if (line.startsWith("-")) {
      oldLines.push(line.slice(1));
      continue;
    }

    if (line.startsWith(" ")) {
      const contextLine = line.slice(1);
      oldLines.push(contextLine);
      newLines.push(contextLine);
    }
  }

  return {
    oldCode: oldLines.join("\n"),
    newCode: newLines.join("\n"),
  };
}

export function parseDiffToFileReview(
  diffText: string,
  review: ReviewResponse = EMPTY_REVIEW,
  fallbackFilename = "unknown-file.ts",
): FileReview {
  return {
    filename: parseFilenameFromDiff(diffText, fallbackFilename),
    diff: diffText,
    review,
  };
}
