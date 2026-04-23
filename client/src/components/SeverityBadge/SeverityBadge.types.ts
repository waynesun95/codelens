import type { IssueSeverity, OverallSeverity } from "../../types/review";

/** Values shown on `SeverityBadge` — issue severities plus PR overall severity. */
export type SeverityBadgeSeverity = IssueSeverity | OverallSeverity;
