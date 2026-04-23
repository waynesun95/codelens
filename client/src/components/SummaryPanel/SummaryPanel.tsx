import type { ReviewResponse } from "../../types/review";
import { SeverityBadge } from "../SeverityBadge/SeverityBadge";

interface SummaryPanelProps {
  review: ReviewResponse;
}

function formatStatisticsPlain(stats: ReviewResponse["stats"]): string {
  return [
    `critical: ${stats.critical}`,
    `warning: ${stats.warning}`,
    `suggestion: ${stats.suggestion}`,
    `praise: ${stats.praise}`,
  ].join(", ");
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

      <p className="m-0 font-mono text-sm leading-relaxed text-fg-muted">
        ReviewStatistics: {formatStatisticsPlain(review.stats)}
      </p>
    </section>
  );
}
