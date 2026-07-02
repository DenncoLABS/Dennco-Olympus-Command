# Olympus Desk and OS Shell

Olympus Desk is the beginning of the Olympus Core OS shell. It is designed to run on top of Debian and eventually integrate with GNOME as a desktop/appliance environment.

## Concepts

### Earth screen

The Earth screen is the main operational map space. It should remain active while the Desk is open. Map modules such as Flight, Maritime, Monitor, and DOT use this space.

### Desk

The Desk is the full-width bottom workspace. It behaves like a separate OS control surface below the Earth screen. Dragging the Desk upward should reduce the height of the Earth screen instead of covering it.

The Desk is not TileSpace.

The Desk is where apps are managed and where tiles are deployed from. TileSpace is where deployed tiles run.

Current implementation:

- Rendered from `client/src/ui/layout/OlympusDesk.tsx`.
- Mounted in `client/src/ui/layout/ShellLayout.tsx`.
- Full-width layout element below the main content area.
- Height persisted in local storage.
- Active Desk app persisted in local storage.
- Dock placement persisted in local storage.

### Dock

The Dock is the app selector inside the Desk. It is not the Desk itself.

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

### TileSpace

TileSpace is the active tile layout area. It is where deployed app tiles, tile groups, widgets, and focus pages run.

TileSpace is the monitoring and workflow wall. The Desk is the control surface.

Planned TileSpace behavior:

- Hold active app tiles.
- Allow multiple app tiles to tile together.
- Allow app tiles to contain internal sub-tiles.
- Support global app widgets and sub-app widgets.
- Preserve tile state when the Desk opens, closes, or switches apps.
- Support named Focus Pages navigated by left/right arrows.
- Support smooth tile deployment and layout transitions.

## Desk and TileSpace app model

Olympus apps should follow this model:

```text
Dock = app selector
Desk = app management surface and tile deployment surface
TileSpace = active tile layout area
Tile = focused app container
Widget = movable capability inside a scope
Focus Page = named tile layout for a task
```

All apps should first open in the Desk. The Desk surface helps the operator understand the app, review status, manage settings, collaborate, take notes, choose tools, configure integrations, run automations, and deploy tiles.

Active app work appears in TileSpace as app tiles, widgets, tile groups, sub-tiles, and focus pages.

The Dock should open or focus the app Desk surface. Clicking the active app again should close or minimize the Desk. Clicking a different app should keep the Desk open and smoothly switch the Desk to that app.

See `docs/OLYMPUS_TILESPACE_AND_FOCUS_FRAMEWORK.md` for the full TileSpace doctrine.

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
- App Desk surfaces
- Tile deployment controls
- Widget manager
- Global app widgets
- Sub-app widgets
- App window legacy migration toward TileSpace
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
- TileSpace framework map
- App/tile/widget registry map

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

## TileSpace direction

TileSpace should become the main active workflow area for Olympus.

It should support:

- app tiles
- app tile groups
- sub-tiles
- widgets
- widget scopes
- focus pages
- saved layouts
- tile linking
- tile lifecycle states
- collaboration presence
- context notes
- assistant context awareness
- smooth deployment and layout transitions

## App window/workspace migration direction

Existing window language should be treated as legacy wording.

Future product language should prefer:

```text
TileSpace
Tile
App Tile
Sub-Tile
Widget
Focus Page
Tile Group
```

Focused work surfaces should be implemented as tiles or tile groups rather than ordinary floating app windows.

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
- The Desk becomes the primary app management and tile deployment surface.
- TileSpace becomes the active workflow and monitoring surface.
- Core apps provide local system control without requiring direct shell use.

## Development rules

- Keep Earth and Desk separated.
- Keep Desk and TileSpace separated.
- Dock buttons should not switch the main map unless explicitly designed to.
- Desk apps open inside the Desk.
- Apps open in Desk first through an app management surface.
- The Desk deploys tiles into TileSpace.
- TileSpace preserves active tile layouts while the Desk changes apps.
- Avoid ordinary window language as the primary app model.
- Widgets can later be dragged from the Desk to TileSpace or Earth when explicitly supported.
- Preserve local storage keys or provide migrations when changing saved Desk behavior.
- Keep file access safe and explicit.
