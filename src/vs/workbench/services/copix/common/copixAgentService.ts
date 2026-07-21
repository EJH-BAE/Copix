/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { AgentEvent } from '../../../contrib/copix/common/copixAgentEvents.js';
import { ICopixAgentRunContext } from './copixAgentRunContext.js';

export const ICopixAgentService = createDecorator<ICopixAgentService>('copixAgentService');

export interface ICopixAgentService {
	readonly _serviceBrand: undefined;
	readonly onDidEmitEvent: Event<AgentEvent>;
	readonly isRunning: boolean;
	sendMessage(message: string, token: CancellationToken, context?: ICopixAgentRunContext): Promise<void>;
	cancel(): void;
	clearHistory(): void;
	getHistory(): ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>;
}
