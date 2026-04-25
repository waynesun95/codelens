import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReviewResponse } from '../types/review'

type StreamEvent =
  | { type: 'text'; content: string }
  | { type: 'done' }
  | { type: 'error'; content?: string }

interface UseReviewStreamResult {
  streamingText: string
  review: ReviewResponse | null
  loading: boolean
  error: string | null
  runReview: (diff: string) => Promise<void>
  cancel: () => void
}

/**
 * Streams a review from `/api/review/stream` (SSE), exposing the accumulated
 * text as it arrives and the parsed `ReviewResponse` once the stream completes.
 *
 * Calling `runReview` while a previous run is in flight aborts the previous run.
 * The active fetch is also aborted on unmount.
 */
export function useReviewStream(): UseReviewStreamResult {
  const [streamingText, setStreamingText] = useState('')
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  useEffect(() => () => cancel(), [cancel])

  const runReview = useCallback(async (diff: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setStreamingText('')
    setReview(null)

    try {
      const response = await fetch('/api/review/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`Request failed (${response.status})`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const messages = buffer.split('\n\n')
        buffer = messages.pop() ?? ''

        for (const message of messages) {
          const dataLine = message.split('\n').find((line) => line.startsWith('data: '))
          if (!dataLine) continue
          const event = JSON.parse(dataLine.slice(6)) as StreamEvent

          if (event.type === 'text') {
            accumulated += event.content
            setStreamingText(accumulated)
          } else if (event.type === 'error') {
            throw new Error(event.content ?? 'Stream error')
          }
        }
      }

      const cleaned = accumulated
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim()
      setReview(JSON.parse(cleaned) as ReviewResponse)
    } catch (err) {
      if (controller.signal.aborted) return
      const message = err instanceof Error ? err.message : 'Network error'
      setError(message)
    } finally {
      // Only flip loading off if this run is still the active one. Otherwise a
      // newer runReview call has already taken over and set its own loading state.
      if (abortRef.current === controller) {
        abortRef.current = null
        setLoading(false)
      }
    }
  }, [])

  return { streamingText, review, loading, error, runReview, cancel }
}
