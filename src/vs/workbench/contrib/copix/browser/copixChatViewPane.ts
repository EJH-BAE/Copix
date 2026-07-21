/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import './media/copix.css';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IMarkdownRendererService } from '../../../../platform/markdown/browser/markdownRenderer.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { ViewPane, IViewPaneOptions } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { ICopixAgentService } from '../../../services/copix/common/copixAgentService.js';
import { IModelRouter } from '../../../services/copix/common/copixModelProvider.js';
import { COPIX_CHAT_VIEW_ID, COPIX_CONFIGURATION_SECTION } from '../common/copix.js';
import { CopixChatUI } from './copixChatComponents.js';

export class CopixChatViewPane extends ViewPane {
	static readonly ID = COPIX_CHAT_VIEW_ID;

	private chatUI: CopixChatUI | undefined;
	private activeCts: CancellationTokenSource | undefined;
	private readonly localStore = this._register(new DisposableStore());

	constructor(
		options: IViewPaneOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@ICopixAgentService private readonly agentService: ICopixAgentService,
		@IModelRouter private readonly modelRouter: IModelRouter,
		@IMarkdownRendererService private readonly markdownRendererService: IMarkdownRendererService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);

		this.chatUI = new CopixChatUI(container, this.markdownRendererService);
		this.refreshModelLabel();

		this.localStore.add(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(COPIX_CONFIGURATION_SECTION)) {
				this.refreshModelLabel();
			}
		}));

		this.localStore.add(this.agentService.onDidEmitEvent(event => {
			this.chatUI?.handleAgentEvent(event);
		}));

		this.chatUI.onSend(text => this.sendMessage(text));
		this.chatUI.onNewChat(() => {
			this.activeCts?.cancel();
			this.agentService.cancel();
			this.agentService.clearHistory();
			this.chatUI?.clear();
		});
	}

	private async refreshModelLabel(): Promise<void> {
		const localModel = this.configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.local.model`) ?? 'local';
		const routing = this.configurationService.getValue<string>(`${COPIX_CONFIGURATION_SECTION}.models.routing`) ?? 'local-first';
		const local = this.modelRouter.getLocalProvider();
		const healthy = await local.healthCheck(CancellationToken.None);
		const label = healthy ? localModel : `${localModel} (offline)`;
		this.chatUI?.setModelLabel(routing === 'cloud-only' ? 'Cloud' : label);
	}

	private async sendMessage(text: string): Promise<void> {
		if (this.agentService.isRunning) {
			return;
		}

		this.activeCts?.cancel();
		this.activeCts = new CancellationTokenSource();
		this.chatUI?.setRunning(true);

		try {
			await this.agentService.sendMessage(text, this.activeCts.token);
		} finally {
			this.chatUI?.setRunning(false);
		}
	}

	override focus(): void {
		super.focus();
		this.chatUI?.focusInput();
	}
}
