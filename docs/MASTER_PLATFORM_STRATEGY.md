# Master Platform Strategy

Dennco Olympus Command is the master operational intelligence platform for the Dennco ecosystem. The codebase should not be treated as a single-market dashboard or one narrow application. It is the shared command core from which specialized products, mirrors, extensions, and industry deployments are built.

The current code direction already supports this model through the core platform, Earth screen, Olympus Desk, module apps, extensions, mirrors, deployable apps, platform manifests, Debian packaging, and the planned GNOME appliance shell direction.

## Strategic thesis

```text
Olympus Command is the master platform.
Industry versions are specialized deployments built from the master platform.
Apps, mirrors, and extensions are the vectors that let the platform adapt without splitting the core.
```

The platform should stay broad at the core and specific at the edge. The master copy should provide shared command capability. Industry versions should provide targeted workflows, source packs, user roles, dashboards, reports, compliance notes, and deployment profiles.

## Core platform

The core platform is responsible for capabilities that every Olympus deployment may need:

- Identity, access, roles, and future directory integration.
- Earth/map operational canvas.
- Olympus Desk and Dock shell.
- Module routing and shared layout behavior.
- Data-source normalization standards.
- Source-health diagnostics.
- AI synthesis and briefing surfaces.
- Notifications, alerts, and operator-facing status.
- Runtime branding and deployment settings.
- Audit, safety, and administrative controls.
- Debian packaging and service operation.

Core changes should improve Olympus Command as a platform. A capability belongs in core only when it benefits the shared command environment or multiple product lanes.

## Expansion lanes

Olympus Command uses three primary expansion lanes.

### Extensions

Extensions add capabilities inside the main Olympus platform without rewriting the core. They may add modules, widgets, routes, integrations, background workers, source adapters, or specialized panels.

Use an extension when the capability belongs inside the command environment and should be available to selected deployments.

Examples:

- Cyber source adapter.
- Infrastructure risk widget.
- Finance signal panel.
- Weather alert normalizer.
- AI report assistant.

### Mirrors

Mirrors are deployment profiles. They allow the same core to appear as a branded, regional, partner-facing, public, internal, or read-only replica.

Use a mirror when the deployment needs different branding, domains, enabled modules, source sets, policy posture, geography, or customer configuration while remaining connected to the same platform lineage.

Examples:

- Municipal mirror.
- Regional infrastructure mirror.
- Partner-branded public dashboard.
- Internal Dennco operations mirror.
- Read-only executive mirror.

### Apps

Apps are standalone products or deployable experiences built on top of Olympus Command. They may have their own routing, release cycle, identity, domain, customer target, or deployment package.

Use an app when the capability becomes a product, industry version, or customer-facing application rather than only a module inside the main platform.

Examples:

- Olympus Municipal.
- Olympus Cyber.
- Olympus Emergency Management.
- Olympus Infrastructure.
- Olympus Enterprise Operations.
- Olympus Data Center Operations.

## Industry product model

Industry versions should be assembled from the master platform instead of forked away from it.

```text
Master platform
  -> shared core
  -> selected extensions
  -> selected source packs
  -> mirror deployment profile
  -> optional standalone app
  -> industry-specific dashboard and reports
```

Each industry product should define:

- Target users.
- Enabled modules.
- Required data sources.
- Source authorization level.
- Dashboard layout.
- Report templates.
- Alerts and severity rules.
- User roles and permissions.
- Compliance or policy notes.
- Deployment mode.

## Candidate industry lanes

The master platform should remain flexible, but planning can prepare app-pack concepts for:

- Municipal operations.
- Infrastructure and public works.
- Cybersecurity and internet intelligence.
- Emergency management.
- Aviation operations.
- Maritime operations.
- Enterprise security.
- Data center operations.
- Logistics and transportation.
- Real estate and property intelligence.
- Government affairs and public-source monitoring.

These should be treated as product lanes, not replacements for the core.

## Source and safety posture

Olympus Command should organize lawful, authorized, and approved information. It must not be framed or implemented as an unlawful surveillance, hacking, doxxing, credential-theft, harassment, or private-person targeting system.

Preferred data-source posture:

- Public government data.
- Licensed commercial APIs.
- Organization-owned data.
- User-uploaded authorized files.
- Public emergency, weather, infrastructure, cyber, market, and event feeds.
- Partner-approved data integrations.

Restricted source posture:

- Stolen credentials.
- Hacked datasets.
- Leaked private databases.
- Unauthorized camera feeds.
- Private personal information without consent or lawful basis.
- Data acquired by bypassing access controls.

## AI posture

AI should support operators, not silently replace human judgment.

Allowed AI functions:

- Summarize approved sources.
- Cluster events.
- Draft situation reports.
- Extract entities from authorized text.
- Compare source claims.
- Generate briefing notes.
- Flag uncertainty.

AI output should include source context, timestamp, uncertainty, and human-review status where practical.

AI should not silently decide truth, legal responsibility, guilt, threat status, or enforcement action.

## Documentation rule

Future documentation should point all vectors in the same direction:

```text
Olympus Command is the master platform.
The master platform stays broad.
Extensions add capability.
Mirrors shape deployments.
Apps become products.
Industry versions are assembled from the master copy.
```

Development should protect this architecture. Research should refine doctrine, policy, source approval, industry-pack planning, and product language before sending new plans to development.
