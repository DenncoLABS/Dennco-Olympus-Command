# Contributing to Dennco Olympus Command

## Staff-only contribution policy

Dennco Olympus Command is a privately maintained Dennco Information Systems project. Contributions are limited to authorized staff, approved contractors, and specifically invited collaborators.

This repository does not accept unsolicited public contributions, public feature requests, public pull requests, public forks for redistribution, or outside governance proposals unless Dennco Information Systems has approved that participation in writing.

## Authorized contributors

Authorized contributors must:

- Work from approved branches or approved pull requests.
- Keep all project details confidential unless cleared for release.
- Avoid committing credentials, API keys, customer information, private logs, production environment files, or deployment secrets.
- Preserve Dennco ownership notices, security notices, branding controls, and runtime configuration controls.
- Use only approved third-party code, data sources, assets, and dependencies.
- Avoid reintroducing upstream demo branding, starter-project icons, confusing product names, or non-Dennco public identity into the deployed interface.

## Branch and change process

Internal branches should use clear operational naming:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
ops/<short-description>
security/<short-description>
```

Commits should describe the operational intent clearly:

```text
Add Olympus Desk package status panel
Fix DOT camera marker rendering
Update CAD persistent call folders
```

## Pull request expectations

Internal pull requests should include:

- What changed.
- Why it changed.
- Any files, services, or package paths affected.
- Deployment or restart steps.
- Security or configuration impact.
- Screenshots for user-interface changes when practical.

## Testing expectations

Before packaging or deployment, authorized contributors should run the relevant build or test path:

```bash
npm run build
```

For server-only changes, verify the service starts cleanly:

```bash
systemctl restart dennco-olympus-command
systemctl status dennco-olympus-command --no-pager
```

For package changes, verify install behavior on a test host before production use when possible.

## Documentation expectations

Documentation updates should use Dennco Olympus Command terminology and should not reference upstream starter brands, upstream demo names, or unrelated product identity. Public documentation should avoid revealing sensitive infrastructure, credentials, private customer information, or operationally sensitive deployment details.

## Security and confidentiality

All contributors are bound by the repository Security Policy and any applicable employment, contractor, NDA, or staff confidentiality agreement. Do not disclose repository contents, non-public plans, vulnerabilities, data-source keys, customer information, logs, deployment information, or operational details without written authorization from Dennco Information Systems.

## External requests

External parties who want access, partnership, licensing, integration, or review rights must contact Dennco Information Systems through approved business channels. GitHub issues and pull requests are not an approval path.

## All rights reserved

No public license, contribution right, redistribution right, trademark right, service right, deployment right, or derivative-work right is granted by this file. All rights are reserved by Dennco Information Systems unless separately granted in writing.
