import { useMemo, useState } from 'react';
import {
	fileGlyph,
	sumChanges,
	type FileChange,
} from '../utils/fileChanges';

interface Props {
	files: FileChange[];
	onOpenFile: (path: string) => void;
	selectedPath?: string;
}

export function ChangesPanel({ files, onOpenFile, selectedPath }: Props) {
	const totals = useMemo(() => sumChanges(files), [files]);
	const [openPath, setOpenPath] = useState<string | undefined>();

	const active = files.find(f => f.path === openPath);

	return (
		<div className="changes-panel">
			<div className="changes-panel-head">
				<div className="changes-summary">
					<span className="changes-summary-label">Changes</span>
					{totals.added > 0 && <span className="commit-add">+{totals.added}</span>}
					{totals.removed > 0 && <span className="commit-del">-{totals.removed}</span>}
				</div>
				<span className="changes-panel-meta">
					{files.length} file{files.length === 1 ? '' : 's'}
				</span>
			</div>

			{!files.length ? (
				<div className="changes-empty">
					<p>No file changes yet</p>
					<p className="muted-xs">Edits from the agent will show up here</p>
				</div>
			) : (
				<div className="changes-body">
					<ul className="changes-file-list">
						{files.map(f => (
							<li key={f.path}>
								<button
									type="button"
									className={`changes-file-row${(selectedPath === f.path || openPath === f.path) ? ' active' : ''}`}
									onClick={() => {
										setOpenPath(f.path);
										onOpenFile(f.path);
									}}
									title={f.path}
								>
									<span className="files-changed-icon" aria-hidden>{fileGlyph(f.name)}</span>
									<span className="files-changed-name">{f.name}</span>
									<span className="files-changed-stats">
										{f.added > 0 && <span className="commit-add">+{f.added}</span>}
										{f.removed > 0 && <span className="commit-del">-{f.removed}</span>}
									</span>
								</button>
								{(openPath === f.path || selectedPath === f.path) && f.preview && (
									<pre className="changes-diff-preview">{f.preview}</pre>
								)}
							</li>
						))}
					</ul>
					{active?.preview && (
						<div className="changes-detail">
							<div className="changes-detail-path">{active.path}</div>
							<pre className="changes-diff-preview large">{active.preview}</pre>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
