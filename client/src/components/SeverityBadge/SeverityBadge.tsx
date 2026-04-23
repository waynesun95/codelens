import type { SeverityBadgeSeverity } from "./SeverityBadge.types";

const LABELS: Record<SeverityBadgeSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  suggestion: "Suggestion",
  praise: "Praise",
  clean: "Clean",
  minor: "Minor",
  moderate: "Moderate",
};

const SEVERITY_CLASSES: Record<SeverityBadgeSeverity, string> = {
  critical:
    "border border-red-900/40 bg-severity-critical text-red-50 dark:border-red-950/50",
  warning:
    "border border-amber-900/40 bg-severity-warning text-amber-950 dark:border-amber-950/50 dark:text-amber-50",
  suggestion:
    "border border-blue-900/40 bg-severity-suggestion text-blue-50 dark:border-blue-950/50",
  praise:
    "border border-green-900/40 bg-severity-praise text-green-50 dark:border-green-950/50",
  clean:
    "border border-green-900/40 bg-severity-praise text-green-50 dark:border-green-950/50",
  minor:
    "border border-blue-900/40 bg-severity-suggestion text-blue-50 dark:border-blue-950/50",
  moderate:
    "border border-amber-900/40 bg-severity-warning text-amber-950 dark:border-amber-950/50 dark:text-amber-50",
};

interface SeverityBadgeProps {
  severity: SeverityBadgeSeverity;
  /** When set, label includes the count (e.g. `Critical: 1`). */
  count?: number;
  className?: string;
}

function getDisplayText(severity: SeverityBadgeSeverity, count: number | undefined): string {
  const label = LABELS[severity];
  if (count === undefined) {
    return label;
  }
  return `${label}: ${count}`;
}

export function SeverityBadge({ severity, count, className }: SeverityBadgeProps) {
  const hasCount = count !== undefined;

  const sizeClasses = hasCount
    ? "rounded px-2 py-1 text-[0.72rem]"
    : "rounded px-[0.45rem] py-[0.15rem] text-[0.72rem]";

  const rootClass = [
    "inline-flex items-center justify-center font-semibold capitalize tracking-wide whitespace-nowrap",
    sizeClasses,
    SEVERITY_CLASSES[severity],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const title = hasCount ? `${LABELS[severity]}: ${count}` : LABELS[severity];

  return (
    <span className={rootClass} title={title}>
      {getDisplayText(severity, count)}
    </span>
  );
}
