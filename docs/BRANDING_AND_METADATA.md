# Branding and Metadata Policy

Olympus Command should present as a Dennco/Olympus platform only. Do not reintroduce upstream demo branding, starter project assets, or third-party product identity into the visible UI.

## Current branding behavior

Branding is controlled by runtime settings and the Admin console.

Runtime branding fields include:

```text
branding.productName
branding.shortName
branding.logoUrl
branding.logoDataUrl
branding.faviconUrl
branding.faviconDataUrl
branding.footerText
```

## Favicon behavior

The application no longer uses the Vite starter favicon. The hard-coded starter icon was removed from `client/index.html`, and the `client/public/vite.svg` asset was removed.

The browser favicon is resolved in this order:

```text
branding.faviconDataUrl
branding.faviconUrl
empty data favicon
```

If no favicon is configured, Olympus uses an empty data favicon so no upstream or starter icon appears.

## Metadata

The app metadata should identify the system as Dennco Olympus Command and the operator as Dennco Information Systems.

Browser metadata, GUI labels, and HTTP headers should remain consistent with Dennco Olympus Command. Keep wording formal, professional, and Dennco-controlled.

## UI naming rules

Use:

- Dennco Olympus Command
- Olympus Command
- Olympus Core
- Olympus Desk
- Olympus Dock
- Dennco Information Systems

Avoid visible use of:

- Vite starter labels/icons
- OSIRIS branding
- Upstream demo branding
- Third-party project names as Olympus UI labels unless clearly used as a source attribution or integration note

## Documentation naming rules

Repo documentation may mention third-party repositories or public sources for attribution or implementation history, but product-facing text should remain Dennco/Olympus controlled.

## Admin branding controls

Admin should remain the long-term control point for:

- Product name
- Short name
- Logo
- Favicon
- Footer text
- CSS injector
- Feature toggles
- Provider configuration
