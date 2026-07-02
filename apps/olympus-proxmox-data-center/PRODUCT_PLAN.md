# Olympus Proxmox Data Center Product Plan

## 1. Product thesis

Olympus Proxmox Data Center is the Proxmox operations app for Dennco Olympus Command.

It should allow Dennco to manage authorized Proxmox clusters from inside Olympus while keeping production safe through read-only visibility first, clone-only support workflows, live sandbox workspaces, AI-assisted lab editing, approval gates, and production apply planning.

The goal is to stop relying on separate Proxmox management pages for routine work. Olympus should become the command interface, while Proxmox clusters continue operating as external infrastructure services.

## 2. Core doctrine

```text
Production clusters remain external services.
Olympus manages them through authorized APIs.
The support lab is clone-only by default.
AI edits lab workspaces only.
Production changes require reviewed apply plans.
```

## 3. Major components

### Proxmox Data Center Manager

The production-facing command view.

Responsibilities:

- Cluster registry
- Node registry
- VM and container inventory
- Storage overview
- Network overview
- Backup and snapshot overview
- Task history
- Health and capacity cards
- Customer/service impact mapping
- Incident and maintenance awareness
- Safe production action planning

### Proxmox Support Lab

The repair bench.

Responsibilities:

- Clone production VM/CT into lab
- Restore backup into lab
- Create config/file workspace
- Run isolated or preview lab service
- Allow safe edits
- Validate changes
- Produce change set
- Produce production apply plan

The support lab should not be treated as the production manager.

### Live Sandbox Workspace

The main repair interface.

Responsibilities:

- Show running lab copy of the service
- Show editable files/config/code
- Show logs and terminal output
- Show health status
- Show before/after diffs
- Let the operator test changes live

Suggested layout:

```text
Top: workspace status, source VM, lab clone, actions
Left: live sandbox preview
Center: code/file editor
Right: AI helper and repair notes
Bottom: logs, terminal, diff, validation
```

### AI Workspace Manager

The AI assistant that manages the workspace around the operator.

Responsibilities:

- Open workspace on request
- Create or locate lab clone
- Open live preview
- Open file tree
- Search files
- Open requested files
- Open likely files based on problem statement
- Open logs
- Explain files
- Suggest patches
- Apply approved lab edits
- Restart sandbox service after approval
- Run validation commands after approval
- Summarize changes
- Generate production apply plan
- Generate rollback plan

## 4. Object model

### Cluster object

```text
Cluster ID
Cluster name
Environment: production / staging / lab / archive
Location
Purpose
API endpoint reference
Authentication profile reference
Nodes
Storage pools
Networks
VM count
Container count
Customer dependencies
Service dependencies
Backup policy
Health status
Maintenance status
Risk level
Last sync
```

### Node object

```text
Node ID
Cluster ID
Hostname
IP address
Location
Role
CPU usage
Memory usage
Disk usage
Network usage
Uptime
Version
Storage attached
VMs hosted
Containers hosted
Alerts
Maintenance state
```

### VM / CT object

```text
VM ID
Name
Type: VM / CT
Cluster
Node
Customer
Service
Operating system
CPU
RAM
Disk
Network interfaces
IP addresses
Status
Uptime
Backup status
Snapshot status
Template origin
Tags
Owner
Criticality
Linked domain
Linked app
Linked repo
Linked ticket
Linked incident
```

### Lab Workspace object

```text
Workspace ID
Source production object
Source cluster
Source VM/CT
Clone method
Lab node
Lab URL
Service ports
Filesystem path
Repo path
Status
Owner
Created time
Last sync time
Open files
Changed files
AI session ID
Validation status
Change-set ID
Production apply plan ID
```

### AI Repair Session object

```text
Session ID
Workspace ID
Problem statement
Source production object
Lab clone object
Live preview URL
Files opened
Logs opened
Searches performed
AI diagnosis
Edits proposed
Edits approved
Edits applied
Tests run
Validation status
Change set
Production apply plan
Rollback plan
Operator notes
```

### Change Set object

```text
Change Set ID
Workspace ID
Changed files
Diff
Reason
AI explanation
Operator notes
Test results
Risk level
Rollback plan
Production apply steps
Approval state
```

## 5. Workflows

### Read-only production inventory

```text
Connect approved cluster profile
  -> sync clusters
    -> sync nodes
      -> sync VM/CT inventory
        -> show health, resources, backups, customer impact
```

### Clone-to-lab workflow

```text
Select production VM/CT
  -> create snapshot or select backup
    -> clone or restore into lab
      -> create lab workspace record
        -> start sandbox service if configured
          -> open live sandbox workspace
```

### AI repair workflow

```text
Operator says: we need to fix [problem]
  -> AI identifies target workspace/service
    -> AI opens live preview
      -> AI opens file tree
        -> AI opens likely files and logs
          -> AI creates repair session
            -> operator directs revisions
              -> AI applies approved lab edits
                -> sandbox restarts/tests
                  -> AI summarizes changes
                    -> change set generated
```

### Production apply planning

```text
Validated lab change
  -> generate production apply plan
    -> include changed files, commands, downtime, customer impact, rollback
      -> human review
        -> approval required
          -> future guarded deployment workflow
```

## 6. Workspace commands

Natural language commands the AI Workspace Manager should eventually support:

```text
Open the lab copy for this VM.
Create a lab workspace for this service.
Open the file that controls this page.
Show me the logs.
Search for this error.
Open the config file.
Explain this service.
Find why this page is broken.
Suggest a patch.
Apply that patch to the lab copy.
Restart the sandbox.
Show me the diff.
Run validation.
Generate the production apply plan.
Generate rollback steps.
```

## 7. Safety rules

### Allowed early

- Read production inventory
- Display cluster/node/VM status
- Create lab workspace records
- Prepare clone-to-lab workflow
- Edit lab files
- Show live sandbox preview
- Generate diffs
- Generate apply plans

### Guarded later

- Production restart
- Production file apply
- Production VM stop/start
- Production restore
- Production network changes
- Production storage changes
- Production delete operations

### Always restricted by approval

- Delete VM/CT
- Restore over production
- Change production network
- Change production firewall/security rules
- Modify cluster settings
- Stop critical services
- Apply AI-generated changes to production

## 8. MVP sequence

### MVP 1: app shell and safe inventory

- Add Proxmox Data Center app route/shell.
- Add dashboard cards for clusters, nodes, VMs, containers, storage, backups, and alerts.
- Add mock/configured cluster registry.
- Add VM/CT table.
- Add production object panels.
- Add customer/service linking placeholders.
- Add support lab workspace list.
- Add live sandbox UI placeholder.
- Add AI helper panel placeholder.

### MVP 2: authorized sync and lab workspace

- Add server-side Proxmox connector.
- Keep API credentials server-side only.
- Sync cluster/node/VM inventory.
- Add clone-to-lab workflow placeholder or first implementation.
- Add lab workspace object storage.
- Add file tree browsing for lab workspace.
- Add logs panel.
- Add editable text file viewer/editor for lab files.

### MVP 3: AI-assisted repair

- AI opens files on request.
- AI searches selected workspace.
- AI reads logs and selected files.
- AI suggests patches.
- AI applies approved lab edits.
- AI shows before/after diff.
- AI creates repair session notes.
- AI generates validation checklist.

### MVP 4: apply planning and approvals

- Generate change sets.
- Generate production apply plan.
- Generate rollback plan.
- Add approval states.
- Add audit trail.
- Add customer impact warning.
- Add maintenance window notes.

## 9. Developer guardrails

Development should begin with read-only visibility and the lab workspace shell. Do not begin with destructive production actions.

The first build should prove the operator experience:

```text
Open Proxmox app
  -> see clusters/nodes/VMs
    -> open VM panel
      -> create/open lab workspace
        -> see live sandbox placeholder
          -> see file editor placeholder
            -> see AI helper placeholder
```

Production write workflows can come later after permission, audit, approval, and rollback systems are designed.

## 10. Relationship to Olympus master platform

This app pack supports the wider Olympus strategy by making IT/Dennco Operations the first deep operational domain.

Reusable pieces should later become extensions:

- Proxmox connector
- Support lab workflow
- Live sandbox workspace
- AI workspace manager
- Customer impact map
- Production apply planner

Core should only absorb features that clearly benefit multiple app packs.
