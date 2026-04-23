import type { OverallSeverity } from "../../types/review";

export type IssueSeverity = "critical" | "warning" | "suggestion" | "praise";

/** Values shown on `SeverityBadge` — issue severities plus PR overall severity. */
export type SeverityBadgeSeverity = IssueSeverity | OverallSeverity;
