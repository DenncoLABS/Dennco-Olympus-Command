# Admin, Security, Branding, and Directory Integration Roadmap

This document tracks the administrative layer for Dennco Olympus Command.

## Required features

1. Protected login before dashboard access.
2. Local administrator fallback account.
3. Active Directory / LDAP login support for NethServer 8.
4. Admin settings page.
5. API credential manager.
6. Feature toggles for modules and feeds.
7. Branding controls for product name, logos, favicon, and footer text.
8. CSS injector for admin-managed themes.

## Authentication model

Olympus Command should support two authentication providers:

- Local administrator login for emergency/fallback access.
- LDAP / Active Directory authentication for NethServer 8 directory environments.

LDAP settings needed for NethServer 8:

- LDAP URL, such as `ldap://server.example.local:389` or `ldaps://server.example.local:636`.
- Bind DN or service account DN.
- Bind credential stored server-side only.
- User search base.
- User search filter.
- Optional admin group DN.
- TLS certificate validation toggle for internal CA environments.

## Admin settings categories

### Security

- Auth provider: local or LDAP.
- Session timeout.
- Password rotation for local admin.
- Admin group requirement for LDAP.

### API keys

- AISStream key.
- OpenSky username/password.
- Map tile provider URL.
- Future provider keys.

### Feature toggles

- Flights module.
- Maritime module.
- Monitor module.
- Cyber module.
- Public access mode.
- CSS injector enabled/disabled.

### Branding

- Product name.
- Short name.
- Logo URL.
- Favicon URL.
- Footer text.

### Theme/CSS

- Custom CSS injector.
- Admin-managed theme overrides.
- Optional preset selection.

## Implementation order

1. Add server-side settings storage.
2. Add session login/logout endpoints.
3. Protect existing API routes.
4. Add frontend login screen.
5. Add admin settings module.
6. Wire branding and CSS injector into the shell layout.
7. Add LDAP provider support for NethServer 8.
8. Package default admin configuration into the Debian install.
