import type { IssueSeverity, ReviewResponse } from "../../types/review";
import { SeverityBadge } from "../SeverityBadge/SeverityBadge";

/** Display order for stats badges (not coupled to prompt/schema source of truth). */
const SEVERITY_DISPLAY_ORDER: readonly IssueSeverity[] = [
  "critical",
  "warning",
  "suggestion",
  "praise",
];

interface SummaryPanelProps {
  review: ReviewResponse;
}

export function SummaryPanel({ review }: SummaryPanelProps) {
  const issueCount = review.issues.length;

  return (
    <section
      className="flex flex-col gap-3 rounded-lg border border-border bg-canvas-muted/40 p-4"
      aria-labelledby="summary-panel-heading"
    >
      <h2 id="summary-panel-heading" className="m-0 text-base font-semibold text-fg">
        Review summary
      </h2>

      <p className="m-0 text-sm leading-relaxed text-fg">{review.summary}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SeverityBadge severity={review.overallSeverity} />
        <span className="text-sm text-fg-muted">
          {issueCount} {issueCount === 1 ? "issue" : "issues"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          By severity
        </span>
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Issue counts by severity"
        >
          {SEVERITY_DISPLAY_ORDER.map((key) => (
            <span key={key} role="listitem">
              <SeverityBadge severity={key} count={review.stats[key]} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
