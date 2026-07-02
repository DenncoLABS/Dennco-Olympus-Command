# Olympus Proxmox Data Center GUI Plan

## Purpose

The first Proxmox development milestone must produce a functional operator GUI, not only backend scaffolding.

The GUI should let an operator open the Proxmox app, understand cluster status, inspect VMs/containers, open a lab workspace, view a live sandbox area, see editable files, and use an AI helper panel.

The first version may use mock/configured data, but the navigation and workflow should feel real.

## GUI doctrine

```text
Build the visible operator experience first.
Make every major object clickable.
Show safe placeholders for future actions.
Keep production actions guarded.
Expose the lab workflow clearly.
```

## Main navigation

The Proxmox app should have a dedicated route or app surface from Olympus Desk/Dock/Admin navigation.

Suggested route names:

```text
/proxmox
/proxmox/clusters
/proxmox/lab
/proxmox/workspaces/:workspaceId
```

## Primary screens

### 1. Proxmox Overview Dashboard

Purpose: give a command-center summary of all configured Proxmox environments.

Required GUI elements:

- Header: Olympus Proxmox Data Center
- Status cards:
  - clusters
  - nodes
  - VMs
  - containers
  - storage usage
  - backup status
  - alerts
  - lab workspaces
- Cluster health table
- Recent tasks / events panel
- Customer/service impact placeholder
- Buttons:
  - Add Cluster Profile
  - Sync Inventory
  - Open Support Lab
  - View Guardrails

MVP can use mock/configured data, but cards should render real UI states.

### 2. Cluster Registry Screen

Purpose: show all Proxmox clusters known to Olympus.

Required GUI elements:

- Cluster list/table
- Filter by environment: production, staging, lab, archive
- Health badges
- Last sync time
- Node count
- VM/CT count
- Storage pressure indicator
- Action menu with guarded placeholders

Clicking a cluster opens a cluster detail panel.

### 3. Cluster Detail Panel

Purpose: inspect one cluster.

Required tabs:

- Overview
- Nodes
- VMs / CTs
- Storage
- Networks
- Backups
- Tasks
- Incidents
- Audit

Production write actions must be disabled or marked guarded in MVP.

### 4. Node Detail Panel

Purpose: inspect one node.

Required sections:

- Hostname / IP
- CPU / memory / disk usage
- VMs hosted
- Containers hosted
- Storage attached
- Alerts
- Maintenance state
- Recent tasks

### 5. VM / CT Inventory Screen

Purpose: browse all VMs and containers across clusters.

Required GUI elements:

- Table with:
  - ID
  - name
  - type: VM / CT
  - cluster
  - node
  - status
  - CPU
  - RAM
  - disk
  - backup status
  - customer/service link
  - criticality
- Search
- Filter by cluster, node, status, customer, criticality
- Click row to open VM/CT object panel

### 6. VM / CT Object Panel

Purpose: operator command panel for one VM/container.

Required tabs:

- Overview
- Resources
- Network
- Backups
- Snapshots
- Logs
- Customer Impact
- Lab Workspaces
- Actions
- Audit

Required buttons:

- Create Snapshot placeholder
- Clone to Support Lab placeholder
- Restore Backup to Lab placeholder
- Open Lab Workspace
- Generate Production Apply Plan placeholder

Guarded/disabled production actions:

- Stop production VM
- Restart production VM
- Delete VM
- Restore over production
- Modify network

### 7. Proxmox Support Lab Screen

Purpose: manage clone-only lab workspaces.

Required GUI elements:

- Lab workspace list
- Workspace status badges
- Source VM/CT
- Lab node
- Live preview status
- Changed files count
- Validation status
- AI repair session status
- Buttons:
  - Create Lab Workspace
  - Open Workspace
  - Archive Workspace placeholder

### 8. Live Sandbox Workspace Screen

Purpose: main repair cockpit.

Required layout:

```text
Top bar:
  workspace name, source VM/CT, lab clone, status, actions

Left panel:
  live sandbox preview

Center panel:
  file tree and code/config editor

Right panel:
  AI helper and repair notes

Bottom panel:
  logs, terminal placeholder, diff, validation
```

Required GUI elements:

- Live preview iframe/placeholder
- Preview URL field
- Refresh button
- Restart sandbox placeholder
- File tree placeholder
- Editor placeholder
- Open file tabs
- Logs panel
- Diff panel
- AI helper chat/commands panel
- Change-set summary panel

MVP can use static/demo file contents, but the GUI must show the intended workflow.

### 9. AI Workspace Manager Panel

Purpose: AI prepares and manages the workspace.

Required GUI elements:

- Problem statement input
- Quick commands:
  - Open relevant files
  - Show logs
  - Search this error
  - Explain selected file
  - Suggest patch
  - Show diff
  - Generate validation checklist
  - Generate production apply plan
- Repair session notes
- AI recommendations area
- Approval buttons for lab edits placeholder

AI should be represented as a workspace helper, not only as a generic chat window.

### 10. Production Apply Plan Screen / Panel

Purpose: review validated lab changes before any production action.

Required GUI sections:

- Changed files
- Diff summary
- Commands needed
- Services to restart
- Expected downtime
- Customer impact
- Backup requirement
- Rollback plan
- Validation checklist
- Approval status

MVP can be placeholder only.

## Functional GUI acceptance criteria for first milestone

The first developer milestone is acceptable when an operator can:

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

## Visual style

The GUI should match Olympus Command style:

- command-center look
- dark operational interface where appropriate
- dense but readable cards
- clear status badges
- strong object panels
- tabbed detail views
- visible guardrail warnings for production actions
- clear split between production and lab

## Empty states

Every screen should have useful empty states:

- No clusters configured
- No VMs found
- No lab workspaces yet
- No files opened
- No AI repair session started
- No change set generated

Empty states should include the next action.

## Guardrail visibility

The GUI should visibly show:

```text
Production is read-only in this phase.
Lab workflows are clone-only.
AI edits lab files only.
Production changes require reviewed apply plans.
```

This should appear in the overview screen, VM action panel, and live sandbox workspace.

## Developer note

If backend API work is not ready, build the GUI with mock/configured data first. The functional GUI is the first operator milestone.
