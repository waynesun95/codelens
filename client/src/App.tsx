import { useState } from 'react'
import { FileDiffViewer } from './components/FileDiffViewer/FileDiffViewer'
import { SeverityBadge } from './components/SeverityBadge/SeverityBadge'
import { SummaryPanel } from './components/SummaryPanel/SummaryPanel'
import type { ReviewResponse } from './types/review'
import { parseDiffToFileReview } from './utils/parseDiffToFileReview'
import { DIFF_MULTIPLE_HUNKS } from '../../tests/fixtures/testDiffs'

/** Mock structured review for SummaryPanel layout validation (replace with API state later). */
const MOCK_REVIEW: ReviewResponse = {
  summary:
    'The changes improve input validation and code formatting but introduce a critical bug in the refresh token logic. The addition of Zod validation and consistent error messaging are positive improvements.',
  overallSeverity: 'moderate',
  issues: [
    {
      id: 1,
      severity: 'critical',
      category: 'bug',
      lineNumber: 84,
      title: 'User existence not validated in refresh token flow',
      description:
        'The code fetches the user but does not check if the user exists before generating new tokens.',
      suggestion: "Add validation: if (!user) { throw new UnauthorizedError('User not found'); }",
    },
    {
      id: 2,
      severity: 'warning',
      category: 'security',
      lineNumber: 21,
      title: 'Email validation should be consistent across functions',
      description: 'Email validation with Zod is only applied in the login function but not in register.',
    },
  ],
  stats: {
    critical: 1,
    warning: 1,
    suggestion: 2,
    praise: 2,
  },
}

export function App() {
  const [diff, setDiff] = useState(DIFF_MULTIPLE_HUNKS)
  const [resultText, setResultText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileReview = parseDiffToFileReview(diff)

  async function runReview() {
    setLoading(true)
    setError(null)
    setResultText('')

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff }),
      })

      const payload: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === 'object' &&
          'error' in payload &&
          typeof (payload as { error: unknown }).error === 'string'
            ? (payload as { error: string }).error
            : `Request failed (${response.status})`
        setError(message)
        return
      }

      setResultText(JSON.stringify(payload, null, 2))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6 pb-12 text-left">
      <header>
        <h1 className="mb-1 text-3xl font-medium text-fg">CodeLens</h1>
        <p className="text-fg-muted">Paste a diff, run a review (Day 1)</p>
      </header>

      <section className="flex flex-col gap-2" aria-label="Severity badge preview">
        <h2 className="m-0 text-base font-semibold text-fg">Severity badges (preview)</h2>
        <p className="mb-1 text-sm text-fg-muted">
          Hardcoded variants for visual check — wire-up comes later.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <SeverityBadge severity="critical" />
          <SeverityBadge severity="warning" />
          <SeverityBadge severity="suggestion" />
          <SeverityBadge severity="praise" />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <SeverityBadge severity="critical" compact />
          <SeverityBadge severity="warning" compact />
          <SeverityBadge severity="suggestion" compact />
          <SeverityBadge severity="praise" compact />
        </div>
      </section>

      <section className="flex flex-col gap-2" aria-label="Summary panel preview">
        <h2 className="m-0 text-base font-semibold text-fg">Summary panel (preview)</h2>
        <p className="mb-1 text-sm text-fg-muted">Mock <code className="font-mono text-fg">ReviewResponse</code> — wire to API next.</p>
        <SummaryPanel review={MOCK_REVIEW} />
      </section>

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
          onClick={runReview}
          disabled={loading || !diff.trim()}
        >
          {loading ? 'Reviewing…' : 'Review'}
        </button>
      </section>

      <FileDiffViewer fileReview={fileReview} />

      {error ? (
        <section className="flex flex-col gap-2" role="alert">
          <h2 className="m-0 text-base font-semibold text-fg">Error</h2>
          <pre className="max-h-[min(70vh,40rem)] overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-red-300/40 bg-canvas-muted p-4 font-mono text-sm text-red-700 dark:border-red-400/35 dark:text-red-300">
            {error}
          </pre>
        </section>
      ) : null}

      {resultText ? (
        <section className="flex flex-col gap-2">
          <h2 className="m-0 text-base font-semibold text-fg">Response</h2>
          <pre className="max-h-[min(70vh,40rem)] overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border border-border bg-canvas-muted p-4 font-mono text-sm text-fg">
            {resultText}
          </pre>
        </section>
      ) : null}
    </div>
  )
}
