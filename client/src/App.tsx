import { useState } from 'react'
import { FileDiffViewer } from './components/FileDiffViewer'
import { parseDiffToFileReview } from './utils/parseDiffToFileReview'
import './App.css'
import { DIFF_MULTIPLE_HUNKS } from '../../tests/fixtures/testDiffs'

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
    <div className="app">
      <header className="app-header">
        <h1>CodeLens</h1>
        <p className="tagline">Paste a diff, run a review (Day 1)</p>
      </header>

      <section className="panel">
        <label htmlFor="diff-input" className="label">
          Diff
        </label>
        <textarea
          id="diff-input"
          className="diff-input"
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          spellCheck={false}
          rows={14}
          disabled={loading}
        />
        <button
          type="button"
          className="review-button"
          onClick={runReview}
          disabled={loading || !diff.trim()}
        >
          {loading ? 'Reviewing…' : 'Review'}
        </button>
      </section>

      <FileDiffViewer fileReview={fileReview} />

      {error ? (
        <section className="panel error-panel" role="alert">
          <h2 className="panel-title">Error</h2>
          <pre className="output">{error}</pre>
        </section>
      ) : null}

      {resultText ? (
        <section className="panel">
          <h2 className="panel-title">Response</h2>
          <pre className="output">{resultText}</pre>
        </section>
      ) : null}
    </div>
  )
}
