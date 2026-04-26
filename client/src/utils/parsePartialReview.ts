import type { IssueSeverity, OverallSeverity, ReviewStatistics } from "../types/review";

export interface PartialReview {
  summary: string;
  overallSeverity: OverallSeverity | null;
  stats: ReviewStatistics;
  issueCount: number;
}

const EMPTY_STATS: ReviewStatistics = { critical: 0, warning: 0, suggestion: 0, praise: 0 };
const ISSUE_SEVERITIES: readonly IssueSeverity[] = ["critical", "warning", "suggestion", "praise"];
const OVERALL_SEVERITIES: readonly OverallSeverity[] = ["clean", "minor", "moderate", "critical"];

const SUMMARY_RE = /"summary"\s*:\s*"((?:[^"\\]|\\.)*)"?/;
const OVERALL_RE = new RegExp(
  `"overallSeverity"\\s*:\\s*"(${OVERALL_SEVERITIES.join("|")})"`,
);
const ISSUE_SEVERITY_RE = new RegExp(
  `"severity"\\s*:\\s*"(${ISSUE_SEVERITIES.join("|")})"`,
  "g",
);

/**
 * Best-effort extraction of fields from a streaming Claude review response.
 *
 * The response is a single JSON object that isn't valid until the stream
 * completes, so we can't `JSON.parse`. Instead we run targeted regexes against
 * the schema's known top-level keys.
 *
 * - `summary` matches even when the closing quote hasn't streamed yet (so the
 *   partial paragraph appears live, character by character).
 * - `overallSeverity` requires the closing quote, so it appears once Claude
 *   has finished writing the value.
 * - `stats` arrives last in the JSON, so we derive live per-severity counts by
 *   counting completed `"severity": "..."` occurrences inside the `issues`
 *   array. This means counts tick up as each issue is fully written.
 */
export function parsePartialReview(text: string): PartialReview {
  if (!text) {
    return { summary: "", overallSeverity: null, stats: { ...EMPTY_STATS }, issueCount: 0 };
  }

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const summaryMatch = cleaned.match(SUMMARY_RE);
  const summary = (summaryMatch?.[1] ?? "")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");

  const overallMatch = cleaned.match(OVERALL_RE);
  const overallSeverity = (overallMatch?.[1] as OverallSeverity | undefined) ?? null;

  const stats: ReviewStatistics = { ...EMPTY_STATS };
  let issueCount = 0;
  for (const match of cleaned.matchAll(ISSUE_SEVERITY_RE)) {
    stats[match[1] as IssueSeverity]++;
    issueCount++;
  }

  return { summary, overallSeverity, stats, issueCount };
}
