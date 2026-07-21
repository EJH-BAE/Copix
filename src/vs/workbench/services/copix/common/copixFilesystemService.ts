/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export const ICopixFilesystemService = createDecorator<ICopixFilesystemService>('copixFilesystemService');

export interface ICopixFilesystemService {
	readonly _serviceBrand: undefined;
	isPathAllowed(uri: URI): boolean;
	requestPathAccess(uri: URI): Promise<boolean>;
	readFileText(uri: URI): Promise<string>;
	writeFileText(uri: URI, content: string): Promise<void>;
	listDirectory(uri: URI): Promise<string[]>;
	resolvePath(path: string): URI;
}
