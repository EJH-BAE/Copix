/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { nullExtensionDescription } from '../../../services/extensions/common/extensions.js';
import { ChatAgentLocation } from '../../chat/common/constants.js';
import { ChatMessageRole, IChatMessage, IChatResponsePart, ILanguageModelChatInfoOptions, ILanguageModelChatMetadata, ILanguageModelChatMetadataAndIdentifier, ILanguageModelChatProvider, ILanguageModelChatRequestOptions, ILanguageModelChatResponse } from '../../chat/common/languageModels.js';
import { COPIX_CONFIGURATION_SECTION } from '../common/copix.js';
import { IModelRouter } from '../../../services/copix/common/copixModelProvider.js';
import { ChatMessage } from '../../../services/copix/common/copixModelProvider.js';

const COPIX_VENDOR = 'copix';
const COPIX_LOCAL_MODEL_ID = 'copix-local';
const COPIX_CLOUD_MODEL_ID = 'copix-cloud';

export class CopixLanguageModelProvider extends Disposable implements ILanguageModelChatProvider {

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	constructor(
		@IModelRouter private readonly modelRouter: IModelRouter,
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();
		this._register(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(COPIX_CONFIGURATION_SECTION)) {
				this._onDidChange.fire();
			}
		}));
	}

	async provideLanguageModelChatInfo(_options: ILanguageModelChatInfoOptions, token: CancellationToken): Promise<ILanguageModelChatMetadataAndIdentifier[]> {
		const models: ILanguageModelChatMetadataAndIdentifier[] = [];
		const local = this.modelRouter.getLocalProvider();
		const cloud = this.modelRouter.getCloudProvider();

		if (await local.healthCheck(token)) {
			models.push(this.createMetadata(COPIX_LOCAL_MODEL_ID, local.label, true));
		}
		if (await cloud.healthCheck(token)) {
			models.push(this.createMetadata(COPIX_CLOUD_MODEL_ID, cloud.label, models.length === 0));
		}
		if (!models.length) {
			const localModel = this.configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.local.model`) ?? 'local';
			models.push(this.createMetadata(COPIX_LOCAL_MODEL_ID, `${localModel} (offline)`, true));
		}
		return models;
	}

	async sendChatRequest(modelId: string, messages: IChatMessage[], _from: ExtensionIdentifier | undefined, _options: ILanguageModelChatRequestOptions, token: CancellationToken): Promise<ILanguageModelChatResponse> {
		const provider = modelId === COPIX_CLOUD_MODEL_ID
			? this.modelRouter.getCloudProvider()
			: this.modelRouter.getLocalProvider();

		const chatMessages = this.toCopixMessages(messages);

		const stream = async function* (): AsyncIterable<IChatResponsePart> {
			for await (const chunk of provider.streamChat({ messages: chatMessages }, token)) {
				if (chunk.type === 'text') {
					yield { type: 'text', value: chunk.content };
				}
			}
		};

		return {
			stream: stream(),
			result: Promise.resolve(undefined),
		};
	}

	async provideTokenCount(_modelId: string, message: string | IChatMessage, _token: CancellationToken): Promise<number> {
		const text = typeof message === 'string'
			? message
			: message.content.filter(p => p.type === 'text').map(p => (p as { value: string }).value).join('');
		return Math.ceil(text.length / 4);
	}

	private createMetadata(id: string, name: string, isDefault: boolean): ILanguageModelChatMetadataAndIdentifier {
		return {
			identifier: `${COPIX_VENDOR}/${id}`,
			metadata: {
				extension: nullExtensionDescription.identifier,
				id,
				vendor: COPIX_VENDOR,
				name,
				version: '1',
				family: COPIX_VENDOR,
				maxInputTokens: 128000,
				maxOutputTokens: 16384,
				isDefaultForLocation: isDefault ? { [ChatAgentLocation.Chat]: true } : {},
				isUserSelectable: true,
				capabilities: {
					toolCalling: true,
					agentMode: true,
				},
				detail: localize('copix.model.detail', 'Copix local or cloud model'),
			},
		};
	}

	private toCopixMessages(messages: IChatMessage[]): ChatMessage[] {
		return messages.map(m => ({
			role: m.role === ChatMessageRole.User ? 'user' as const : m.role === ChatMessageRole.Assistant ? 'assistant' as const : 'system' as const,
			content: m.content.filter(p => p.type === 'text').map(p => (p as { value: string }).value).join('\n'),
		}));
	}
}

export const COPIX_LANGUAGE_MODEL_VENDOR = COPIX_VENDOR;
