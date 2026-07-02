# TileSpace MVP Safe Branch Status

Branch: `tilespace-mvp-safe`

This branch starts from the stable `main` recovery point after the failed TileSpace runtime attempts.

Current rule:

- Do not change Dock behavior.
- Do not mount full-screen map pages inside TileSpace tiles.
- Build the next TileSpace version through small registry and shell changes first.
- Use app-owned embeddable tile runtimes later, not full app pages.

Current active baseline:

- Shell uses `OlympusDeskV2`.
- Dock is part of the current working Desk and should remain untouched.
- Intel Maps still owns its existing workspace.
- TileSpace MVP work should be staged on this branch before touching `main` again.
