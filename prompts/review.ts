/**
 * The core review prompt for CodeLens.
 *
 * This prompt instructs Claude to analyze a code diff and return
 * structured JSON with issues, severity levels, and suggestions.
 *
 * This is the "AI engine" that both the dashboard (Phase 1)
 * and the GitHub bot (Phase 2) will share.
 */
export function getReviewPrompt(diff: string): string {
  return `You are an expert senior software engineer performing a code review.
Analyze the following code diff and provide a structured review.

Return ONLY valid JSON with no additional text, in this exact format:

{
  "summary": "A 2-3 sentence overall assessment of the changes",
  "overallSeverity": "clean" | "minor" | "moderate" | "critical",
  "issues": [
    {
      "id": 1,
      "severity": "critical" | "warning" | "suggestion" | "praise",
      "category": "security" | "performance" | "bug" | "style" | "maintainability" | "best-practice",
      "lineNumber": <number or null if not line-specific>,
      "title": "Short title of the issue",
      "description": "Detailed explanation of the issue",
      "suggestion": "Specific code suggestion or fix (if applicable)"
    }
  ],
  "stats": {
    "critical": <count>,
    "warning": <count>,
    "suggestion": <count>,
    "praise": <count>
  }
}

Guidelines:
- Be specific and actionable — don't just say "this could be improved"
- Include line numbers when possible (from the diff)
- Include at least one "praise" item if there's anything done well
- Focus on: security vulnerabilities, potential bugs, performance issues, 
  missing error handling, type safety, and code clarity
- For TypeScript/JavaScript: check for proper typing, null handling, 
  async/await correctness, and React best practices if applicable
- Keep the total number of issues reasonable (3-10 for most diffs)

Here is the diff to review:

\`\`\`diff
${diff}
\`\`\``;
}
