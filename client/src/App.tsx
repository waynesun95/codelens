import { useMemo, useState } from 'react'
import { FileDiffViewer } from './components/FileDiffViewer/FileDiffViewer'
import { SummaryPanel } from './components/SummaryPanel/SummaryPanel'
import { useReviewStream } from './hooks/useReviewStream'
import { parseDiffToFileReview } from './utils/parseDiffToFileReview'
import { parsePartialReview } from './utils/parsePartialReview'
import { DIFF_NEW_FILE } from './fixtures/testDiffs'

export function App() {
  const [diff, setDiff] = useState(DIFF_NEW_FILE)
  const { streamingText, review: apiReview, loading, error, runReview } = useReviewStream()

  // Memoize so FileDiffViewer's inline-injection effect only re-runs when the
  // diff or the review changes — not on every parent render.
  const fileReview = useMemo(
    () => parseDiffToFileReview(diff, apiReview ?? undefined),
    [diff, apiReview],
  )

  // Drive the summary panel from the parsed review when available, otherwise
  // from a best-effort parse of the in-flight streaming text.
  const summaryData = useMemo(() => {
    if (apiReview) {
      return {
        summary: apiReview.summary,
        overallSeverity: apiReview.overallSeverity,
        stats: apiReview.stats,
        issueCount: apiReview.issues.length,
      }
    }
    if (streamingText) return parsePartialReview(streamingText)
    return null
  }, [apiReview, streamingText])

  return (
    <div className="flex flex-col gap-6 py-6 pb-12 text-left">
      <header>
        <h1 className="mb-1 text-3xl font-medium text-fg">CodeLens</h1>
        <p className="text-fg-muted">Paste a diff, run a review (Day 1)</p>
      </header>

      <section className="flex flex-col gap-2">
        <label htmlFor="diff-input" className="text-sm font-semibold text-fg">
          Diff
        </label>
        <textarea
          id="diff-input"
          className="box-border min-h-48 w-full resize-y rounded-lg border border-border bg-canvas-muted p-3 font-mono text-sm leading-snug text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-65"
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          spellCheck={false}
          rows={14}
          disabled={loading}
        />
        <button
          type="button"
          className="self-start rounded-lg bg-accent px-5 py-2 text-base font-semibold text-canvas hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => runReview(diff)}
          disabled={loading || !diff.trim()}
        >
          {loading ? 'Reviewing…' : 'Review'}
        </button>
      </section>

      {summaryData ? (
        <SummaryPanel {...summaryData} loading={loading} />
      ) : (
        <div
          className="flex flex-col gap-3 rounded-lg border border-border bg-canvas-muted/40 p-4"
          role="status"
          aria-live="polite"
        >
          {loading ? (
            <p className="m-0 animate-pulse text-sm italic text-fg-muted">
              Reviewing your diff…
            </p>
          ) : (
            <p className="m-0 text-sm text-fg-muted">
              Paste a diff above and click{' '}
              <span className="font-semibold text-fg">Review</span> to see an
              AI-powered code review here.
            </p>
          )}
        </div>
      )}

      <FileDiffViewer fileReview={fileReview} />

      {error ? (
        <section className="flex flex-col gap-2" role="alert">
          <h2 className="m-0 text-base font-semibold text-fg">Error</h2>
          <pre className="max-h-[min(70vh,40rem)] overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-red-300/40 bg-canvas-muted p-4 font-mono text-sm text-red-700 dark:border-red-400/35 dark:text-red-300">
            {error}
          </pre>
        </section>
      ) : null}

      {streamingText ? (
        <section className="flex flex-col gap-2">
          <h2 className="m-0 text-base font-semibold text-fg">Response</h2>
          <pre className="max-h-[min(70vh,40rem)] overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-border bg-canvas-muted p-4 font-mono text-sm text-fg">
            {streamingText}
          </pre>
        </section>
      ) : null}
    </div>
  )
}
