import { useMemo, useState } from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import type { FileReview } from "../../types/review";
import { parseUnifiedDiffToCode } from "../../utils/parseDiffToFileReview";

interface FileDiffViewerProps {
  fileReview: FileReview;
}

export function FileDiffViewer({ fileReview }: FileDiffViewerProps) {
  const [splitView, setSplitView] = useState(true);
  const [showDiffOnly, setShowDiffOnly] = useState(true);

  const parsedDiff = useMemo(() => parseUnifiedDiffToCode(fileReview.diff), [fileReview.diff]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-base font-semibold text-fg">Diff Preview</h2>
        <span className="rounded-full border border-border bg-canvas-muted px-2.5 py-0.5 font-mono text-xs text-fg-muted">
          {fileReview.filename}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fg" htmlFor="split-view">
          <input
            id="split-view"
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-accent"
            checked={splitView}
            onChange={(event) => setSplitView(event.target.checked)}
          />
          Split view
        </label>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fg" htmlFor="show-diff-only">
          <input
            id="show-diff-only"
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-accent"
            checked={showDiffOnly}
            onChange={(event) => setShowDiffOnly(event.target.checked)}
          />
          Show changes only
        </label>
      </div>

      <div className="diff-surface overflow-x-auto rounded-lg border border-border">
        <DiffViewer
          oldValue={parsedDiff.oldCode}
          newValue={parsedDiff.newCode}
          compareMethod={DiffMethod.LINES}
          splitView={splitView}
          showDiffOnly={showDiffOnly}
          leftTitle="Before"
          rightTitle="After"
          useDarkTheme={false}
        />
      </div>
    </section>
  );
}
