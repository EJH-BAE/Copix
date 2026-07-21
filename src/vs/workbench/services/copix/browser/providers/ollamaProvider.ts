/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { COPIX_CONFIGURATION_SECTION } from '../../../../contrib/copix/common/copix.js';
import { OpenAiCompatibleProvider, createAbortSignal } from './openAiCompatibleProvider.js';

export class OllamaProvider extends OpenAiCompatibleProvider {
	constructor(
		configurationService: IConfigurationService,
	) {
		super({
			id: 'ollama',
			label: 'Ollama',
			baseUrl: configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.local.endpoint`) ?? 'http://127.0.0.1:11434/v1',
			defaultModel: configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.local.model`) ?? 'qwen2.5-coder:7b',
			supportsToolCalling: true,
		});
	}

	override async healthCheck(token: import('../../../../../base/common/cancellation.js').CancellationToken): Promise<boolean> {
		try {
			const base = this.options.baseUrl.replace(/\/v1\/?$/, '');
			const response = await fetch(`${base}/api/tags`, {
				signal: createAbortSignal(token),
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}
