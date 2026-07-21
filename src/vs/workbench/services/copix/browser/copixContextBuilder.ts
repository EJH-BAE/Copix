/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { isLocation } from '../../../../editor/common/languages.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IChatRequestVariableEntry } from '../../../contrib/chat/common/attachments/chatVariableEntries.js';
import { CopixToolIds } from '../common/copixToolIds.js';
import { ICopixFilesystemService } from '../common/copixFilesystemService.js';
import { ChatMessage } from '../common/copixModelProvider.js';

const SYSTEM_PROMPT = `You are Copix, an expert programming AI assistant embedded in a local IDE.
You have tools to read/write files, search the codebase, run terminal commands, and list directories.
Use tools when needed. Be concise and precise. Prefer reading files before editing them.
When the user attaches @codebase, use semantic_search to find relevant code before answering.`;

export class CopixContextBuilder {
	constructor(
		private readonly editorService: IEditorService,
		private readonly filesystemService: ICopixFilesystemService,
	) { }

	async buildMessages(userMessage: string, history: ChatMessage[], attachments?: readonly IChatRequestVariableEntry[]): Promise<ChatMessage[]> {
		const messages: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];

		for (const msg of history) {
			if (msg.role === 'user' || msg.role === 'assistant') {
				messages.push(msg);
			}
		}

		let content = userMessage;
		const contextBlocks: string[] = [];

		if (attachments?.length) {
			for (const attachment of attachments) {
				const block = await this.formatAttachment(attachment);
				if (block) {
					contextBlocks.push(block);
				}
			}
		}

		const activeEditor = this.editorService.activeTextEditorControl;
		if (activeEditor && 'getModel' in activeEditor) {
			const model = (activeEditor as any).getModel?.();
			const selection = (activeEditor as any).getSelection?.();
			if (model && selection && !selection.isEmpty()) {
				const selected = model.getValueInRange(selection);
				if (selected?.trim()) {
					contextBlocks.push(`--- Active editor selection ---\n${selected}`);
				}
			}
		}

		if (contextBlocks.length) {
			content += `\n\n${contextBlocks.join('\n\n')}`;
		}

		messages.push({ role: 'user', content });
		return messages;
	}

	private async formatAttachment(attachment: IChatRequestVariableEntry): Promise<string | undefined> {
		switch (attachment.kind) {
			case 'file': {
				const uri = this.toUri(attachment.value);
				if (!uri) {
					return undefined;
				}
				try {
					if (this.filesystemService.isPathAllowed(uri)) {
						const text = await this.filesystemService.readFileText(uri);
						return `--- Attached file: ${uri.fsPath} ---\n${text}`;
					}
				} catch {
					return `--- Attached file: ${uri.fsPath} (could not read) ---`;
				}
				return `--- Attached file: ${uri.fsPath} ---`;
			}
			case 'directory': {
				const uri = this.toUri(attachment.value);
				return uri ? `--- Attached folder: ${uri.fsPath} ---` : undefined;
			}
			case 'tool':
				if (attachment.id === CopixToolIds.semanticSearch) {
					return 'The user referenced @codebase. Use semantic_search with their question as the query.';
				}
				return attachment.name ? `The user referenced tool @${attachment.name}. Use the matching tool when helpful.` : undefined;
			case 'toolset':
				return `The user referenced tool set @${attachment.name}. Use the appropriate tools from that set.`;
			default:
				return undefined;
		}
	}

	private toUri(value: IChatRequestVariableEntry['value']): URI | undefined {
		if (URI.isUri(value)) {
			return value;
		}
		if (isLocation(value)) {
			return value.uri;
		}
		return undefined;
	}
}
