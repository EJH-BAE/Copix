# Copix

Official Copix AI IDE for Windows.

## Download (Windows)

Install the latest release from GitHub Releases:

- **Installer:** `Copix-Setup-1.0.0-x64.exe`
- Creates Start Menu + Desktop shortcuts
- Choose install folder during setup

## Build the Windows installer

```powershell
cd studio
powershell -ExecutionPolicy Bypass -File .\scripts\build-windows-installer.ps1
```

Output: `studio\release\Copix-Setup-<version>-x64.exe`

## Develop

```powershell
cd studio
npm install
npm run studio
```

## License

MIT (see `LICENSE.txt`). Based on Code - OSS.
