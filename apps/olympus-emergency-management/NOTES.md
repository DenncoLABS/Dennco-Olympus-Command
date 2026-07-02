# Olympus Emergency Management Notes

## Planning status

Draft. This app pack exists to collect emergency-management-specific direction without pushing emergency-only assumptions into the Olympus core.

## Research questions

1. Which hazards should be prioritized first: weather, fire, flood, seismic, utility outage, or transportation disruption?
2. Which official public feeds should be enabled first?
3. What situation report format should be generated?
4. How should shelters, resources, and road closures be represented?
5. What human-review rules are needed before alerts are sent externally?

## Candidate source lanes

- NOAA / NWS alerts
- FEMA public data
- USGS seismic feeds
- NASA FIRMS fire/thermal events
- DOT road closures
- Utility outage public feeds where available
- Authorized local resource lists

## Developer reminder

Emergency-management-specific behavior should start inside this app pack or an emergency extension. Keep operator decision-making human-approved and auditable.
