/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { ICopixAgentService } from '../../../services/copix/common/copixAgentService.js';
import { getCopixToolLabel } from '../common/copixAgentProgress.js';
import { IChatAgentHistoryEntry, IChatAgentImplementation, IChatAgentRequest, IChatAgentResult } from '../../chat/common/participants/chatAgents.js';
import { IChatProgress } from '../../chat/common/chatService/chatService.js';

export class CopixChatAgent implements IChatAgentImplementation {

	constructor(
		private readonly copixAgentService: ICopixAgentService,
	) { }

	async invoke(
		request: IChatAgentRequest,
		progress: (parts: IChatProgress[]) => void,
		_history: IChatAgentHistoryEntry[],
		token: CancellationToken,
	): Promise<IChatAgentResult> {
		let accumulated = '';
		const useNativeTools = true;

		await this.copixAgentService.sendMessage(request.message, token, {
			sessionResource: request.sessionResource,
			requestId: request.requestId,
			attachments: request.variables.variables,
			onTextDelta: (content) => {
				accumulated += content;
				progress([{
					kind: 'markdownContent',
					content: new MarkdownString(accumulated),
				}]);
			},
			onStatus: (message, state) => {
				if (state === 'error') {
					progress([{
						kind: 'warning',
						content: new MarkdownString(message),
					}]);
					return;
				}
				if (state === 'done') {
					return;
				}
				progress([{
					kind: 'progressMessage',
					content: new MarkdownString(message),
					shimmer: state === 'active',
				}]);
			},
			onToolStart: useNativeTools ? undefined : (tool) => {
				progress([{
					kind: 'progressMessage',
					content: new MarkdownString(getCopixToolLabel(tool, 'active')),
					shimmer: true,
				}]);
			},
			onToolEnd: useNativeTools ? undefined : (tool) => {
				progress([{
					kind: 'progressMessage',
					content: new MarkdownString(getCopixToolLabel(tool, 'done')),
					shimmer: false,
				}]);
			},
		});

		return {};
	}
}
