# Data Sources

Olympus Command is a common-operational-picture platform. Data sources are organized around the OODA loop:

```text
Observe → Orient → Decide → Act
```

The system should collect data, normalize it, present it on the Earth/map screen or Desk, and support human-approved decisions. No autonomous kinetic behavior is part of this civilian Olympus implementation.

## Current and planned feeds

### Aviation

- ADS-B / aircraft state feeds.
- Emergency squawk and aircraft status logic.
- Airport and aviation infrastructure overlays.
- Atmospheric weather visualization.

### Maritime

- AISStream vessel data.
- Vessel position, heading, speed, destination, and status.
- Vessel history and data-folder concept.
- Static AIS object/source-kind expansion.
- Mayday/distress context.

### DOT / traffic

- DOT traffic event feeds.
- Public traffic-camera / CCTV feeds.
- Road-level flow visualization.
- Camera and traffic event popups.

### Monitor

- GPS interference data.
- Rocket alert layers.
- Gulf / UAE / GCC watch data.
- Military and infrastructure markers.
- Live OSINT feeds.
- AI synthesis from regional signals.

### GDELT

Planned use:

- Global event monitoring.
- Regional news/event correlation.
- Early signal detection.
- Event clustering and trend shifts.

### NASA FIRMS

Planned use:

- Fire and thermal anomaly detection.
- Disaster and infrastructure-event monitoring.
- Layered event map overlays.

### USGS

Planned use:

- Earthquake/seismic event feeds.
- Event severity and regional impact surfaces.
- Correlation with infrastructure and logistics layers.

### NOAA / NWS

Current/planned use:

- Atmospheric weather layers.
- Severe weather context.
- Forecast and warning overlays.
- Operational risk context for Flight, Maritime, DOT, and Monitor.

### Yahoo Finance

Planned use:

- Market signal feeds.
- Watchlist and index monitoring.
- Economic condition context for operational intelligence.

### Polymarket

Planned use:

- Public probability-market signals.
- Event expectation monitoring.
- Contextual probability changes tied to geopolitical, economic, or infrastructure topics.

### Public CCTV feeds

Current/planned use:

- DOT-integrated public traffic camera markers.
- Public camera feeds from curated repositories and public agencies.
- Camera metadata normalization.
- Camera visibility tied to the DOT map and later Desk widgets.

### Public satellite references

Planned use:

- Intel/Monitor page reference layer.
- Public satellite/source references from curated lists.
- Not for DOT.

## Source integration standards

Every new feed should have:

- A server-side route or data-service module.
- A normalized TypeScript type.
- A source-health diagnostic.
- A visible UI status label.
- Cache and timeout behavior.
- Safe failure states.
- No client-exposed secrets.
- Clear attribution when required.

## Suggested source lifecycle

```text
Raw provider → Server fetcher → Normalizer → Cache → API route → UI hook → Map/Desk widget
```

## Secrets

API keys and credentials belong in server-side environment files only:

```text
/etc/dennco/olympus-command/olympus-command.env
```

Never commit production credentials, provider tokens, or uploaded secret files.
