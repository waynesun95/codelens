import "./SeverityBadge.css";

export type IssueSeverity = "critical" | "warning" | "suggestion" | "praise";

const LABELS: Record<IssueSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  suggestion: "Suggestion",
  praise: "Praise",
};

const COMPACT: Record<IssueSeverity, string> = {
  critical: "C",
  warning: "W",
  suggestion: "S",
  praise: "P",
};

interface SeverityBadgeProps {
  severity: IssueSeverity;
  compact?: boolean;
  className?: string;
}

export function SeverityBadge({ severity, compact = false, className }: SeverityBadgeProps) {
  const rootClass = [
    "severity-badge",
    `severity-badge--${severity}`,
    compact ? "severity-badge--compact" : "severity-badge--default",
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
