# Contributing to Radar

Thank you for your interest in contributing to Radar! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Radar.git
   cd Radar
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/Radar.git
   ```

## Development Setup

### Prerequisites

- Node.js v18 or later
- npm v9 or later

### Installation

```bash
# Install all dependencies
npm run install:all

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Configure your API keys in server/.env
```

### Running Locally

```bash
# Start development servers
npm run dev
```

This starts:

- Frontend at http://localhost:5173
- Backend at http://localhost:3001

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-satellite-tracking` - New features
- `fix/maritime-connection-timeout` - Bug fixes
- `docs/update-api-reference` - Documentation
- `refactor/optimize-flight-cache` - Code refactoring
- `test/add-maritime-unit-tests` - Test additions

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Build process or auxiliary tool changes

**Examples:**

```
feat(flights): add aircraft altitude filtering

Implement min/max altitude filters in the flights panel
to allow users to filter visible aircraft by altitude range.

Closes #123
```

```
fix(maritime): prevent vessel state memory leak

Properly clean up vessel history when vessels go stale
to prevent unbounded memory growth.

Fixes #456
```

## Submitting Changes

### Pull Request Process

1. **Update your fork** with upstream changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** locally:

   ```bash
   cd client && npm run test
   cd ../server && npm run test
   ```

3. **Lint your code**:

   ```bash
   cd client && npm run lint
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what and why
   - Link to related issues
   - Screenshots/GIFs for UI changes
   - Test plan or results

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
- [ ] Responsive design (for UI changes)
- [ ] API keys/secrets not committed

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing ESLint configuration
- Use functional components with hooks (React)
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public APIs

### React Components

```typescript
// Good
interface FlightCardProps {
  flight: AircraftState;
  onSelect: (icao24: string) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  // Component logic
}
```

### File Organization

```
module-name/
├── ModulePage.tsx           # Main page component
├── components/              # UI components
│   ├── ModuleSidebar.tsx
│   └── ModuleMap.tsx
├── hooks/                   # Custom React hooks
│   └── useModuleData.ts
├── lib/                     # Business logic
│   ├── module.types.ts
│   └── module.utils.ts
└── state/                   # State management
    └── module.store.ts
```

## Testing

### Frontend Tests (Vitest)

```bash
cd client
npm run test
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateDistance', () => {
  it('should calculate distance between two points', () => {
    const result = calculateDistance(0, 0, 0, 1);
    expect(result).toBeCloseTo(111.32, 1);
  });
});
```

### Coverage Goals

- Aim for >80% code coverage
- Test all business logic
- Test edge cases and error conditions
- Mock external APIs

## Documentation

### Code Documentation

- Add JSDoc comments for functions/classes
- Explain the "why", not just the "what"
- Document complex algorithms
- Include usage examples

### README Updates

Update the README.md if you:

- Add new features
- Change installation steps
- Add new dependencies
- Modify API endpoints

## Questions?

- Open a [GitHub Discussion](https://github.com/Syntax-Error-1337/Radar/discussions)
- Join our community chat (if available)
- Email the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
