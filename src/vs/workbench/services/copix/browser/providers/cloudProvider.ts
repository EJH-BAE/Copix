/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { COPIX_CONFIGURATION_SECTION } from '../../../../contrib/copix/common/copix.js';
import { OpenAiCompatibleProvider } from './openAiCompatibleProvider.js';

const COPIX_CLOUD_API_KEY = 'copix.cloud.apiKey';

export class CloudProvider extends OpenAiCompatibleProvider {
	private cachedApiKey: string | undefined;

	constructor(
		private readonly configurationService: IConfigurationService,
		private readonly secretStorageService: ISecretStorageService,
	) {
		super({
			id: 'cloud',
			label: 'Cloud',
			baseUrl: configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.cloud.endpoint`) ?? 'https://api.openai.com/v1',
			defaultModel: configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.cloud.model`) ?? 'gpt-4o-mini',
			supportsToolCalling: true,
		});
	}

	override async healthCheck(token: import('../../../../../base/common/cancellation.js').CancellationToken): Promise<boolean> {
		const apiKey = await this.getApiKey();
		if (!apiKey) {
			return false;
		}
		return super.healthCheck(token);
	}

	protected override getHeaders(): Record<string, string> {
		const headers = super.getHeaders();
		if (this.cachedApiKey) {
			headers['Authorization'] = `Bearer ${this.cachedApiKey}`;
		}
		return headers;
	}

	async *streamChat(request: import('../../common/copixModelProvider.js').ChatRequest, token: import('../../../../../base/common/cancellation.js').CancellationToken): AsyncIterable<import('../../common/copixModelProvider.js').ChatChunk> {
		this.cachedApiKey = await this.getApiKey();
		if (!this.cachedApiKey) {
			throw new Error('Cloud API key is not configured. Set copix.models.cloud.apiKey in settings.');
		}
		yield* super.streamChat(request, token);
	}

	async setApiKey(key: string): Promise<void> {
		await this.secretStorageService.set(COPIX_CLOUD_API_KEY, key);
		this.cachedApiKey = key;
	}

	private async getApiKey(): Promise<string | undefined> {
		if (this.cachedApiKey) {
			return this.cachedApiKey;
		}
		const fromSecret = await this.secretStorageService.get(COPIX_CLOUD_API_KEY);
		if (fromSecret) {
			this.cachedApiKey = fromSecret;
			return fromSecret;
		}
		const fromConfig = this.configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.cloud.apiKey`);
		return fromConfig || undefined;
	}
}

export { COPIX_CLOUD_API_KEY };
