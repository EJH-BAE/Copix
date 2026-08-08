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

## What is Copix?
Copix is an Ollama-based local agent.
Instead of high-price models like gpt-oss, Copix uses faster Ollama models, such as `qwen2.5:3b`.

## How does Copix work?
Copix starts working when the prompt is messaged to Ollama.
Copix works like this:
```mermaid
flowchart TD
P[Prompt Handling (Ollama)] --> W[Work (Ollama)]
W --> |Files| F[Reading, Editing, Creating, Listing]
W --> |Thoughts| T[Reasoning]
F --> O[Output in JSON]
T --> O[Output in JSON]
```

## License

See [LICENSE.txt](LICENSE.txt). Copix is proprietary. You may use the product; you may not redistribute source or relicense it as open source.
