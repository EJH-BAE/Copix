# Copix releases

Installers for **Copix Desktop** (macOS + Windows). Copix is free to use and proprietary.

| File | Platform | Notes |
| --- | --- | --- |
| [`Copix-4.3.0-macOS-arm64.dmg`](./Copix-4.3.0-macOS-arm64.dmg) | macOS Apple Silicon | **Current** Desktop |
| [`Copix-4.3.0-Windows-x64.exe`](./Copix-4.3.0-Windows-x64.exe) | Windows x64 | **Current** Desktop |
| [`Copix-4.2.0-macOS-arm64.dmg`](./Copix-4.2.0-macOS-arm64.dmg) | macOS Apple Silicon | Prior |
| [`Copix-4.1.0-Windows-x64.exe`](./Copix-4.1.0-Windows-x64.exe) | Windows x64 | Prior |
| [`Copix-Setup-4.0.0-x64.exe`](./Copix-Setup-4.0.0-x64.exe) | Windows x64 | Prior |

Checksums: [`SHA256SUMS.txt`](./SHA256SUMS.txt)

Also published as GitHub Release **[v4.3.0](https://github.com/EJH-BAE/Copix/releases/tag/v4.3.0)**.

## CLI (separate one-liner install)

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.ps1 | iex
```

Then: `ollama pull qwen2.5:3b` → `copix doctor` → `copix`
