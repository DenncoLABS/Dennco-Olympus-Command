# TileSpace Core Build Handoff

## Purpose

This file prepares a future coding session to build the Olympus TileSpace core update without repeated clarification.

Treat this as planning and build direction. Do not treat any partial scaffold in the repo as final architecture unless it matches the doctrine below.

## Read first

- `docs/OLYMPUS_TILESPACE_AND_FOCUS_FRAMEWORK.md`
- `docs/OLYMPUS_DESK_AND_OS.md`
- `apps/README.md`
- `docs/PROJECT_CONTINUITY.md`
- `client/src/ui/layout/ShellLayout.tsx`
- `client/src/ui/layout/OlympusDeskV2.tsx`
- `client/src/ui/desk/registry/deskCatalog.ts`
- `client/src/ui/desk/registry/deskTypes.ts`
- `client/src/ui/theme/theme.store.ts`

## Core model

```text
Dock = apps
Desk = selected app management surface
TileSpace = active app tile area
App Tile = running app surface
Tile Group = multiple tiles from one app
Widget = movable capability inside a defined scope
Focus Page = named tile layout navigated by left/right arrows
```

## Required behavior

```text
Click app once: open Desk and focus that app.
Click same app again: close or minimize Desk.
Click different app: keep Desk open and switch to that app.
```

Apps must open through the Desk first. The Desk manages tools, tile deployment, widgets, notes, collaboration, automations, integrations, settings, permissions, and activity.

TileSpace displays active app tiles, tile groups, widgets, and focus pages.

## Milestone 1: shell alignment

- Inspect ShellLayout and OlympusDeskV2.
- Keep Earth/main content working.
- Keep existing activeModule map behavior.
- Make same Dock app toggle Desk closed.
- Make different Dock app switch Desk content smoothly.
- Replace visible legacy `Window` wording with TileSpace, Tile, Focus, or App Surface wording.
- Reduce slow animation timing if needed.

Acceptance:

- Existing app loads.
- Desk opens from Dock.
- Same app toggles Desk closed.
- Different app switches Desk.
- Earth/main content remains stable.

## Milestone 2: TileSpace MVP

- Add or refine shared TileSpace state.
- Track Focus Pages.
- Track active Focus Page.
- Track Tile Instances.
- Track Tile Groups.
- Track Widget Instances.
- Persist useful local state.
- Provide deploy, close, select, and focus navigation actions.

Acceptance:

- TileSpace appears as a distinct area or layer.
- Empty focus page tells user to deploy tiles from Desk.
- Deployed tiles appear and preserve state.
- Focus navigation does not destroy tiles.

## Milestone 3: registry metadata

- Extend app registry types for sub-apps, tiles, widgets, focus templates, and Desk sections.
- Add initial metadata for Intel Maps first.
- Keep old app definitions working.
- Render generic Desk controls from metadata where possible.

Acceptance:

- Intel Maps declares sub-apps, deployable tiles, widgets, and a quad template.
- App Desk can show tile and widget options from metadata.

## Milestone 4: Intel Maps quad proof

Flow:

```text
Dock -> Intel Maps
Desk -> Intel Maps control surface
Deploy Quad -> TileSpace shows four Intel Maps sub-app tiles
```

Quad tiles:

```text
Flight Map
Maritime Map
DOT Map
Monitor Map
```

Acceptance:

- User can deploy the quad from Desk.
- Four tiles appear in TileSpace.
- Each tile has its own sub-app identity.
- Global widgets and sub-app widgets are represented at least as placeholders.

## Milestone 5: smooth operations

Rules:

```text
No layout jumping.
No disappearing state.
No app click should destroy tile work.
Close, hide, remove, and end must mean different things.
```

Suggested timing:

```text
Most UI animations: 120-220ms
Major Desk open/close: 180-280ms
```

Acceptance:

- Desk open, close, and app switch feel smooth.
- Tile deployment feels smooth.
- Focus navigation feels smooth.

## Milestone 6: standard app Desk sections

Every app Desk should eventually show:

```text
Overview
Status / Health
Tools / Sub-apps
Deploy App Tile
Tile Layouts
Widget Manager
Global App Widgets
Sub-App Widgets
Collaboration
Notes
Automations
Integrations
Related Apps
Core App Settings
Permissions / Guardrails
Activity
```

Acceptance:

- App Desk layout is familiar across apps.
- User can find notes, settings, widgets, integrations, automations, and deployed tiles.

## Milestone 7: saved layouts

- Save Focus Layout.
- Load Focus Layout.
- Duplicate Focus Layout.
- Reset Focus Layout.
- Archive Focus Layout.

Acceptance:

- User can leave and return to a layout without losing tile structure.

## Milestone 8: assistant context readiness

Expose a read-only session object with:

```text
active app
active Desk surface
active Focus Page
selected tile
selected object
linked tiles
open context
current workflow
```

Acceptance:

- A future assistant can understand workspace context without guessing.

## Build order

```text
1. Stabilize shell and Dock behavior.
2. Build TileSpace MVP.
3. Convert arrows into Focus Page navigation.
4. Add registry metadata support.
5. Build Intel Maps quad proof.
6. Add standard app Desk sections.
7. Polish smooth interactions.
8. Add saved layouts.
9. Add assistant context object.
```

## Final acceptance

The core update is ready when Dock selects apps, Desk manages apps, TileSpace runs active tiles, Focus Pages navigate with arrows, Intel Maps can deploy a quad group, state is preserved, and the UI language consistently uses TileSpace, Tile, Widget, Focus, and App Surface.
