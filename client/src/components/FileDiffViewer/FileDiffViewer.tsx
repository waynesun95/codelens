import { useMemo, useState } from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import type { FileReview } from "../../types/review";
import { parseUnifiedDiffToCode } from "../../utils/parseDiffToFileReview";
import "./FileDiffViewer.css";

interface FileDiffViewerProps {
  fileReview: FileReview;
}

export function FileDiffViewer({ fileReview }: FileDiffViewerProps) {
  const [splitView, setSplitView] = useState(true);
  const [showDiffOnly, setShowDiffOnly] = useState(true);

  const parsedDiff = useMemo(() => parseUnifiedDiffToCode(fileReview.diff), [fileReview.diff]);

  return (
    <section className="panel diff-viewer-panel">
      <div className="panel-header">
        <h2 className="panel-title">Diff Preview</h2>
        <span className="file-chip">{fileReview.filename}</span>
      </div>

      <div className="diff-controls">
        <label className="checkbox-control" htmlFor="split-view">
          <input
            id="split-view"
            type="checkbox"
            checked={splitView}
            onChange={(event) => setSplitView(event.target.checked)}
          />
          Split view
        </label>

        <label className="checkbox-control" htmlFor="show-diff-only">
          <input
            id="show-diff-only"
            type="checkbox"
            checked={showDiffOnly}
            onChange={(event) => setShowDiffOnly(event.target.checked)}
          />
          Show changes only
        </label>
      </div>

      <div className="diff-surface">
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
