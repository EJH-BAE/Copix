<p align="center">
<img width="125" height="118" alt="image" src="https://github.com/user-attachments/assets/957dde62-5029-4c5a-ac62-124ebe9c577c" />
</p>

<h1 align="center">Copix</h1>
<p align="center">
	<strong>Fast. Efficient. Precise.</strong><br/>
	Your agent to maximize Ollama usability.
</p>
<p align="center"><strong>Write, edit, delete, read files and create projects just with a sentence.</strong></p>

<p align="center">
<img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT">
<img src="https://img.shields.io/badge/Price-Free-brightgreen.svg" alt="Free">
<img src="https://img.shields.io/badge/Version-4.3.0-blue.svg" alt="v4.3.0">
<img src="https://img.shields.io/badge/macOS-supported-blue.svg" alt="macOS">
<img src="https://img.shields.io/badge/Windows-supported-blue.svg" alt="Windows">
</p>

---
<img width="1469" height="821" alt="image" src="https://github.com/user-attachments/assets/477b3b09-d5a5-4812-8f18-bdc795a25ff6" />

---

<p align="center"><strong><a href="https://github.com/EJH-BAE/Copix/blob/main/demo.mov">Watch Demo (.mov)</strong>


## Introduction
Copix is a local agent operating directly on your system.
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

## Tools
- `create_project`
- `multitask`
- `read_file`
- `edit_file`
- `write_file`
- `append_file`
- `delete_file`
- `grep`
- `list_dir`
- `web_search`
- `web_fetch`
- `terminal`
- `spawn_subagent`

## Build

### CLI

Requires [Node.js 18+](https://nodejs.org) and `git`.

```bash
git clone https://github.com/EJH-BAE/Copix.git
cd Copix/cli
npm install
npm start
```

One-shot install (macOS / Linux):

```bash
curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/refs/heads/main/cli/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/EJH-BAE/Copix/refs/heads/main/cli/install.ps1 | iex
```

Then:

```bash
ollama pull qwen2.5:3b
copix doctor
copix
```

### Desktop

Prebuilt installers are in [`release/`](release/) and on [GitHub Releases](https://github.com/EJH-BAE/Copix/releases/tag/v4.3.0).

## Programs
Copix has a **CLI** version and a **Desktop** version. <br/>

### CLI
---
<img width="863" height="469" alt="image" src="https://github.com/user-attachments/assets/b64d25ad-39e8-4ad1-9081-3eba91c7e938" />

### Desktop
---
<img width="1469" height="821" alt="image" src="https://github.com/user-attachments/assets/477b3b09-d5a5-4812-8f18-bdc795a25ff6" />

## Why Copix?
Default Ollama app doesn't have any functions like creating or reading files.
Copix is an advanced agent that maximizes the aspects of Ollama.

Comparison between the two:

| Functions | Default Ollama | Copix | 
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

| Settings | Default |
| :-- | :-- |
| Model provider (model.provider) | Ollama (locked to Ollama) |
| Model ID (model.modelID) | `qwen2.5:3b` (`qwen2.5-coder:7b`, `qwen3.5:4b` is also available) |
| Workspace (workspace.homeDirectory) | "/Users/{username}" (can change based on user settings) |

```json
{
  "model": {
    "provider": "ollama",
    "modelId": "qwen2.5:3b"
  },
  "workspace": {
    "homeDirectory": "/Users/{username}"
  }
}
```

## License

See [LICENSE.txt](LICENSE.txt). Copix is open source under the MIT License.

## Links
- [Ollama](https://ollama.com)
- [Copix](https://ejh-bae.github.io/Copix/)
