# Proxmox App Developer Handoff

## Start here

Development should begin from:

```text
apps/olympus-proxmox-data-center/PRODUCT_PLAN.md
```

Supporting files:

```text
apps/olympus-proxmox-data-center/app.manifest.json
apps/olympus-proxmox-data-center/README.md
apps/olympus-proxmox-data-center/NOTES.md
apps/olympus-proxmox-data-center/GUI_PLAN.md
docs/APP_PACK_INDEX.md
docs/DEVELOPMENT_GUARDRAILS.md
```

## Product intent

Olympus Proxmox Data Center is the Proxmox operations app for Dennco Olympus Command.

It should make Olympus the command interface for authorized Proxmox cluster visibility, VM/container inventory, support-lab repair workflows, live sandbox workspaces, AI-assisted lab editing, and production apply planning.

## Functional GUI requirement

The first development milestone must produce a visible, functional operator GUI. If backend API work is not ready, build the GUI with mock/configured data first.

The GUI plan is the required UI reference:

```text
apps/olympus-proxmox-data-center/GUI_PLAN.md
```

The first GUI milestone is acceptable when an operator can:

1. Open the Proxmox app from Olympus.
2. See a Proxmox overview dashboard.
3. See cluster, node, and VM/CT mock/configured inventory.
4. Click a cluster and view detail tabs.
5. Click a VM/CT and view an object panel.
6. Click Open Lab Workspace or Clone to Support Lab placeholder.
7. Open a Live Sandbox Workspace screen.
8. See live preview, file editor, logs, AI helper, and diff/validation areas.
9. See production actions marked as guarded/disabled.
10. Understand the intended safe workflow without reading backend code.

## Locked doctrine

```text
Production clusters remain external services.
Olympus manages them through authorized APIs.
The support lab is clone-only by default.
AI edits lab workspaces only.
Production changes require reviewed apply plans.
```

## Do not redefine

Do not turn the support lab into the production manager.
Do not migrate production VMs or clusters into the lab as the ordinary workflow.
Do not start with destructive production actions.
Do not expose Proxmox API credentials to the browser.
Do not let AI directly edit production files.

## Build order

### Phase 1: functional app GUI and safe inventory

- Add Proxmox Data Center route/shell.
- Add dashboard cards for clusters, nodes, VMs, containers, storage, backups, and alerts.
- Add mock/configured cluster registry.
- Add VM/CT inventory table.
- Add production object detail panels.
- Add customer/service linking placeholders.
- Add support lab workspace list.
- Add live sandbox UI placeholder.
- Add code/file editor placeholder.
- Add logs/diff/validation placeholder areas.
- Add AI helper panel placeholder.
- Mark production actions as guarded/disabled.

### Phase 2: authorized sync and lab workspace

- Add server-side Proxmox connector.
- Keep API credentials server-side only.
- Sync cluster/node/VM inventory.
- Add clone-to-lab workflow placeholder or first implementation.
- Add lab workspace object storage.
- Add file tree browsing for lab workspace.
- Add logs panel.
- Add editable text file viewer/editor for lab files.

### Phase 3: AI-assisted repair

- AI opens files on request.
- AI searches selected workspace.
- AI reads logs and selected files.
- AI suggests patches.
- AI applies approved lab edits.
- AI shows before/after diff.
- AI creates repair session notes.
- AI generates validation checklist.

### Phase 4: apply planning and approvals

- Generate change sets.
- Generate production apply plan.
- Generate rollback plan.
- Add approval states.
- Add audit trail.
- Add customer impact warning.
- Add maintenance window notes.

## First developer target

Build the visible operator experience first:

```text
Open Proxmox app
  -> see cluster/node/VM inventory shell
    -> open VM/CT object panel
      -> create/open lab workspace
        -> see live sandbox preview placeholder
          -> see code/file editor placeholder
            -> see AI helper placeholder
```

## Safety posture

Allowed early:

- Read production inventory.
- Display cluster/node/VM status.
- Create lab workspace records.
- Prepare clone-to-lab workflow.
- Edit lab files.
- Show live sandbox preview.
- Generate diffs.
- Generate apply plans.

Guarded later:

- Production restart.
- Production file apply.
- Production VM stop/start.
- Production restore.
- Production network changes.
- Production storage changes.
- Production delete operations.

Always approval-restricted:

- Delete VM/CT.
- Restore over production.
- Change production network.
- Change production firewall/security rules.
- Modify cluster settings.
- Stop critical services.
- Apply AI-generated changes to production.

## Required UI concepts

- Proxmox Data Center Manager
- Proxmox Support Lab
- Live Sandbox Workspace
- AI Workspace Manager
- Change Set Manager
- Production Apply Planner
- Customer Impact Map

## Developer completion note

At the end of each development session, update notes or report:

```text
Files changed:
Features added:
Guardrails respected:
Open issues:
Questions for research:
Next developer step:
```
