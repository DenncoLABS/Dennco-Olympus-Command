# Desk Dock Phase 3 Extraction

Phase 3 continues the Desk/Dock scalability work by separating shell responsibilities from app-host responsibilities.

## Current state

The Desk registry and Dock registry now exist, and OlympusDeskV2 reads app definitions from the registry catalog.

## Next extraction target

The remaining large component should be split into smaller parts:

```text
client/src/ui/desk/
  DeskAppHost.tsx
  DeskHatch.tsx
  DeskBody.tsx
  TileScreenSwitcher.tsx

client/src/ui/dock/
  OlympusDock.tsx
  DockWidget.tsx
  dockOrder.ts
```

## Rule

OlympusDeskV2 should become the shell coordinator only. It should not permanently own every Desk app body, Dock item, settings surface, and Tile Screen control.

## Safe sequence

1. Move app rendering into DeskAppHost.
2. Move TileScreenSwitcher into its own file.
3. Move DockWidget into its own file.
4. Move Dock ordering helpers into a small utility.
5. Keep the existing view names and local storage keys unchanged during migration.

## Preserved behavior

- powered hatch
- hatch resize
- auto close
- Dock placement
- Dock reorder
- Tile Screen navigation
- existing Desk app views
