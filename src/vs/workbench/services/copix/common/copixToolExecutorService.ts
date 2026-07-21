/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export const ICopixToolExecutor = createDecorator<ICopixToolExecutor>('copixToolExecutor');

export interface ICopixToolExecutor {
	readonly _serviceBrand: undefined;
	readFile(args: Record<string, unknown>): Promise<string>;
	writeFile(args: Record<string, unknown>): Promise<string>;
	grep(args: Record<string, unknown>, token: CancellationToken): Promise<string>;
	runTerminal(args: Record<string, unknown>): Promise<string>;
	listDir(args: Record<string, unknown>): Promise<string>;
	semanticSearch(args: Record<string, unknown>, token: CancellationToken): Promise<string>;
}
