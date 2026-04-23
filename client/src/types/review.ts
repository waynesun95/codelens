/**
 * Types are driven from prompt response format found in /codelens/prompts/review.ts
 */

export type IssueSeverity = "critical" | "warning" | "suggestion" | "praise";

export type PRReview = FileReview[];

export interface FileReview {
  filename: string;
  diff: string;
  review: ReviewResponse;
}

export interface ReviewResponse {
  summary: string;
  overallSeverity: "clean" | "minor" | "moderate" | "critical";
  issues: CodeIssue[];
  stats: ReviewStatistics;
}

export type OverallSeverity = ReviewResponse["overallSeverity"];

export interface ReviewStatistics {
  critical: number;
  warning: number;
  suggestion: number;
  praise: number;
}

export interface CodeIssue {
  id: number;
  severity: IssueSeverity;
  category: "security" | "performance" | "bug" | "style" | "maintainability" | "best-practice";
  lineNumber: number | null;
  title: string;
  description: string;
  suggestion?: string;
}
