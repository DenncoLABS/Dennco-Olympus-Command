# Intel Map Asset Model

An Intel Map is a saved operational view over shared map assets. It is not a separate data universe.

## Core objects

### Asset

An asset is the durable object being tracked or documented.

Examples:

- `aircraft-a1b2c3`
- `vessel-123456789`
- `vehicle-fleet-vehicle-132`
- `custom-warehouse-camera-7`

Assets live under:

```text
/var/lib/dennco/olympus-command/assets
```

Each asset has its own folder:

```text
/var/lib/dennco/olympus-command/assets/<asset-type>s/<unique-id>/
  asset.json
  history/
    movement.json
  documents/
  notes/
  photos/
```

### Tracking

Tracking is the live state of an asset.

When a radar/feed/source sees the asset, tracking becomes online and the latest telemetry is stored in `asset.json`. Movement points are appended to:

```text
history/movement.json
```

When a feed is not active or the asset is not recently observed, the asset still exists, but its tracking status can be offline/stale.

### Intel Map

An Intel Map is a saved filter/view over assets and feeds.

It stores things like:

- map title
- base layer
- projection
- viewport
- feeds
- visible layers
- asset filters
- tracked asset IDs
- movement trail options
- widgets and tools

Saved Intel Maps live under:

```text
/var/lib/dennco/olympus-command/intel-maps
```

A saved Intel Map should answer: "Which assets and feeds do I want to see, and how should they be shown?"

It should not duplicate the asset data itself.

## Example: Fleet Vehicle 132

The user creates a vehicle asset:

```json
{
  "assetType": "vehicle",
  "uniqueId": "fleet-vehicle-132",
  "label": "Fleet Vehicle 132",
  "photoPath": "/var/lib/dennco/olympus-command/assets/vehicles/fleet-vehicle-132/photos/company-vehicle.jpg",
  "details": {
    "unitNumber": "132",
    "department": "Field Operations",
    "make": "Ford",
    "model": "F-150"
  },
  "tracking": {
    "enabled": false,
    "status": "offline"
  }
}
```

Later, a tracking feed reports location. The asset is updated, and a movement point is appended to its history file.

## Example: Radar-created aircraft

A radar/feed sees ICAO `a1b2c3`.

Olympus creates or updates:

```text
/var/lib/dennco/olympus-command/assets/aircrafts/a1b2c3/asset.json
/var/lib/dennco/olympus-command/assets/aircrafts/a1b2c3/history/movement.json
```

The asset can then appear on any Intel Map whose filters include that aircraft, its source, its status, or its type.
