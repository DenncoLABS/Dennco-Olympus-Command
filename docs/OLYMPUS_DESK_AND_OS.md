# Olympus Desk and OS Shell

Olympus Desk is the beginning of the Olympus Core OS shell. It is designed to run on top of Debian and eventually integrate with GNOME as a desktop/appliance environment.

## Concepts

### Earth screen

The Earth screen is the main operational map space. It should remain active while the Desk is open. Map modules such as Flight, Maritime, Monitor, and DOT use this space.

### Desk

The Desk is the full-width bottom workspace. It behaves like a separate OS screen below the Earth screen. Dragging the Desk upward should reduce the height of the Earth screen instead of covering it.

Current implementation:

- Rendered from `client/src/ui/layout/OlympusDesk.tsx`.
- Mounted in `client/src/ui/layout/ShellLayout.tsx`.
- Full-width layout element below the main content area.
- Height persisted in local storage.
- Active Desk app persisted in local storage.
- Dock placement persisted in local storage.

### Dock

The Dock is the launcher inside the Desk. It is not the Desk itself.

Current Dock behavior:

- Lives inside the Desk.
- Can be placed left, center, or right.
- Opens Desk apps inside the Desk workspace.
- Does not change the Earth/map screen.

Current Dock buttons:

- Core
- Apps
- Files
- Architecture
- Terminal
- Flight
- Maritime
- Monitor
- DOT
- CAD
- Admin
- Settings

## Desk-first app model

Olympus apps should follow this opening model:

```text
Dock = launcher
Desk = first approach workspace
Window = focused working surface
```

All apps should first open in the Desk. The Desk approach screen helps the operator understand the service, review status, choose a workflow, and decide how to proceed.

Deep work opens from the Desk into windows, workspaces, object panels, editors, consoles, or focused maps.

The Dock should not launch destructive or deep production actions directly. The Dock opens or focuses the app approach screen.

See `docs/CORE_APP_DEPLOYMENT_MODEL.md` for the full doctrine.

## Desk apps

The current Desk apps are hard-coded placeholders intended to become real OS-style panels.

### Core

Planned function:

- System status
- Debian package status
- Olympus service health
- CAD service health
- Runtime config status
- Core data-path status

### Apps

Planned function:

- App launcher catalog
- Installed Olympus modules
- Future Olympus apps
- App state and permissions
- App approach screens
- App window/workspace launcher
- Manifest-driven app registry

### Files

Planned function:

- Safe file browsing for approved Olympus server paths
- File selection for AI-assisted work
- Architecture-aware file context
- No secret exposure by default

Safe starting paths:

```text
/opt/dennco/olympus-command
/etc/dennco/olympus-command
/var/lib/dennco
```

### Architecture

Planned function:

- Visual repo/system architecture
- Client/server/module map
- Data-source relationships
- Package/deployment flow
- Service relationship map

### Terminal

Planned function:

- Controlled terminal-like shell
- Read-only command templates first
- Later, authenticated safe command execution through backend actions

### Monitor widget library

Monitor widgets were moved out of the old Monitor bottom strip and saved for later Desk/Earth widget migration.

Saved definitions live in:

```text
client/src/modules/monitor/widgets/monitorDeskWidgetManifest.ts
```

Saved widgets:

- Map Layers
- Rocket Alerts
- Gulf Watch
- AI Synthesis
- Live Intel Feed

## App window/workspace direction

Windows and workspaces are focused working surfaces opened from Desk app approach screens.

They should be used for:

- object detail panels
- editors
- live sandbox workspaces
- report builders
- configuration workflows
- consoles
- AI repair sessions
- app-specific maps that need focus

App windows should preserve app context and should not hide guardrails, source status, or production safety warnings.

## GNOME integration plan

The web Desk is Phase 1. Later phases should package Olympus as a GNOME/Debian appliance shell.

Planned package files:

```text
/usr/share/applications/olympus-command.desktop
/etc/xdg/autostart/olympus-command.desktop
/usr/share/icons/hicolor/.../olympus-command.png
/opt/dennco/olympus-command/desktop/
```

Planned behavior:

- GNOME session starts Olympus automatically.
- Olympus opens as the main local command application.
- The Desk becomes the primary OS navigation surface.
- Core apps provide local system control without requiring direct shell use.

## Development rules

- Keep Earth and Desk separated.
- Dock buttons should not switch the main map unless explicitly designed to.
- Desk apps open inside the Desk.
- Apps open in Desk first through an approach screen.
- Deep app work opens in windows, workspaces, or object panels.
- Dock should never launch destructive or guarded actions directly.
- Widgets can later be dragged from the Desk to the Earth screen.
- Preserve local storage keys or provide migrations when changing saved Desk behavior.
- Keep file access safe and explicit.
