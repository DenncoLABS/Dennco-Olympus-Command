# Olympus Workspace Refactor Status

## Completed shared-shell conversion

These workspaces now use `OlympusWorkspaceShell`:

- Zabbix
- Services
- Lab Node
- CAD
- Admin wrapper
- Monitor

These workspaces now use the shell-provided default close path through `closeOlympusWorkspace()`:

- CAD
- Monitor
- Admin wrapper
- Zabbix
- Services
- Lab Node

The launcher bridge now routes through `openOlympusWorkspace()` and `workspaceRoutes.ts` instead of keeping a separate local route table.

## Remaining safe direction

The next larger step is native Desk/Dock integration:

- Desk app cards should call `openOlympusWorkspace()` directly.
- Dock app buttons should call `openOlympusWorkspace()` directly.
- Once that works, `workspaceLauncherPatch.ts` can be removed.

## Items intentionally deferred

These are deferred until runtime testing confirms the current batch is stable:

- Rewriting `AdminSettingsPage` internals. The settings form includes provider keys and upload fields, so only the wrapper was changed.
- Intel Maps toolbar hover-collapse. Intel Maps has custom map state and should be adjusted after the workspace routing changes are tested.
- Removing `workspaceLauncherPatch.ts`. It still acts as a compatibility bridge until native Desk/Dock routing is wired and verified.
