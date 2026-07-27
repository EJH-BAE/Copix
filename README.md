<p align="center">
<img width="150" height="150" alt="copix_icon" src="macOS/studio/build/icon.png" />
</p>

<h1 align="center">Copix</h1>
<p align="center">
	<strong>Fast. Essential. Precise.</strong><br/>
	Turn anything you want into real, high-quality code.
</p>

<p align="center">
<img src="https://img.shields.io/badge/License-Proprietary-lightgrey.svg" alt="License: Proprietary">
<img src="https://img.shields.io/badge/Price-Free-brightgreen.svg" alt="Free">
<img src="https://img.shields.io/badge/macOS-supported-blue.svg" alt="macOS">
<img src="https://img.shields.io/badge/Windows-supported-blue.svg" alt="Windows">
</p>

---

## Platforms

| Folder | Platform | Build |
| :-- | :-- | :-- |
| [`macOS/`](macOS/) | macOS (Apple Silicon / Intel) | `cd macOS/studio && ./scripts/build-mac.sh` |
| [`Windows/`](Windows/) | Windows x64 | `cd Windows/studio && powershell -ExecutionPolicy Bypass -File .\scripts\build-windows-installer.ps1` |

### macOS (`/Users/baejuhan`)
See [macOS/README.md](macOS/README.md). Output: `macOS/studio/release/Copix-*-mac-*.dmg`

### Windows
See [Windows/README.md](Windows/README.md). Output: `Windows/studio/release/Copix-Setup-*-x64.exe`

## Settings (`~/Copix/settings.json`)

Copix has **no accounts**. Preferences are stored locally in:

| OS | Path |
| :-- | :-- |
| macOS | `/Users/<you>/Copix/settings.json` (e.g. `/Users/baejuhan/Copix/settings.json`) |
| Windows | `C:\Users\<you>\Copix\settings.json` |

The app creates the `Copix` folder and file when you change Settings. Editing models, theme, workspace home, or agent mode updates this file; restarting Copix reloads it.

Example:

```json
{
  "model": {
    "modelId": "qwen2.5:3b",
    "lowVram": false
  },
  "layout": { "sidebarWidth": 220, "editorWidth": 420 },
  "workspace": { "homeDirectory": "/Users/baejuhan" },
  "theme": "system",
  "agentMode": "code"
}
```

| Key | What it controls |
| :-- | :-- |
| `model.modelId` | Ollama model tag (default `qwen2.5:3b`) |
| `model.lowVram` | Smaller context for low-memory machines |
| `workspace.homeDirectory` | Where new projects are created |
| `theme` | `system` \| `dark` \| `light` |
| `agentMode` | Default agent mode (`plan`, `code`, `debug`, `terminal`) |
| `layout` | Sidebar / editor panel widths |

Prefer using **Settings** in the app; hand-editing the JSON is optional.

## License & Copyright

Copix is **free to use** and **not open source**. GitHub is used for development and deployment only — see [LICENSE.txt](LICENSE.txt).

Portions may include third-party components (for example Code-OSS) under their own licenses.
