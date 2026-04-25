import type { CodeIssue } from "../../types/review";
import { SeverityBadge } from "../SeverityBadge/SeverityBadge";

export type DiffInlineIssueProps = Pick<
  CodeIssue,
  "severity" | "category" | "title" | "description" | "suggestion"
> & {
  className?: string;
};

function formatIssueCategory(category: CodeIssue["category"]): string {
  return category
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function DiffInlineIssue({
  severity,
  category,
  title,
  description,
  suggestion,
  className,
}: DiffInlineIssueProps) {
  const rootClass = [
    "flex w-full max-w-none flex-col gap-2 rounded-md border border-border bg-canvas p-3 text-left shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={rootClass} aria-label={title}>
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={severity} />
        <span className="text-[0.7rem] font-medium text-fg-muted">{formatIssueCategory(category)}</span>
      </div>
      <h3 className="m-0 text-[0.8rem] font-semibold leading-snug text-fg">{title}</h3>
      <p className="m-0 text-[0.72rem] leading-relaxed text-fg-muted">{description}</p>
      {suggestion ? (
        <p className="m-0 border-t border-border pt-2 text-[0.72rem] leading-relaxed text-fg">
          <span className="font-semibold text-fg-muted">Suggestion: </span>
          {suggestion}
        </p>
      ) : null}
    </article>
  );
}
