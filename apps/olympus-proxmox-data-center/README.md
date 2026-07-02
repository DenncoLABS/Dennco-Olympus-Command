# Olympus Proxmox Data Center

Olympus Proxmox Data Center is a draft app pack built from the Dennco Olympus Command master platform.

## Purpose

This app pack is the production command view for Dennco-managed Proxmox clusters and the support-lab workflow used to repair cloned systems safely.

The goal is to operate authorized Proxmox environments from Olympus without routinely opening each Proxmox management page.

## Core split

```text
Proxmox Data Center Manager = production cluster command view.
Proxmox Support Lab = clone-only repair bench.
Live Sandbox Workspace = running lab preview plus editable files.
AI Workspace Manager = assistant that prepares the workspace, opens files, reads logs, and helps revise lab copies.
```

## Production posture

Production clusters remain external infrastructure services. Olympus connects to them through approved APIs, service accounts, roles, and audit rules.

Routine production visibility should include clusters, nodes, VMs, containers, storage, networks, backups, snapshots, task history, health, incidents, and customer/service impact.

## Lab posture

The lab is clone-only by default.

Importing to the lab means creating a safe editable copy, restored backup, config export, or file workspace. It does not mean moving production into the lab.

AI may inspect, explain, modify, and validate files inside the lab workspace. AI should not directly edit production files.

## Initial modules

- Cluster registry
- Node registry
- VM and container registry
- Backup and snapshot view
- Clone-to-lab workflow
- Live sandbox workspace
- Code/file editor surface
- Logs and terminal surface
- AI workspace manager
- Change-set manager
- Production apply planner
- Customer impact map
- Audit and approval model

## Status

Draft planning scaffold. Development may begin from this app pack, but production write actions must remain guarded, audited, and approval-based.
