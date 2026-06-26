# Desk and Dock Scalability Plan

The Olympus Desk and Dock are intended to function as the operating shell layer for Olympus Core.

## Preserved behavior

This plan preserves the current powered hatch, draggable Dock widgets, Tile Screen switcher, app buttons, and existing Desk views.

## Current limitation

The current Desk/Dock implementation is concentrated in:

```text
client/src/ui/layout/OlympusDeskV2.tsx
```

That file currently contains app definitions, Dock layout behavior, Desk view routing, app panels, settings, and tile switching.

## Target structure

```text
client/src/ui/desk/
  registry/
    deskTypes.ts
    deskCatalog.ts
    index.ts
  deskScalabilityBootstrap.ts

client/src/ui/dock/
  registry/
    dockTypes.ts
    dockCatalog.ts
    index.ts
```

Future extraction should continue toward:

```text
client/src/ui/desk/
  OlympusDeskShell.tsx
  DeskHatch.tsx
  DeskBody.tsx
  DeskAppHost.tsx
  TileScreenSwitcher.tsx

client/src/ui/dock/
  OlympusDock.tsx
  DockWidget.tsx
  dock.store.ts
  dockPersistence.ts
```

## Registry rule

Apps, widgets, modules, and actions should register into the Desk/Dock instead of being hard-coded directly into the shell component.

A new app should be defined once and then become available to:

- Dock
- Apps Browser
- Desk host
- Admin settings
- permissions
- workflows

## Phase plan

Phase 1 adds registry types and catalogs while preserving the current Desk.

Phase 2 changes OlympusDeskV2 to read app and Dock definitions from the registry.

Phase 3 extracts DeskAppHost and view components.

Phase 4 adds widget-return and workflow-aware Dock behavior.
