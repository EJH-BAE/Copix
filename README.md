<p align="center">
<img width="120" height="120" alt="Copix" src="icon.png" />
</p>

<h1 align="center">Copix</h1>
<p align="center">
	<strong>Fast. Efficient. Precise.</strong><br/>
	Your coding agent for ambitious software.
</p>

<p align="center">
<img src="https://img.shields.io/badge/License-Proprietary-lightgrey.svg" alt="License: Proprietary">
<img src="https://img.shields.io/badge/Price-Free-brightgreen.svg" alt="Free">
<img src="https://img.shields.io/badge/Version-4.3.0-blue.svg" alt="v4.3.0">
<img src="https://img.shields.io/badge/macOS-supported-blue.svg" alt="macOS">
<img src="https://img.shields.io/badge/Windows-supported-blue.svg" alt="Windows">
</p>

---
Desktop and CLI run locally with [Ollama](https://ollama.com).

## Introduction
Copix is an Ollama-based local agent.
Instead of high-price models like gpt-oss, Copix uses faster Ollama models, such as `qwen2.5:3b`.

## How Copix works
Copix starts working in various ways when the prompt is messaged to Ollama.<br/>
Copix works like this:
<p align="center">
<img width="375" height="280" alt="image" src="https://github.com/user-attachments/assets/57ad16e4-ed4d-4a64-8309-0cdea7024752" />
</p>

- **The user** inputs the prompt.
- **Ollama** receives the user prompt and plans how the work should be initialized.
- **Ollama** uses *Copix tools* to create, read, and manage files.
- **Ollama** puts an output while working in JSON.
- **Copix** summarizes the work done by Ollama.


## Why Copix?
Defualt Ollama app doesn't have any functions like creating or reading files.
Copix is an advanced agent that maximizes the aspects of Ollama.

Comparison between the two:

| Functions | Defualt Ollama | Copix | 
| :-- | :--: | :--: |
| Command tools | ❌ | ✅ |
| File creation | ❌ | ✅ |
| File reading | ❌ | ✅ |
| JSON output | ❌ | ✅ |
| Web search | ✅ | ✅ |
| Dynamic UI | ✅ | ✅ |
| CLI | ✅ | ✅ | 

## Settings
Copix's outputs are all created with `JSON`.
Example:

```json
{
  "model": {
    "provider": "ollama",
    "apiKey": "",
    "selection": "manual",
    "modelId": "qwen2.5-coder:7b"
  },
  "layout": {
    "sidebarWidth": 220,
    "editorWidth": 420
  },
  "workspace": {
    "homeDirectory": ""
  },
  "theme": "dark",
  "agentMode": "code",
  "activeAccountId": "default",
  "accounts": [
    {
      "id": "default",
      "displayName": "Local user",
      "createdAt": 1785154776653
    }
  ],
  "auth": {
    "provider": "local",
    "supabaseUrl": "",
    "supabaseAnonKey": ""
  },
  "subscription": {
    "plan": "free",
    "status": "inactive"
  },
  "systemPrompt": {
    "customRules": []
  },
  "modelSetup": {
    "completed": false,
    "skipped": true
  }
}
```


## License

See [LICENSE.txt](LICENSE.txt). Copix is proprietary. You may use the product; you may not redistribute source or relicense it as open source.
