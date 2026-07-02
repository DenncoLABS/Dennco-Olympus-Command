# Olympus Infrastructure Notes

## Planning status

Draft. This app pack exists to collect infrastructure-specific direction without pushing infrastructure-only assumptions into the Olympus core.

## Research questions

1. Which infrastructure class should come first: roads, bridges, water, power, telecom, or facilities?
2. Which source data is public versus sensitive?
3. What access controls are needed for critical infrastructure views?
4. What inspection/maintenance workflow should be modeled first?
5. What report format is commercially useful first?

## Candidate source lanes

- DOT road and bridge data
- Public project lists
- Inspection records where authorized
- Maintenance schedules
- Weather and hazard feeds
- Utility/public outage feeds where available
- Organization-owned asset inventories

## Developer reminder

Infrastructure-specific behavior should start inside this app pack or an infrastructure extension. Treat sensitive facility and critical infrastructure data as access-controlled by default.
