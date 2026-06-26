# Intel Maps Scalability Plan

This plan preserves the existing Intel Map apps while adding a scalable platform layer around them.

## Current rule

Existing map apps stay intact:

- Flight Map
- Maritime Map
- Monitor Map
- DOT Map
- Cyber Map

They remain usable as they are today while the platform layer grows around them.

## Target structure

```text
client/src/modules/intelmaps/
  builder/
  feeds/
  layers/
  registry/
  widgets/
  workflows/
  custom/
  integrations/
  sessions/
  workspace/
```

## Architecture

Maps should share data feeds, overlay definitions, widget definitions, and cache policies, but each open map should own its own map instance state.

Shared:

- layer definitions
- feed definitions
- widget definitions
- workflow definitions
- integration definitions
- cache/session helpers

Independent per map:

- base layer
- projection
- viewport
- enabled layers
- opened widgets
- selected entities
- notes/configuration

## Saved map format

Saved maps should be JSON definitions stored under:

```text
/var/lib/dennco/olympus-command/intel-maps
```

A saved map can include:

- title
- appId
- baseLayer
- projection
- viewport
- layers
- feeds
- widgets
- workflows
- integrations
- notes

## New Map Builder

The New Map GUI should eventually let an operator:

1. Name the map.
2. Pick a base layer.
3. Pick projection.
4. Set starting location.
5. Add layer folders.
6. Add feed folders.
7. Add widgets.
8. Add custom modules or workflows.
9. Save the map definition.
10. Reopen, duplicate, or publish the saved map.

## Deployment approach

Phase 1 adds registry/folder scaffolding and expanded saved-map JSON support.

Phase 2 wires the New Map Builder to the registry.

Phase 3 moves hard-coded map layers into reusable layer definitions.

Phase 4 adds workflow and integration execution.
