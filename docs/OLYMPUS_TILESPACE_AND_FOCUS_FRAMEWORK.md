# Olympus TileSpace and Focus Framework

## Purpose

This document defines the core user-interface framework for Olympus: Dock, Desk, TileSpace, app tiles, widgets, focus pages, notes, collaboration, integrations, app settings, and smooth multitasking.

Olympus should not feel like a normal desktop with overlapping windows. It should feel like a focused workspace where the user sees only the panels needed for the current task.

## Core idea

```text
Dock selects apps.
Desk manages apps.
TileSpace displays app tiles.
Tiles hold focused work surfaces.
Widgets extend tiles.
Focus pages organize tiles around a task.
```

## Primary surfaces

```text
Dock = app selector
Desk = app management surface and tile deployment surface
TileSpace = active tile layout area
Tile = focused app container
Widget = movable capability inside a scope
Focus Page = named tile layout for a task
Earth = shared map/canvas
```

The Desk is not TileSpace.

The Desk is where tiles are deployed from. TileSpace is where deployed tiles run.

## Dock behavior

```text
Click app once:
  -> open Desk
  -> focus selected app surface

Click same app again:
  -> close or minimize Desk

Click different app:
  -> keep Desk open
  -> smoothly switch Desk to the new app
```

## Desk responsibilities

Every app Desk surface should include:

```text
App Overview
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

The Desk is where apps are configured, coordinated, connected, and used to deploy tiles.

## TileSpace responsibilities

TileSpace is the active tile layout area.

```text
TileSpace:
  monitor
  review
  compare
  write
  analyze
  focus
```

TileSpace should preserve tile state while the Desk opens, closes, or switches apps.

## App tiles

Apps do not primarily open as ordinary windows.

Apps live on the Desk and deploy app tiles into TileSpace.

An app tile is a running surface for an app. It can be simple or it can contain its own internal tiled workspace.

```text
TileSpace
  -> App Tile
      -> internal tile layout
          -> sub-tiles / panels / widgets
```

When multiple apps are active, their app tiles tile together at the system level.

Inside each app tile, that app can tile its own internal tools.

## App tile groups

When multiple tiles from the same app are deployed, Olympus can group them.

```text
App Tile Group
  -> Tile 1: Sub-App A
  -> Tile 2: Sub-App B
  -> Tile 3: Sub-App C
  -> Tile 4: Sub-App D
```

Top-level TileSpace can tile the group with other app tiles or other app groups.

## Widget scope model

Every app needs a Widget Manager.

Widgets must have a scope so users understand where they can move and what context they affect.

```text
system
app
app-group
sub-app
tile
```

A global app widget can move across all tiles in that app group.

A sub-app widget only moves inside its parent sub-app tile unless promoted.

## Tile identity

Every tile needs an identity so Olympus can preserve state, restore layouts, support collaboration, and understand the workspace.

```text
tile ID
app ID
sub-app ID
widget type
object ID
focus ID
scope
state
position
size
permissions
linked tiles
created by
created time
last updated time
```

## Tile lifecycle states

```text
created
loading
live
paused
stale
warning
error
editing
review-needed
locked
closed
archived
```

## Tile scope badges

Every tile or widget should visibly show its scope.

```text
System
App
App Group
Sub-App
Tile Local
```

## Tile lock modes

```text
free
locked
pinned
read-only
operator-only
review-needed
```

## Tile linking

Tiles should be linkable.

Tile linking modes:

```text
independent
follow selected object
follow active focus
follow app
follow sub-app
manual link
```

This allows one selected object or focus context to update related tiles.

## Focus pages

Left/right arrows in the tile area should navigate focus pages or tile groups.

A Focus Page is a named tile layout for a task.

```text
Global Monitoring
Customer Review
Research Session
Workflow Review
Quad Map Watch
```

A focus page contains one or more app tiles, app tile groups, and widgets.

## Saved layouts

```text
Save Focus Layout
Load Focus Layout
Set as Default
Share with Team
Reset Layout
Duplicate Layout
Archive Layout
```

## Tile duplication and grouping

Supported group operations:

```text
Create App Group
Ungroup
Add Tile to Group
Move Tile out of Group
Save Group Layout
```

## Collaboration

Collaboration should be built into the Desk and visible on tiles.

Tile presence may include:

```text
person viewing
person editing notes
assistant active
assigned user
last touched by
```

The Desk should include collaborators, shared sessions, comments, mentions, handoff notes, and assigned users.

## Notes

Notes should attach to context.

Notes may attach to:

```text
app
tile
object
focus
workflow
customer
workspace
plan
```

## Assistant context awareness

The assistant should know the active app, active Desk surface, active focus page, selected tile, selected object, linked tiles, open context, and current workflow.

The assistant should help build focus layouts, recommend tiles, link related tiles, summarize tile context, and help users preserve focus.

## Command palette

A future command palette should support fast multitasking.

```text
open app
deploy tile
create focus
show assistant
save layout
open related app
```

## Smooth interaction rules

Smoothness is core OS behavior, not decoration.

```text
No layout jumping.
No disappearing state.
No app click should destroy tile work.
No confusing difference between close, hide, remove, and end.
```

Use clear meanings:

```text
Hide Desk = collapse control surface
Close tile = remove tile from TileSpace
End focus = close an entire focus layout
Switch app = change Desk controls
Deploy tile = add active surface
```

Recommended interaction timings:

```text
Most UI animations: 120-220ms
Major Desk open/close transitions: 180-280ms
```

## Tile deployment behavior

Early MVP:

```text
Click Deploy Tile
  -> tile appears with smooth scale/fade
  -> TileSpace updates layout
```

Later:

```text
Drag tile tool from Desk into TileSpace
  -> ghost preview appears
  -> valid drop zones highlight
  -> drop tile into position
  -> tile animates into layout
```

## App Desk must show deployed tiles

When an app is active on the Desk, it should show what tiles from that app are deployed.

Users should be able to focus, close, duplicate, group, or save those tiles.

## Naming standard

Use these terms consistently:

```text
Dock
Desk
TileSpace
Tile
App Tile
Sub-Tile
Widget
Widget Manager
Focus
Focus Page
Tile Group
App Group
```

Avoid using window as the main product language. If needed for compatibility, treat windows as legacy wording for tiles.

## Core data model candidates

```text
AppDefinition
SubAppDefinition
TileDefinition
TileInstance
TileGroup
WidgetDefinition
WidgetInstance
WidgetScope
TileLayout
FocusLayout
FocusPage
TileLink
TilePresence
ContextNote
AutomationDefinition
IntegrationDefinition
```

## Implementation principle

The core should move toward a registry-driven framework where apps declare:

```text
Desk surface
sub-apps
tile types
widget catalog
widget scopes
available layouts
settings
permissions
automations
integrations
collaboration hooks
notes support
```

## Final doctrine

```text
Olympus is a TileSpace operating framework for multitaskers.

The Dock selects apps.
The Desk manages apps and deploys tiles.
TileSpace runs active tile layouts.
Apps can tile with other apps at the system level.
Each app tile can tile internally.
Global app widgets can move across an app tile group.
Sub-app widgets stay inside their parent sub-app tile.
Focus pages organize the tile environment around a task.
```
