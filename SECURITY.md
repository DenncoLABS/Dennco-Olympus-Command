# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [INSERT SECURITY EMAIL].

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported releases
4. Release patches as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.

## Security Best Practices for Users

### API Keys

- **NEVER** commit API keys to the repository
- Always use `.env` files (included in `.gitignore`)
- Rotate API keys regularly
- Use environment-specific keys (dev/staging/prod)

### Environment Variables

```bash
# Good - Use .env files
cp server/.env.example server/.env
# Then edit server/.env with your actual keys

# Bad - Never do this
export AISSTREAM_API_KEY=your_real_key_here
git commit -am "Add API key"  # ❌ NEVER!
```

### Deployment

- Use HTTPS in production
- Enable CORS restrictions
- Implement rate limiting
- Use secure headers (helmet.js)
- Keep dependencies updated
- Run security audits regularly:
  ```bash
  npm audit
  npm audit fix
  ```

### Data Privacy

This application processes publicly available data only:

- ADS-B aircraft positions (public broadcasts)
- AIS maritime data (public broadcasts)
- RSS news feeds (public sources)

No personal or classified data should be processed.

## Known Security Considerations

### Client-Side API Keys

The Vite frontend may expose some API configuration. Never put sensitive keys in `VITE_*` environment variables as they are bundled into the client JavaScript.

### Rate Limiting

Implement rate limiting on the backend to prevent abuse:

- ADSB.lol API calls (currently 3-second cache)
- AISStream WebSocket reconnections (currently 5-second backoff)

### WebSocket Security

The AISStream WebSocket connection:

- Authenticates via API key (kept server-side only)
- Automatically reconnects on disconnect
- Should be monitored for unusual traffic patterns

## Dependencies

We use automated tools to monitor dependencies:

- `npm audit` - Regular security audits
- Dependabot (if enabled) - Automated updates
- Manual review of dependency changes

## Responsible Disclosure

We kindly ask that you:

- Allow us reasonable time to address the vulnerability
- Avoid public disclosure until a fix is available
- Make a good faith effort to avoid privacy violations and disruption

## Recognition

We appreciate the security research community and will acknowledge your contribution (unless you prefer to remain anonymous).
