# Security, Non-Disclosure, and Reserved Rights Policy

## Private security policy

Dennco Olympus Command is a privately maintained Dennco Information Systems platform. Security reports, operational concerns, vulnerability information, infrastructure information, access-control details, deployment details, logs, credentials, API keys, customer information, and non-public technical information must not be disclosed publicly.

Do not open public GitHub issues for vulnerabilities, deployment behavior, production configuration, credentials, infrastructure paths, operational incidents, or suspected security issues.

## Non-disclosure requirement

Repository access is limited to authorized staff, approved contractors, and specifically invited collaborators. Access to this repository is conditioned on confidentiality. By accessing this repository, you agree that all non-public project materials are confidential and must not be copied, distributed, disclosed, published, mirrored, transferred, or used outside authorized Dennco Information Systems work without written authorization.

Confidential materials include, but are not limited to:

- Source code and private branches.
- Security reports and vulnerability details.
- System architecture and operational workflows.
- Package, deployment, service, and infrastructure details.
- Runtime settings, environment variables, API keys, and credentials.
- Customer, staff, contractor, or partner information.
- Logs, screenshots, diagnostics, and incident details.
- Product plans, private roadmaps, and internal strategy.

## Reporting security issues

Authorized staff should report security concerns through internal Dennco Information Systems channels. If a private external report path has been provided to a specific partner or contractor, that approved path may be used.

Do not include exploit details, credentials, private logs, API keys, customer details, or production configuration in public GitHub comments, public issues, public pull requests, public forks, or public discussions.

## Handling vulnerabilities

Authorized maintainers may:

1. Restrict or revoke repository access.
2. Close, lock, redact, or remove public disclosures.
3. Patch the affected code or configuration.
4. Rotate credentials or invalidate exposed keys.
5. Update package releases and deployment notes.
6. Notify affected internal stakeholders through approved channels.

## Deployment security expectations

Production and test deployments should follow these requirements:

- Use HTTPS and an approved reverse proxy for exposed deployments.
- Keep API keys server-side only.
- Never commit production `.env` files or credentials.
- Restrict administrative access.
- Review third-party data-source terms before integration.
- Avoid exposing operationally sensitive system behavior in public documentation.
- Keep package publishing and signing keys protected.
- Keep uploaded branding assets under Dennco/Olympus control.

## Data and source limitations

Olympus Command integrates public and configured data sources. Contributors must not add classified information, unlawfully obtained data, private personal data, unauthorized surveillance feeds, stolen credentials, or restricted customer information.

## No public disclosure license

No permission is granted to publicly disclose vulnerabilities, copy source code, redistribute packages, publish derivative works, reproduce private documentation, mirror this repository, use Dennco branding, or represent this project externally unless Dennco Information Systems grants that permission in writing.

## All rights reserved

Dennco Olympus Command, related source code, documentation, configuration, branding, packaging, service files, workflows, and operational materials are proprietary to Dennco Information Systems unless a separate written agreement states otherwise.

All rights are reserved. No license, copyright permission, trademark permission, patent license, redistribution right, sublicensing right, commercial-use right, deployment right, or derivative-work right is granted by this repository, by access to this repository, or by any contribution policy unless explicitly granted in writing by Dennco Information Systems.
