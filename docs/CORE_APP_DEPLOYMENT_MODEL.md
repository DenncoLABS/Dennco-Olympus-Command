# Core App Deployment Model

## Purpose

This document defines how Olympus apps should deploy and open inside the Olympus shell.

Olympus has three related interface layers:

```text
Dock = launcher
Desk = first approach workspace
Window = focused working surface
```

Apps should not jump straight into a full-screen isolated product by default. Every app should first open in the Desk so the operator can understand the service, select a workflow, inspect status, and decide how to proceed.

## Core rule

```text
All Olympus apps open through the Desk first.
The Dock launches the app into the Desk.
The Desk provides the service approach screen.
Windows open from the Desk when the operator chooses a focused workflow.
```

## Current foundation

Existing docs already separate the shell into Earth, Desk, and Dock:

- Earth is the main operational map/canvas.
- Desk is the full-width bottom workspace.
- Dock is the launcher inside the Desk.
- Dock buttons open apps inside the Desk and do not change the Earth screen unless explicitly designed.

The app system already treats apps as standalone products or deployable experiences with their own routing, product identity, release cycle, domain, or deployment target.

This document connects those two ideas into one required deployment pattern.

## Deployment stack

```text
Olympus Shell
  -> Earth screen
  -> Desk
    -> Dock
      -> App approach screen
        -> App workspaces
          -> App windows
            -> Detail panels / editors / maps / consoles
```

## App opening sequence

When an operator launches an app:

```text
Click Dock app icon
  -> Desk opens or focuses
    -> App approach screen loads in Desk
      -> App shows status, purpose, workflows, recent objects, and safe next actions
        -> Operator opens a workspace or window
```

The app should not assume the operator already knows what to do.

The first screen should help answer:

```text
What is this service?
What is its current state?
What objects can I work on?
What workflows are available?
What is safe to do first?
What requires approval?
```

## App approach screen

Every app should have a Desk-first approach screen.

Required sections:

- App title and purpose
- Service status
- Data/source status
- Primary workflows
- Recent objects
- Open workspaces
- Alerts / issues
- Guardrails / permissions
- Quick actions
- Documentation or help link

Example workflows:

```text
Open dashboard
Open map layer
Open object registry
Open workspace
Create report
Review alerts
Open settings
```

## Window behavior

Windows are focused work surfaces opened from the Desk.

Windows are used for:

- Object detail panels
- Editors
- Live sandbox workspaces
- Report builders
- Maps that need focus
- Configuration workflows
- Consoles
- AI repair sessions

Window behavior should be consistent:

- Open from an app approach screen or object panel.
- Preserve app context.
- Show title, app, object, and status.
- Support minimize/focus/close if the window system exists.
- Never hide production guardrails.

## Dock behavior

The Dock is not the app itself. It is the launcher.

Dock button rules:

- Dock button opens the app approach screen in Desk.
- If the app is already open, Dock focuses it.
- Dock should not directly open a deep destructive action.
- Dock should not replace the Earth screen unless explicitly approved.
- Dock can show app badges for alerts, running tasks, or open windows.

## Desk behavior

The Desk is the operator's first decision layer.

Desk app screens should help the operator decide how to approach a service before opening deep tools.

Desk screens should support:

- app summary
- workflow cards
- active workspace list
- recent activity
- object search
- safe action buttons
- status/guardrail banners

## Earth behavior

Earth remains the operational map/canvas.

Apps may contribute map layers, object markers, and context panels to Earth, but app launch still begins in Desk unless the app is explicitly a map module already operating on Earth.

Rules:

- Earth remains active while Desk is open.
- Desk should not cover Earth as a floating overlay.
- App windows may reference Earth objects.
- Widgets can later be promoted from Desk to Earth.

## App manifest additions

Each app manifest should eventually support deployment/opening metadata.

Recommended manifest fields:

```json
{
  "id": "example-app",
  "name": "Example App",
  "kind": "app",
  "type": "dashboard",
  "status": "draft",
  "launch": {
    "surface": "desk",
    "approachRoute": "/apps/example-app",
    "defaultWorkspace": "overview",
    "opensWindows": true,
    "earthLayer": false
  },
  "desk": {
    "dockLabel": "Example",
    "dockIcon": "example",
    "summary": "Short operator-facing purpose.",
    "primaryWorkflows": ["overview", "registry", "reports"]
  }
}
```

## App types and opening expectations

### Dashboard app

Opens in Desk with dashboard/registry/workflow choices. Detail work opens in windows.

### Public portal app

Opens in Desk for admin/operator management. Public-facing deployment may have a separate external route.

### Mobile shell app

Opens in Desk for configuration and preview. Mobile packaging is a deployment target, not the primary Olympus operator surface.

### Integration app

Opens in Desk with connection status, sync status, source health, object registry, and guarded actions.

### Admin app

Opens in Desk with settings categories, audit, permissions, and guarded control panels.

## Required app screen pattern

Every app should provide at least three levels:

```text
Level 1: Desk approach screen
Level 2: Workspace / registry / dashboard
Level 3: Window / object detail / editor / workflow
```

## Example: Proxmox app

```text
Dock: Proxmox
  -> Desk: Proxmox approach screen
    -> Overview dashboard
    -> Cluster registry
    -> VM/CT registry
    -> Support lab workspaces
      -> Window: live sandbox workspace
        -> preview + files + logs + AI helper
```

## Example: Cyber app

```text
Dock: Cyber
  -> Desk: Cyber approach screen
    -> advisory feed
    -> asset relevance
    -> vulnerability registry
      -> Window: CVE detail / affected systems / brief builder
```

## Example: Municipal app

```text
Dock: Municipal
  -> Desk: Municipal approach screen
    -> city/county dashboard
    -> infrastructure map layers
    -> reports
      -> Window: public works issue / meeting record / project detail
```

## Development rule

When building or updating an app, developers must implement the Desk-first launch path before deep app-specific workflows.

Do not build apps as disconnected pages that bypass the Olympus Desk/Dock/Window model.

## First core update target

The core update should add or formalize:

- app registry loaded from app manifests
- Dock app launcher entries generated from app registry
- Desk app approach screen host
- app window/workspace host
- consistent app route pattern
- manifest fields for launch and desk metadata
- placeholder approach screens for draft app packs

## Acceptance criteria

The core app deployment update is acceptable when:

1. Apps can be represented in a central registry.
2. Dock can launch apps into Desk.
3. Each app has a Desk-first approach screen.
4. An app can open a focused window/workspace from its approach screen.
5. Draft app packs can show placeholder approach screens.
6. Existing Earth/map behavior is preserved.
7. Production or guarded workflows cannot be launched directly from Dock.
