/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { ICopixAgentProgress } from '../../../contrib/copix/common/copixAgentProgress.js';
import { IChatRequestVariableEntry } from '../../../contrib/chat/common/attachments/chatVariableEntries.js';

export interface ICopixAgentRunContext extends ICopixAgentProgress {
	readonly sessionResource?: URI;
	readonly requestId?: string;
	readonly attachments?: readonly IChatRequestVariableEntry[];
}
