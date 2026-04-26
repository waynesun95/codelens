import type {
  IssueSeverity,
  OverallSeverity,
  ReviewStatistics,
} from "../../types/review";
import { SeverityBadge } from "../SeverityBadge/SeverityBadge";

/** Display order for stats badges (not coupled to prompt/schema source of truth). */
const SEVERITY_DISPLAY_ORDER: readonly IssueSeverity[] = [
  "critical",
  "warning",
  "suggestion",
  "praise",
];

interface SummaryPanelProps {
  summary: string;
  overallSeverity: OverallSeverity | null;
  stats: ReviewStatistics;
  issueCount: number;
  /** When true, signals that fields are still being streamed in. */
  loading?: boolean;
}

export function SummaryPanel({
  summary,
  overallSeverity,
  stats,
  issueCount,
  loading = false,
}: SummaryPanelProps) {
  return (
    <section
      className="flex flex-col gap-3 rounded-lg border border-border bg-canvas-muted/40 p-4"
      aria-labelledby="summary-panel-heading"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 id="summary-panel-heading" className="m-0 text-base font-semibold text-fg">
          Review summary
        </h2>
        {loading ? (
          <span
            className="inline-flex items-center gap-1.5 text-xs italic text-fg-muted"
            role="status"
            aria-live="polite"
          >
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-accent"
              aria-hidden
            />
            Streaming review…
          </span>
        ) : null}
      </div>

      {summary ? (
        <p className="m-0 text-sm leading-relaxed text-fg">{summary}</p>
      ) : (
        <p className="m-0 text-sm italic leading-relaxed text-fg-muted">
          Awaiting review…
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {overallSeverity ? <SeverityBadge severity={overallSeverity} /> : null}
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
              <SeverityBadge severity={key} count={stats[key]} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
