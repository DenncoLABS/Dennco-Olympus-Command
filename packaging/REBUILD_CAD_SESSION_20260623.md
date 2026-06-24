# Rebuild CAD and Session Persistence

This file intentionally lives under `packaging/` because the apt publish workflow watches that path.

Purpose:
- Publish the CAD module that embeds the Resgrid CAD surface inside Olympus.
- Publish persistent operator shell session state.
- Preserve active module, projection, sensor mode, map layer, and weather radar settings across reloads.
