# Olympus Proxmox Data Center Notes

## Planning status

Development-ready planning scaffold. This app pack should be treated as one of the first deep IT/Dennco Operations builds.

## Foundational direction

Olympus should become the single command interface for Dennco-managed Proxmox infrastructure.

The existing Proxmox support lab is a repair and test bench. It is not the production manager and should not replace the production cluster registry.

## Locked corrections

- Lab workflow is clone-only by default.
- Production VMs and clusters are not migrated into the lab for ordinary support.
- A lab import means a safe replica, restored backup, config export, or editable file workspace.
- AI works inside the lab copy and local workspace.
- Production changes require a separate reviewed apply plan.

## Research questions for development

1. What Proxmox API endpoints are needed for the first read-only cluster inventory?
2. How should Olympus store cluster connection profiles without exposing secrets to the browser?
3. What is the safest first clone-to-lab workflow?
4. How should a lab filesystem be exposed to the editor?
5. How should the live sandbox preview route traffic to lab services?
6. What file operations can AI perform in MVP 1?
7. How should before/after diffs and change sets be stored?
8. What approval is required before production apply plans can run?
9. How should VMs be linked to customers, services, domains, and revenue impact?
10. What audit events must be written for every operator action?

## MVP recommendation

MVP 1 should prioritize visibility and safe lab setup:

- Add app route/shell for Proxmox Data Center.
- Add cluster registry UI.
- Add mock or configured cluster objects.
- Add node and VM/CT inventory views.
- Add read-only health/status cards.
- Add support-lab workspace list.
- Add clone-to-lab workflow placeholder.
- Add live sandbox layout placeholder.
- Add AI workspace helper placeholder.

MVP 2 can add actual API-backed sync and lab file browsing.

MVP 3 can add patch planning, approvals, and guarded production apply workflows.

## Developer reminder

Do not make production destructive actions first. Build read-only visibility, clone-only lab workflow, workspace management, and AI repair support before production apply actions.
