# TileSpace Preview

This is the first deployable TileSpace MVP checkpoint.

## Intel Maps Quad

TileSpace will support an Intel Maps quad group made of four app tiles:

- Flight Map
- Maritime Map
- DOT Map
- Monitor Map

## Safety rules for this checkpoint

- Dock behavior is untouched.
- Existing Desk runtime is untouched.
- Full-screen map pages are not mounted inside TileSpace tiles.
- The current implementation only adds safe registry metadata and embeddable tile card components.

## Next UI step

Wire `TileRuntimeCard` into an isolated app surface or preview tab, then move to real embeddable map runtimes after that compiles cleanly.
