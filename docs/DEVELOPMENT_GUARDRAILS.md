# Development Guardrails

Dennco Olympus Command is the master operational intelligence platform for the Dennco ecosystem. Developer sessions must protect the foundational scaffold and scalable platform direction already documented in this repository.

## Foundational rule

Developer sessions must follow the project notes, app-pack scaffold, platform architecture, and master-platform strategy before making structural changes.

The required direction is:

```text
Core platform first.
Specialized products second.
Extensions, mirrors, apps, and source packs at the edge.
```

Developers must not flatten Olympus Command into one narrow product lane. They must not hard-code industry-specific assumptions into the shared core unless the feature clearly benefits multiple app packs or platform deployments.

## Conflict rule

If a requested change conflicts with the foundational notes, scalable platform direction, app-pack scaffold, or master-platform architecture, the developer must pause before building or deploying that change.

The conflict process is:

1. Identify the conflict clearly.
2. Record the conflict in the appropriate notes or handoff area.
3. Ask the research/planning side and development team for direction.
4. Wait until the plan is settled.
5. Write the settled plan into the notes/scaffold.
6. Continue development only after the direction is documented.

## Deployment rule

Developer sessions should not deploy, publish, or deeply implement a conflicted direction until the research/planning side has resolved the conflict and the approved direction is reflected in the notes.

## Scaffold rule

The scaffold exists to keep all vectors moving in the correct direction:

- `docs/MASTER_PLATFORM_STRATEGY.md` defines the master platform doctrine.
- `docs/APP_PACK_INDEX.md` defines the app-pack system.
- `platform/README.md` defines platform expansion lanes.
- `apps/*/NOTES.md` holds product-lane notes.
- `extensions/*` should hold plug-in capability notes.
- `mirrors/*` should hold deployment-profile notes.

Developer sessions should read these files before making architecture-level decisions.

## Core protection rule

Core is for shared capability. Apps, mirrors, extensions, and source packs are for specialized direction.

A feature belongs in core only when it improves the shared Olympus platform or benefits multiple product lanes. Otherwise, it should start in the appropriate app pack, extension, mirror, or planning notes.

## Continuity rule

No developer session should leave the project pointed in a different direction than the foundational scaffold. If the direction changes, the notes must change first.
