# CodeLens — AI Code Review Platform

## What This Project Is

CodeLens is an AI-powered code review tool. Users paste a code diff (or enter a GitHub PR URL), and the app analyzes it using Claude's API, returning structured, actionable feedback with severity levels, categories, line-specific annotations, and suggestions.

This is a portfolio project designed to demonstrate full-stack AI product development: React + TypeScript frontend, Express/TypeScript backend, Claude API integration with streaming, prompt engineering for structured output, and GitHub API integration.

## Architecture

```
React Frontend (Vite + TypeScript)
  - Monaco Editor or diff viewer for code input
  - Review results with inline annotations
  - Severity filters, stats dashboard, summary panel
  - Streaming response display
        │
        │  HTTP POST /api/review  or  /api/review/stream (SSE)
        ▼
Express API Layer (TypeScript, port 3001)
  ├── Input validation
  ├── Prompt engineering layer (prompts/review.ts)
  ├── Response parser (normalizes Claude output to typed interfaces)
  └── Rate limiting
        │
        ▼
Claude API (Sonnet) → Returns structured JSON review
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite (dev server on port 5173)
- **Backend:** Express, TypeScript (port 3001)
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`) — both standard and streaming endpoints
- **Styling:** TBD (likely Tailwind CSS)
- **Diff viewer:** `react-diff-viewer-continued` (planned for Phase 2)
- **Deployment target:** Vercel (frontend) + Railway or Render (backend)

## Project Structure

```
codelens/
├── client/              # React + Vite frontend
│   └── src/
│       ├── components/  # UI components (DiffViewer, ReviewPanel, SeverityBadge, etc.)
│       ├── hooks/       # Custom hooks (useReview, useStreaming)
│       └── utils/       # Helpers (diff parsing, formatting)
├── server/              # Express API server
│   └── src/
│       └── index.ts     # API proxy to Claude with /api/review and /api/review/stream
├── prompts/             # Shared prompt templates
│   └── review.ts        # Core review prompt — the "brain" of the project
├── .env.example         # ANTHROPIC_API_KEY and PORT
└── README.md
```

## Core Data Model

The Claude API returns structured JSON in this shape. All frontend components should consume this interface:

```typescript
interface ReviewResponse {
  summary: string;                    // 2-3 sentence overall assessment
  overallSeverity: "clean" | "minor" | "moderate" | "critical";
  issues: Issue[];
  stats: {
    critical: number;
    warning: number;
    suggestion: number;
    praise: number;
  };
}

interface Issue {
  id: number;
  severity: "critical" | "warning" | "suggestion" | "praise";
  category: "security" | "performance" | "bug" | "style" | "maintainability" | "best-practice";
  lineNumber: number | null;
  title: string;
  description: string;
  suggestion?: string;
}
```

## API Endpoints

### `POST /api/review`
- **Body:** `{ diff: string }`
- **Response:** `ReviewResponse` JSON
- Non-streaming, waits for full Claude response then returns parsed JSON

### `POST /api/review/stream`
- **Body:** `{ diff: string }`
- **Response:** Server-Sent Events (SSE)
- Events: `{ type: "text", content: string }` and `{ type: "done" }`
- Frontend accumulates text chunks, parses full JSON when "done" event fires

### `GET /api/health`
- **Response:** `{ status: "ok" }`

## Coding Conventions

- **TypeScript strict mode** — no `any` types unless absolutely necessary
- **Functional React components** with hooks — no class components
- **Named exports** for components and utilities
- **Interface over type** for object shapes
- **Descriptive variable names** — no abbreviations
- **Error handling** — always handle loading, error, and empty states in UI
- **No inline styles** — use CSS modules or Tailwind utility classes
- **File naming:** PascalCase for components (`ReviewPanel.tsx`), camelCase for utilities (`parseReview.ts`)

## Color Coding for Severity

Consistent across all UI components:
- **Critical:** Red (`#EF4444` / red-500)
- **Warning:** Amber (`#F59E0B` / amber-500)
- **Suggestion:** Blue (`#3B82F6` / blue-500)
- **Praise:** Green (`#22C55E` / green-500)

## Build Plan (Phased)

### Phase 1: Scaffold + First API Call (Days 1-2)
- Day 1: Create GitHub repo, npm install server, scaffold Vite React app
- Day 2: Hardcode a diff, POST to /api/review, display raw JSON response
- **Checkpoint:** Paste code → hit submit → see Claude's review on screen

### Phase 2: Diff Viewer + Structured Reviews (Days 3-5)
- Day 3: Prompt engineering — iterate on review prompt for consistent JSON output
- Day 4: Diff display component with react-diff-viewer-continued, inline annotations color-coded by severity
- Day 5: Summary panel with stats, implement streaming via SSE
- **Checkpoint:** Polished diff viewer with annotations, severity badges, streaming

### Phase 3: GitHub Integration + Polish (Days 6-8)
- Day 6: GitHub PR URL input → fetch diff via GitHub API → feed into review pipeline
- Day 7: UI polish — typography, spacing, responsive layout, dark mode
- Day 8: Review history (localStorage), professional README with screenshots, deploy
- **Checkpoint:** Deployed, portfolio-ready app

### Phase 4: GitHub Bot — Stretch (Days 9-12)
- Days 9-10: Register GitHub App, webhook listener for pull_request.opened, auto-review with inline comments
- Days 11-12: .codelens.yml config (ignore patterns, severity thresholds), test on real repos
- **Checkpoint:** Working GitHub bot that auto-reviews PRs

## Current Status

Starting Day 1. Server scaffold exists with working endpoints. React client needs to be created.

## Important Context for AI Assistants

- The review prompt in `prompts/review.ts` is the core IP of this project. Changes to it should be deliberate and tested with multiple diffs.
- Both `/api/review` and `/api/review/stream` share the same prompt — keep them in sync.
- The frontend should gracefully handle cases where Claude returns malformed JSON (the server already has a fallback for this).
- Phase 1 is the priority. Don't over-engineer early. Get ugly-but-working first, then iterate.
- When suggesting UI components, keep them as standalone functional components with clear props interfaces.
