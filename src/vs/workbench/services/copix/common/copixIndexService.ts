/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export const ICopixIndexService = createDecorator<ICopixIndexService>('copixIndexService');

export interface SemanticSearchResult {
	path: string;
	score: number;
	snippet: string;
}

export interface ICopixIndexService {
	readonly _serviceBrand: undefined;
	indexWorkspace(root: URI, token: CancellationToken): Promise<void>;
	semanticSearch(query: string, maxResults: number, token: CancellationToken): Promise<SemanticSearchResult[]>;
}
