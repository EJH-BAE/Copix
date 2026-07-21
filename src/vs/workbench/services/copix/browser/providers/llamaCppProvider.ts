/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { COPIX_CONFIGURATION_SECTION } from '../../../../contrib/copix/common/copix.js';
import { OpenAiCompatibleProvider } from './openAiCompatibleProvider.js';

export class LlamaCppProvider extends OpenAiCompatibleProvider {
	constructor(
		configurationService: IConfigurationService,
	) {
		super({
			id: 'llama-cpp',
			label: 'llama.cpp',
			baseUrl: configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.llamaCpp.endpoint`) ?? 'http://127.0.0.1:8080/v1',
			defaultModel: configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.llamaCpp.model`) ?? 'local-model',
			supportsToolCalling: true,
		});
	}
}
