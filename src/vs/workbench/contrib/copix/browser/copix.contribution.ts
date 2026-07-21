/*---------------------------------------------------------------------------------------------

 *  Copyright (c) Copix Contributors. All rights reserved.

 *  Licensed under the MIT License.

 *--------------------------------------------------------------------------------------------*/



import './copixViewContribution.js';



import { CancellationTokenSource } from '../../../../base/common/cancellation.js';

import { Disposable } from '../../../../base/common/lifecycle.js';

import { localize } from '../../../../nls.js';

import { Registry } from '../../../../platform/registry/common/platform.js';

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';

import { IConfigurationRegistry, Extensions as ConfigurationExtensions, ConfigurationScope } from '../../../../platform/configuration/common/configurationRegistry.js';

import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from '../../../common/contributions.js';

import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.js';

import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';

import { COPIX_CONFIGURATION_SECTION } from '../common/copix.js';

import { ICopixAgentService } from '../../../services/copix/common/copixAgentService.js';

import { CopixAgentService } from '../../../services/copix/browser/copixAgentServiceImpl.js';

import { IModelRouter } from '../../../services/copix/common/copixModelProvider.js';

import { CopixModelRouter } from '../../../services/copix/browser/copixModelRouter.js';

import { ICopixFilesystemService } from '../../../services/copix/common/copixFilesystemService.js';

import { CopixFilesystemService } from '../../../services/copix/browser/copixFilesystemServiceImpl.js';

import { ICopixIndexService } from '../../../services/copix/common/copixIndexService.js';

import { CopixIndexService } from '../../../services/copix/browser/copixIndexServiceImpl.js';

import { CopixCursorExperience } from './copixCursorExperience.js';

import { CopixNativeToolsContribution } from './copixNativeToolsContribution.js';

import { CopixToolExecutor } from '../../../services/copix/browser/copixToolExecutorImpl.js';
import { ICopixToolExecutor } from '../../../services/copix/common/copixToolExecutorService.js';



// Services

registerSingleton(ICopixFilesystemService, CopixFilesystemService, InstantiationType.Delayed);

registerSingleton(ICopixIndexService, CopixIndexService, InstantiationType.Delayed);

registerSingleton(IModelRouter, CopixModelRouter, InstantiationType.Delayed);

registerSingleton(ICopixToolExecutor, CopixToolExecutor, InstantiationType.Delayed);

registerSingleton(ICopixAgentService, CopixAgentService, InstantiationType.Delayed);



// Configuration

const copixConfigurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);

copixConfigurationRegistry.registerConfiguration({

	id: COPIX_CONFIGURATION_SECTION,

	title: localize('copix.configuration.title', 'Copix'),

	type: 'object',

	properties: {

		'copix.models.routing': {

			type: 'string',

			enum: ['local-first', 'cloud-only', 'local-only'],

			default: 'local-first',

			description: localize('copix.models.routing', 'Model routing strategy.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.local.backend': {

			type: 'string',

			enum: ['ollama', 'llama-cpp'],

			default: 'ollama',

			description: localize('copix.models.local.backend', 'Local inference backend.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.local.endpoint': {

			type: 'string',

			default: 'http://127.0.0.1:11434/v1',

			description: localize('copix.models.local.endpoint', 'OpenAI-compatible endpoint for the local model.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.local.model': {

			type: 'string',

			default: 'qwen2.5-coder:14b',

			description: localize('copix.models.local.model', 'Default local model name. qwen2.5-coder:14b fits well on 32GB VRAM GPUs.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.llamaCpp.endpoint': {

			type: 'string',

			default: 'http://127.0.0.1:8080/v1',

			description: localize('copix.models.llamaCpp.endpoint', 'llama.cpp server endpoint.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.llamaCpp.model': {

			type: 'string',

			default: 'local-model',

			description: localize('copix.models.llamaCpp.model', 'llama.cpp model id.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.cloud.endpoint': {

			type: 'string',

			default: 'https://api.openai.com/v1',

			description: localize('copix.models.cloud.endpoint', 'Cloud provider OpenAI-compatible endpoint.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.cloud.model': {

			type: 'string',

			default: 'gpt-4o-mini',

			description: localize('copix.models.cloud.model', 'Cloud model id.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.models.cloud.apiKey': {

			type: 'string',

			default: '',

			description: localize('copix.models.cloud.apiKey', 'Cloud API key (stored in OS keychain when set via Copix settings).'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.filesystem.unrestrictedPaths': {

			type: 'array',

			items: { type: 'string' },

			default: [],

			description: localize('copix.filesystem.unrestrictedPaths', 'Additional paths the agent may access without prompting.'),

			scope: ConfigurationScope.APPLICATION,

		},

		'copix.index.autoIndex': {

			type: 'boolean',

			default: true,

			description: localize('copix.index.autoIndex', 'Automatically index the workspace for semantic search.'),

			scope: ConfigurationScope.APPLICATION,

		},

	},

});



copixConfigurationRegistry.registerDefaultConfigurations([{

	overrides: {

		'window.autoDetectColorScheme': true,

		'window.commandCenter': true,

		'github.copilot.enable': false,

		'github.copilot.nextEditSuggestions.enabled': false,

		'workbench.secondarySideBar.defaultVisibility': 'maximizedInWorkspace',

		'workbench.secondarySideBar.forceMaximized': true,

		'workbench.startupEditor': 'none',

		'workbench.welcomePage.experimentalOnboarding': false,

		'workbench.welcome.enabled': false,

		'workbench.chat.hideWelcomeView': true,

	},

}]);



class CopixIndexContribution extends Disposable {

	constructor(

		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,

		@ICopixIndexService private readonly indexService: ICopixIndexService,

	) {

		super();

		this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this.indexWorkspace()));

		this.indexWorkspace();

	}



	private indexWorkspace(): void {

		const folders = this.workspaceContextService.getWorkspace().folders;

		if (!folders.length) {

			return;

		}

		const cts = new CancellationTokenSource();

		this.indexService.indexWorkspace(folders[0].uri, cts.token);

	}

}



Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(CopixNativeToolsContribution, LifecyclePhase.Restored);

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(CopixCursorExperience, LifecyclePhase.Restored);

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(CopixIndexContribution, LifecyclePhase.Eventually);

