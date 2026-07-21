/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IViewContainersRegistry, IViewsRegistry, ViewContainer, ViewContainerLocation, Extensions as ViewExtensions } from '../../../common/views.js';
import {
	COPIX_CHAT_VIEW_ID,
	COPIX_OPEN_ACTION_ID,
	COPIX_VIEW_CONTAINER_ID,
} from '../common/copix.js';
import { CopixChatViewPane } from './copixChatViewPane.js';

const copixViewIcon = registerIcon('copix-agent-icon', Codicon.sparkleFilled, localize('copixViewIcon', 'Copix Agent view icon.'));

const viewContainerRegistry = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry);
const viewsRegistry = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry);

export const COPIX_VIEW_CONTAINER: ViewContainer = viewContainerRegistry.registerViewContainer({
	id: COPIX_VIEW_CONTAINER_ID,
	title: localize2('copix.viewContainer.label', 'Copix'),
	icon: copixViewIcon,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [COPIX_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
	storageId: COPIX_VIEW_CONTAINER_ID,
	hideIfEmpty: false,
	order: 0,
}, ViewContainerLocation.AuxiliaryBar, { isDefault: true });

viewsRegistry.registerViews([{
	id: COPIX_CHAT_VIEW_ID,
	name: localize2('copix.view.agent', 'Agent'),
	containerIcon: copixViewIcon,
	containerTitle: COPIX_VIEW_CONTAINER.title.value,
	singleViewPaneContainerTitle: COPIX_VIEW_CONTAINER.title.value,
	canToggleVisibility: false,
	canMoveView: false,
	ctorDescriptor: new SyncDescriptor(CopixChatViewPane),
	openCommandActionDescriptor: {
		id: COPIX_OPEN_ACTION_ID,
		title: COPIX_VIEW_CONTAINER.title,
		keybindings: {
			primary: KeyMod.CtrlCmd | KeyCode.KeyL,
		},
		order: 0,
	},
}], COPIX_VIEW_CONTAINER);

registerAction2(class OpenCopixAgentAction extends Action2 {
	constructor() {
		super({
			id: COPIX_OPEN_ACTION_ID,
			title: localize2('copix.openAgent', 'Open Copix Agent'),
			f1: true,
			keybinding: {
				weight: 200,
				primary: KeyMod.CtrlCmd | KeyCode.KeyL,
			},
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		await viewsService.openView(COPIX_CHAT_VIEW_ID, true);
	}
});
