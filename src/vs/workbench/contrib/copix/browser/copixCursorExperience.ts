/*---------------------------------------------------------------------------------------------

 *  Copyright (c) Copix Contributors. All rights reserved.

 *  Licensed under the MIT License.

 *--------------------------------------------------------------------------------------------*/



import { RunOnceScheduler } from '../../../../base/common/async.js';

import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.js';

import { Disposable } from '../../../../base/common/lifecycle.js';

import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';

import { ICommandService } from '../../../../platform/commands/common/commands.js';

import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';

import { KeybindingWeight, KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';

import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';

import { ChatEntitlementContextKeys } from '../../../services/chat/common/chatEntitlementService.js';

import { IChatEntitlementService } from '../../../services/chat/common/chatEntitlementService.js';

import { IWorkbenchLayoutService, Parts } from '../../../services/layout/browser/layoutService.js';

import { ACTION_START } from '../../inlineChat/common/inlineChat.js';

import { ONBOARDING_STORAGE_KEY } from '../../welcomeOnboarding/common/onboardingTypes.js';

import { COPIX_OPEN_ACTION_ID } from '../common/copix.js';



const CURSOR_EXPERIENCE_INITIALIZED_KEY = 'copix.cursorExperience.initialized';

const HIDE_CHAT_WELCOME_KEY = 'workbench.chat.hideWelcomeView';



export class CopixCursorExperience extends Disposable {



	constructor(

		@IChatEntitlementService private readonly chatEntitlementService: IChatEntitlementService,

		@IContextKeyService contextKeyService: IContextKeyService,

		@IStorageService private readonly storageService: IStorageService,

		@ICommandService private readonly commandService: ICommandService,

		@IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService,

	) {

		super();



		this.chatEntitlementService.markSetupCompleted();

		this.chatEntitlementService.setForceHidden(true);

		ChatEntitlementContextKeys.Setup.completed.bindTo(contextKeyService).set(true);



		this.storageService.store(HIDE_CHAT_WELCOME_KEY, true, StorageScope.APPLICATION, StorageTarget.MACHINE);

		this.storageService.store(ONBOARDING_STORAGE_KEY, true, StorageScope.APPLICATION, StorageTarget.USER);



		const scheduler = this._register(new RunOnceScheduler(() => this.bootstrapCursorLayout(), 750));

		scheduler.schedule();

	}



	private bootstrapCursorLayout(): void {

		this.layoutService.setPartHidden(false, Parts.AUXILIARYBAR_PART);

		this.layoutService.setAuxiliaryBarMaximized(true);



		if (this.storageService.getBoolean(CURSOR_EXPERIENCE_INITIALIZED_KEY, StorageScope.APPLICATION, false)) {

			return;

		}



		this.storageService.store(CURSOR_EXPERIENCE_INITIALIZED_KEY, true, StorageScope.APPLICATION, StorageTarget.MACHINE);

		this.commandService.executeCommand(COPIX_OPEN_ACTION_ID);

	}

}



KeybindingsRegistry.registerKeybindingRule({

	id: COPIX_OPEN_ACTION_ID,

	weight: KeybindingWeight.WorkbenchContrib + 100,

	when: undefined,

	primary: KeyMod.CtrlCmd | KeyCode.KeyL,

});



KeybindingsRegistry.registerKeybindingRule({

	id: ACTION_START,

	weight: KeybindingWeight.WorkbenchContrib + 100,

	when: EditorContextKeys.focus,

	primary: KeyMod.CtrlCmd | KeyCode.KeyK,

});

