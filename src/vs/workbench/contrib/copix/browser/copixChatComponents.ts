/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Copix Contributors. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { $, append, clearNode, addDisposableListener } from '../../../../base/browser/dom.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { IMarkdownRendererService } from '../../../../platform/markdown/browser/markdownRenderer.js';
import { AgentEvent } from '../common/copixAgentEvents.js';
import { getCopixToolLabel } from '../common/copixAgentProgress.js';

export interface CopixChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
}

export class CopixChatUI extends Disposable {
	private root!: HTMLElement;
	private messagesEl!: HTMLElement;
	private inputEl!: HTMLTextAreaElement;
	private sendBtn!: HTMLButtonElement;
	private statusEl!: HTMLElement;
	private modelBadge!: HTMLElement;
	private welcomeEl!: HTMLElement;

	private readonly messages: CopixChatMessage[] = [];
	private streamingAssistantId: string | undefined;
	private activeToolPills = new Map<string, HTMLElement>();
	private onSendCallback: ((text: string) => void) | undefined;
	private onNewChatCallback: (() => void) | undefined;

	constructor(
		parent: HTMLElement,
		private readonly markdownRenderer: IMarkdownRendererService,
	) {
		super();
		this.render(parent);
	}

	setModelLabel(label: string): void {
		this.modelBadge.textContent = label;
	}

	onSend(callback: (text: string) => void): void {
		this.onSendCallback = callback;
	}

	onNewChat(callback: () => void): void {
		this.onNewChatCallback = callback;
	}

	setRunning(running: boolean): void {
		this.sendBtn.disabled = running;
		this.inputEl.disabled = running;
	}

	clear(): void {
		this.messages.length = 0;
		this.streamingAssistantId = undefined;
		this.activeToolPills.clear();
		clearNode(this.messagesEl);
		this.welcomeEl.style.display = '';
		this.statusEl.textContent = '';
		this.statusEl.className = 'copix-status-line';
	}

	handleAgentEvent(event: AgentEvent): void {
		switch (event.type) {
			case 'message_complete':
				if (event.role === 'user') {
					this.appendUserMessage(event.content);
				} else {
					this.finalizeAssistantMessage(event.content);
				}
				break;
			case 'text_delta':
				this.appendAssistantDelta(event.content);
				break;
			case 'status':
				this.setStatus(event.message, event.state);
				break;
			case 'tool_start':
				this.showToolPill(event.tool, 'active');
				break;
			case 'tool_end':
				this.showToolPill(event.tool, 'done');
				break;
		}
	}

	private render(parent: HTMLElement): void {
		this.root = append(parent, $('.copix-root'));

		const header = append(this.root, $('.copix-header'));
		append(header, $('.copix-header-title')).textContent = 'Agent';
		this.modelBadge = append(header, $('.copix-model-badge'));
		this.modelBadge.textContent = 'Local model';

		const newChatBtn = append(header, $('button.copix-icon-btn'));
		newChatBtn.title = 'New chat';
		newChatBtn.textContent = '+';
		this._register(addDisposableListener(newChatBtn, 'click', () => this.onNewChatCallback?.()));

		this.messagesEl = append(this.root, $('.copix-messages'));
		this.welcomeEl = append(this.messagesEl, $('.copix-welcome'));
		append(this.welcomeEl, $('.copix-welcome-title')).textContent = 'Ask Copix';
		append(this.welcomeEl, $('.copix-welcome-hint')).textContent = 'Build, edit, and search your codebase with a local agent. Use @codebase in your message for semantic search.';

		this.statusEl = append(this.messagesEl, $('.copix-status-line'));

		const composerWrap = append(this.root, $('.copix-composer-wrap'));
		const composer = append(composerWrap, $('.copix-composer'));
		this.inputEl = append(composer, $('textarea.copix-input')) as HTMLTextAreaElement;
		this.inputEl.placeholder = 'Plan, search, build anything…';
		this.inputEl.rows = 3;

		const footer = append(composer, $('.copix-composer-footer'));
		append(footer, $('.copix-composer-hint')).textContent = 'Enter to send · Shift+Enter for newline · @codebase to search';
		this.sendBtn = append(footer, $('button.copix-send-btn')) as HTMLButtonElement;
		this.sendBtn.textContent = '↑';

		const store = this._register(new DisposableStore());
		store.add(addDisposableListener(this.sendBtn, 'click', () => this.submit()));
		store.add(addDisposableListener(this.inputEl, 'keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.submit();
			}
		}));
	}

	private submit(): void {
		const text = this.inputEl.value.trim();
		if (!text || this.sendBtn.disabled) {
			return;
		}
		this.inputEl.value = '';
		this.onSendCallback?.(text);
	}

	private appendUserMessage(content: string): void {
		this.welcomeEl.style.display = 'none';
		const id = `u-${Date.now()}`;
		this.messages.push({ id, role: 'user', content });
		const row = append(this.messagesEl, $('.copix-message.copix-message-user'));
		append(row, $('.copix-message-body')).textContent = content;
		this.scrollToBottom();
	}

	private appendAssistantDelta(delta: string): void {
		this.welcomeEl.style.display = 'none';
		if (!this.streamingAssistantId) {
			this.streamingAssistantId = `a-${Date.now()}`;
			this.messages.push({ id: this.streamingAssistantId, role: 'assistant', content: '' });
			const row = append(this.messagesEl, $('.copix-message.copix-message-assistant'));
			row.dataset.messageId = this.streamingAssistantId;
			append(row, $('.copix-message-body'));
		}
		const msg = this.messages.find(m => m.id === this.streamingAssistantId);
		if (msg) {
			msg.content += delta;
			this.renderAssistantMarkdown(this.streamingAssistantId, msg.content);
		}
		this.scrollToBottom();
	}

	private finalizeAssistantMessage(content: string): void {
		if (!this.streamingAssistantId) {
			this.streamingAssistantId = `a-${Date.now()}`;
			this.messages.push({ id: this.streamingAssistantId, role: 'assistant', content });
			const row = append(this.messagesEl, $('.copix-message.copix-message-assistant'));
			row.dataset.messageId = this.streamingAssistantId;
			append(row, $('.copix-message-body'));
		} else {
			const msg = this.messages.find(m => m.id === this.streamingAssistantId);
			if (msg && content && !msg.content) {
				msg.content = content;
			}
		}
		if (this.streamingAssistantId) {
			const msg = this.messages.find(m => m.id === this.streamingAssistantId);
			if (msg) {
				this.renderAssistantMarkdown(this.streamingAssistantId, msg.content);
			}
		}
		this.streamingAssistantId = undefined;
		this.scrollToBottom();
	}

	private renderAssistantMarkdown(messageId: string, content: string): void {
		const row = this.messagesEl.querySelector(`[data-message-id="${messageId}"]`);
		if (!row) {
			return;
		}
		const body = row.querySelector('.copix-message-body') as HTMLElement;
		if (!body) {
			return;
		}
		clearNode(body);
		this.markdownRenderer.render(new MarkdownString(content, { isTrusted: true }), {}, body);
	}

	private showToolPill(tool: string, phase: 'active' | 'done'): void {
		this.welcomeEl.style.display = 'none';
		let row = this.activeToolPills.get(tool);
		if (!row) {
			const container = append(this.messagesEl, $('.copix-tool-row'));
			row = append(container, $('.copix-tool-pill'));
			this.activeToolPills.set(tool, row);
		}
		row.textContent = getCopixToolLabel(tool, phase);
		row.className = `copix-tool-pill ${phase}`;
		if (phase === 'done') {
			this.activeToolPills.delete(tool);
		}
		this.scrollToBottom();
	}

	private setStatus(message: string, state: 'active' | 'done' | 'error'): void {
		if (state === 'done' && message === 'Done') {
			this.statusEl.textContent = '';
			this.statusEl.className = 'copix-status-line';
			return;
		}
		this.statusEl.textContent = message;
		this.statusEl.className = `copix-status-line${state === 'active' ? ' active' : ''}`;
	}

	private scrollToBottom(): void {
		this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
	}

	focusInput(): void {
		this.inputEl.focus();
	}
}
