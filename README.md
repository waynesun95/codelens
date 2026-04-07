# CodeLens

AI-powered code review platform. Paste a diff or enter a GitHub PR URL and get instant, structured code review powered by Claude.

## Architecture

```
codelens/
├── client/          # React + TypeScript (Vite)
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom hooks (useReview, useStreaming)
│       └── utils/        # Helpers (diff parsing, formatting)
├── server/          # Express API server
│   └── src/
│       └── index.ts      # API proxy to Claude
├── prompts/         # Shared prompt templates
│   └── review.ts         # The core review prompt
└── README.md
```

## How it works

1. User pastes a code diff or enters a GitHub PR URL
2. Frontend sends the diff to the Express backend
3. Backend forwards to Claude API with a structured review prompt
4. Claude returns JSON: issues with severity, line numbers, categories, suggestions
5. Frontend renders inline annotations on the diff with streaming

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Express, TypeScript
- **AI:** Anthropic Claude API (streaming)
- **Deployment:** Vercel (frontend) + Railway/Render (backend)

## Setup

### Prerequisites
- Node.js 18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/codelens.git
cd codelens

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env and add your ANTHROPIC_API_KEY

# Run both (from project root)
cd server && npm run dev    # Terminal 1: http://localhost:3001
cd client && npm run dev    # Terminal 2: http://localhost:5173
```

## Roadmap

- [x] Phase 1: Dashboard with paste-a-diff review
- [ ] Streaming response display
- [ ] GitHub PR URL integration
- [ ] Review history (local storage)
- [ ] Phase 2: GitHub bot (auto-review on PR open)
