# Copix

Official Copix AI IDE for Windows.

## Download

Install from GitHub Releases: `Copix-Setup-1.0.0-x64.exe`

## Build installer

```powershell
cd D:\Copix
npm run dist
```

Output:

- Installer: `studio\release\Copix-Setup-1.0.0-x64.exe`
- App folder: `studio\release\staging\win-unpacked\` (Cursor-style layout)

## Develop

```powershell
cd studio
npm install
npm run studio
```

Or from repo root: `copix-studio.bat`

## Repository layout

```
Copix/
├── studio/          Application source (Electron + React)
├── resources/       Brand assets (icons, manifest templates)
├── policies/        Enterprise policy slot
├── tools/           Helper scripts
├── LICENSE.txt
└── README.md
```

## License

MIT — see [LICENSE.txt](LICENSE.txt).
