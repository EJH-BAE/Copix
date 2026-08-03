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

**Copix is free to use and not open source.**  
No accounts. Desktop and CLI run locally with [Ollama](https://ollama.com).

## Get Copix v4.3.0

| Surface | Install |
| :-- | :-- |
| **Website** | [ejh-bae.github.io/Copix](https://ejh-bae.github.io/Copix/) |
| **Desktop installers** | [`release/`](release/) · [GitHub Release v4.3.0](https://github.com/EJH-BAE/Copix/releases/tag/v4.3.0) |
| **macOS Desktop** | [`release/Copix-4.3.0-macOS-arm64.dmg`](release/Copix-4.3.0-macOS-arm64.dmg) |
| **Windows Desktop** | [`release/Copix-4.3.0-Windows-x64.exe`](release/Copix-4.3.0-Windows-x64.exe) |
| **CLI (macOS / Linux)** | `curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.sh \| bash` |
| **CLI (Windows)** | `irm https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.ps1 \| iex` |

```bash
ollama pull qwen2.5:3b
copix doctor
copix
```

## Product

- **Desktop** — Copix Studio for macOS and Windows  
- **CLI** — same agent in the terminal (creates/edits files for you; no account)  
- **Local models** — Ollama-first; preferences in `~/Copix/settings.json`

See [cli/README.md](cli/README.md) and [release/README.md](release/README.md).

## License

See [LICENSE.txt](LICENSE.txt). Copix is proprietary. You may use the product; you may not redistribute source or relicense it as open source.
