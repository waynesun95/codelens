import type { SeverityBadgeSeverity } from "./SeverityBadge.types";

export type { IssueSeverity, SeverityBadgeSeverity } from "./SeverityBadge.types";

const LABELS: Record<SeverityBadgeSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  suggestion: "Suggestion",
  praise: "Praise",
  clean: "Clean",
  minor: "Minor",
  moderate: "Moderate",
};

const COMPACT: Record<SeverityBadgeSeverity, string> = {
  critical: "C",
  warning: "W",
  suggestion: "S",
  praise: "P",
  clean: "CL",
  minor: "MI",
  moderate: "MO",
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
  compact?: boolean;
  className?: string;
}

export function SeverityBadge({ severity, compact = false, className }: SeverityBadgeProps) {
  const sizeClasses = compact
    ? "min-h-[1.35rem] min-w-[1.35rem] rounded-full p-0 text-[0.65rem]"
    : "rounded px-[0.45rem] py-[0.15rem] text-[0.72rem]";

  const rootClass = [
    "inline-flex items-center justify-center font-semibold capitalize tracking-wide whitespace-nowrap",
    sizeClasses,
    SEVERITY_CLASSES[severity],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={rootClass} title={LABELS[severity]}>
      {compact ? COMPACT[severity] : LABELS[severity]}
    </span>
  );
}
