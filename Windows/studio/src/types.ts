import type { AgentMode, WorkspaceEnvironment } from './models/agentModes';
import type { ChatActivity } from './chatActivity';
import type { AgentAction } from './models/structuredResponse';

export type { AgentAction, StructuredAgentResponse } from './models/structuredResponse';

export type { AgentMode, WorkspaceEnvironment };
export type { ChatActivity, ActivityKind, ActivityPhase } from './chatActivity';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
	id: string;
	role: ChatRole;
	content: string;
	timestamp: number;
	/** Pasted image data URLs attached to the user message. */
	images?: string[];
	/** Tool/thinking rows shown above the assistant reply (Cursor-style). */
	activities?: ChatActivity[];
	/** Parsed actions from a structured JSON response (for replay / UI). */
	structuredActions?: AgentAction[];
}

export interface EditorTab {
	path: string;
	content: string;
	dirty: boolean;
}

export interface SystemPromptSettings {
	customRules: string[];
}

export interface LayoutSettings {
	sidebarWidth: number;
	editorWidth: number;
}

export interface WorkspaceSettings {
	/** Default folder for agent output (projects, generated files). */
	homeDirectory: string;
}

export type ThemePreference = 'system' | 'dark' | 'light';

export type ModelProvider = 'local' | 'cloud';

export interface ModelSettings {
	provider: ModelProvider;
	endpoint: string;
	apiKey: string;
	modelId: string;
	tunedModelId: string;
	preferTuned: boolean;
	trainingDataPath: string;
	/** Safer local inference: smaller context, fewer GPU layers. */
	lowVram?: boolean;
}

export interface ModelSetupSettings {
	completed: boolean;
	skipped: boolean;
}

/** Local app settings — persisted to ~/Copix/settings.json */
export interface AppSettings {
	model: ModelSettings;
	layout: LayoutSettings;
	workspace: WorkspaceSettings;
	theme: ThemePreference;
	agentMode: AgentMode;
	systemPrompt: SystemPromptSettings;
	modelSetup: ModelSetupSettings;
}

export const DEFAULT_LAYOUT: LayoutSettings = {
	sidebarWidth: 220,
	editorWidth: 420,
};

export const DEFAULT_WORKSPACE: WorkspaceSettings = {
	homeDirectory: '',
};

export const DEFAULT_SYSTEM_PROMPT: SystemPromptSettings = {
	customRules: [],
};

export const DEFAULT_MODEL: ModelSettings = {
	provider: 'local',
	endpoint: 'http://127.0.0.1:11434/v1',
	apiKey: '',
	modelId: 'gpt-oss:20b',
	tunedModelId: 'copix-core',
	preferTuned: true,
	trainingDataPath: '',
	lowVram: false,
};

export const DEFAULT_CLOUD_ENDPOINT = 'https://your-copix-cloud.onrender.com/v1';

export const DEFAULT_MODEL_SETUP: ModelSetupSettings = {
	completed: false,
	skipped: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
	model: DEFAULT_MODEL,
	layout: DEFAULT_LAYOUT,
	workspace: DEFAULT_WORKSPACE,
	theme: 'system',
	agentMode: 'code',
	systemPrompt: DEFAULT_SYSTEM_PROMPT,
	modelSetup: DEFAULT_MODEL_SETUP,
};
