/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { COPIX_CONFIGURATION_SECTION } from '../../../contrib/copix/common/copix.js';
import { IModelProvider, IModelRouter, ModelRouting } from '../../common/copixModelProvider.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { CloudProvider } from './providers/cloudProvider.js';
import { LlamaCppProvider } from './providers/llamaCppProvider.js';
import { OllamaProvider } from './providers/ollamaProvider.js';

export class CopixModelRouter implements IModelRouter {
	declare readonly _serviceBrand: undefined;

	private readonly ollama: OllamaProvider;
	private readonly llamaCpp: LlamaCppProvider;
	private readonly cloud: CloudProvider;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ISecretStorageService secretStorageService: ISecretStorageService,
	) {
		this.ollama = new OllamaProvider(configurationService);
		this.llamaCpp = new LlamaCppProvider(configurationService);
		this.cloud = new CloudProvider(configurationService, secretStorageService);
	}

	getLocalProvider(): IModelProvider {
		const backend = this.configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.local.backend`) ?? 'ollama';
		return backend === 'llama-cpp' ? this.llamaCpp : this.ollama;
	}

	getCloudProvider(): IModelProvider {
		return this.cloud;
	}

	async getActiveProvider(token: CancellationToken): Promise<IModelProvider | undefined> {
		const routing = this.configurationService.getValue<ModelRouting>(`${COPIX_CONFIGURATION_SECTION}.models.routing`) ?? 'local-first';
		const local = this.getLocalProvider();

		if (routing === 'cloud-only') {
			return (await this.cloud.healthCheck(token)) ? this.cloud : undefined;
		}
		if (routing === 'local-only') {
			return (await local.healthCheck(token)) ? local : undefined;
		}

		if (await local.healthCheck(token)) {
			return local;
		}
		if (await this.cloud.healthCheck(token)) {
			return this.cloud;
		}
		return undefined;
	}
}
