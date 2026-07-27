<p align="center">
<img width="150" height="150" alt="copix_icon" src="macOS/studio/build/icon.png" />
</p>

<h1 align="center">Copix</h1>
<p align="center">
	<strong>Fast. Efficient. Precise.</strong><br/>
	Turn anything you want into real, high-quality code.
</p>

<p align="center">
<img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
<img src="https://img.shields.io/badge/macOS-supported-blue.svg" alt="macOS">
<img src="https://img.shields.io/badge/Windows-supported-blue.svg" alt="Windows">
</p>

---

## Build

| Folder | Platform | Build |
| :-- | :-- | :-- |
| [`macOS/`](macOS/) | macOS (Apple Silicon / Intel) | `cd macOS/studio && ./scripts/build-mac.sh` |
| [`Windows/`](Windows/) | Windows x64 | `cd Windows/studio && powershell -ExecutionPolicy Bypass -File .\scripts\build-windows-installer.ps1` |

### macOS
See [macOS/README.md](macOS/README.md). Output: `macOS/studio/release/Copix-*-mac-*.dmg`

### Windows
See [Windows/README.md](Windows/README.md). Output: `Windows/studio/release/Copix-Setup-*-x64.exe`

## License & Copyright

Copix is a fork of [Code-OSS](https://github.com/microsoft/vscode).  
Copyright for Code-OSS remains with Microsoft.  
AI functions, components, UI, tool system, etc. are copyright Bae Juhan.
