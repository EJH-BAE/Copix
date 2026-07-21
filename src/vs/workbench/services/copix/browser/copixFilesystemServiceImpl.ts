/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { isAbsolute } from '../../../../base/common/path.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { COPIX_CONFIGURATION_SECTION } from '../../../contrib/copix/common/copix.js';
import { ICopixFilesystemService } from '../common/copixFilesystemService.js';

export class CopixFilesystemService implements ICopixFilesystemService {
	declare readonly _serviceBrand: undefined;

	private readonly sessionGrants = new Set<string>();
	private readonly unrestrictedPaths: string[];

	constructor(
		@IFileService private readonly fileService: IFileService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IDialogService private readonly dialogService: IDialogService,
	) {
		this.unrestrictedPaths = this.configurationService.getValue<string[]>(`${COPIX_CONFIGURATION_SECTION}.filesystem.unrestrictedPaths`) ?? [];
		this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(`${COPIX_CONFIGURATION_SECTION}.filesystem.unrestrictedPaths`)) {
				this.unrestrictedPaths.length = 0;
				this.unrestrictedPaths.push(...(this.configurationService.getValue<string[]>(`${COPIX_CONFIGURATION_SECTION}.filesystem.unrestrictedPaths`) ?? []));
			}
		});
	}

	resolvePath(path: string): URI {
		const trimmed = path.trim();
		if (isAbsolute(trimmed)) {
			return URI.file(trimmed);
		}
		const folders = this.workspaceContextService.getWorkspace().folders;
		if (folders.length) {
			return URI.joinPath(folders[0].uri, trimmed);
		}
		return URI.file(trimmed);
	}

	isPathAllowed(uri: URI): boolean {
		const key = uri.fsPath.toLowerCase();
		if (this.sessionGrants.has(key)) {
			return true;
		}
		for (const unrestricted of this.unrestrictedPaths) {
			if (key.startsWith(unrestricted.toLowerCase())) {
				return true;
			}
		}
		const folders = this.workspaceContextService.getWorkspace().folders;
		for (const folder of folders) {
			if (key.startsWith(folder.uri.fsPath.toLowerCase())) {
				return true;
			}
		}
		return false;
	}

	async requestPathAccess(uri: URI): Promise<boolean> {
		if (this.isPathAllowed(uri)) {
			return true;
		}
		const { confirmed } = await this.dialogService.confirm({
			message: `Allow Copix to access this path?`,
			detail: uri.fsPath,
			primaryButton: 'Allow',
		});
		if (confirmed) {
			this.sessionGrants.add(uri.fsPath.toLowerCase());
		}
		return confirmed;
	}

	async readFileText(uri: URI): Promise<string> {
		const stat = await this.fileService.resolve(uri);
		if (stat.isDirectory) {
			throw new Error('Path is a directory');
		}
		const content = await this.fileService.readFile(uri);
		return content.value.toString();
	}

	async writeFileText(uri: URI, content: string): Promise<void> {
		await this.fileService.writeFile(uri, VSBuffer.fromString(content));
	}

	async listDirectory(uri: URI): Promise<string[]> {
		const stat = await this.fileService.resolve(uri, { resolveMetadata: true });
		if (!stat.children) {
			return [];
		}
		return stat.children.map(c => `${c.isDirectory ? '[dir]' : '[file]'} ${c.name}`);
	}
}
