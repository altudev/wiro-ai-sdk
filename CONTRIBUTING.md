# Contributing to Wiro AI SDK

Thank you for your interest in contributing to the Wiro AI SDK! This document outlines the guidelines for contributing, especially when adding new examples.

## Getting Started

### Prerequisites
- **Node.js/Bun:** v1.2.22 or higher
- **TypeScript:** 5+
- **Git:** For version control

### Setup
```bash
# Clone the repository
git clone https://github.com/altudev/wiro-ai-sdk.git
cd wiro-ai-sdk

# Install dependencies
bun install

# Run tests to verify setup
bun test
```

## Development Workflow

### Building & Type Checking
```bash
# Full build (bundle + type declarations)
bun run build

# Type checking only (recommended during development)
bun run typecheck

# Run tests
bun test
```

### Code Quality
- **TypeScript:** All code must pass strict mode type checking (`bun run typecheck`)
- **Tests:** All examples must include comprehensive test files
- **Formatting:** Follow the existing code style
- **Comments:** Include clear inline comments explaining non-obvious logic

## Adding New Examples

### Step 1: Create the Example File
Create a new `.ts` file in the `examples/` directory following the established pattern:

```typescript
/**
 * Example Title
 *
 * Brief description of what this example demonstrates.
 *
 * Prerequisites:
 * 1. Copy examples/.env.example to .env (or create .env in project root)
 * 2. Add your Wiro API credentials to .env
 * 3. Get your API key and secret from https://dashboard.wiro.ai
 *
 * To run this example:
 *   # Using Bun (recommended):
 *   bun run examples/your-example.ts
 *
 *   # Using Node.js with npm/pnpm/yarn:
 *   npm install dotenv
 *   node --loader tsx examples/your-example.ts
 */

import { WiroClient } from '../src/index';
// ... rest of implementation
```

**Key Requirements:**
- Use Bun runtime detection for environment variables: `typeof Bun !== 'undefined' ? Bun.env : process.env`
- Include comprehensive error handling
- Validate inputs (e.g., URLs)
- Use the shared helpers from `./shared/helpers.ts`
- Include step-by-step console output for clarity

### Step 2: Create Comprehensive Tests
Create a corresponding `.test.ts` file following this structure:

```typescript
/**
 * Tests for your-example
 *
 * NOTE: These tests cover utility functions and parameter validation.
 * Full end-to-end integration tests (actual API calls) are not included as they require:
 * - Valid Wiro API credentials (WIRO_API_KEY, WIRO_API_SECRET)
 * - Active API access with sufficient credits
 * - Network connectivity to the Wiro API
 * These factors make end-to-end tests slower and not suitable for continuous integration.
 *
 * For full integration testing, users should run the example with valid credentials:
 * `bun run examples/your-example.ts`
 */

import { describe, it, expect } from 'bun:test';
import { WiroClient } from '../src/index';
import type { /* your types */ } from '../src/types/index';

describe('Your Example - Utility Functions', () => {
  // Test utility functions
  describe('Helper functions', () => {
    // Add your tests here
  });

  // Test parameter validation
  describe('Model Parameters', () => {
    // Add parameter validation tests
  });

  // Test WiroClient initialization
  describe('WiroClient Initialization', () => {
    // Test client creation and error cases
  });

  // Test error handling
  describe('Error Handling', () => {
    // Test error scenarios and edge cases
  });
});
```

**Test Coverage Checklist:**
- ✅ Parameter validation for all model inputs
- ✅ WiroClient initialization (valid and invalid credentials)
- ✅ URL validation (if applicable)
- ✅ Error handling scenarios
- ✅ Task status flow (if using polling)
- ✅ API response structure validation

**Avoid:**
- ❌ Making actual API calls (these require valid credentials and are slow)
- ❌ Mocking the WiroClient in a way that defeats validation testing
- ❌ Testing internal SDK implementation details

### Step 3: Update README
Add your example to `examples/README.md` in the following format:

```markdown
### Your Example Name (`your-example.ts`)

Brief description of what this example demonstrates.

**What it demonstrates:**
- Feature 1
- Feature 2
- Feature 3

**To run:**
\`\`\`bash
bun run examples/your-example.ts
\`\`\`

**Key features shown:**
- **Feature A**: Description
- **Feature B**: Description

**Expected output:**
\`\`\`
[Example console output]
\`\`\`
```

### Step 4: Verify Everything Works

```bash
# Type check your code
bun run typecheck

# Run your specific tests
bun test examples/your-example.test.ts

# Run all tests
bun test

# Try running the example (if you have credentials)
bun run examples/your-example.ts
```

## Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feat/add-new-example
   ```

2. **Make your changes** following the guidelines above

3. **Verify everything passes:**
   ```bash
   bun run typecheck
   bun test
   ```

4. **Commit with descriptive message:**
   ```bash
   git commit -m "feat: add new example demonstrating XYZ model"
   ```

5. **Push and create a PR:**
   ```bash
   git push origin feat/add-new-example
   ```

6. **Include in PR description:**
   - What the example demonstrates
   - Link to API documentation (if applicable)
   - Test results
   - Any special instructions

## Coding Standards

### TypeScript
- Use strict mode (no implicit `any`)
- Define explicit types for all parameters and returns
- Use interfaces for complex objects
- Avoid `as` type assertions when possible

### Comments
- Document non-obvious logic
- Explain why, not what (code shows what)
- Link to documentation or issues when relevant

### Error Handling
- Always validate inputs
- Provide helpful error messages
- Include context about what went wrong

### Testing
- Test the happy path
- Test error conditions
- Test edge cases
- Use descriptive test names

## File Naming Conventions

- Examples: `kebab-case.ts` (e.g., `professional-headshot.ts`, `iconic-locations.ts`)
- Tests: `kebab-case.test.ts` (e.g., `professional-headshot.test.ts`)
- Utility files: `camelCase.ts` (e.g., `helpers.ts`)

## Resources

- [SDK Documentation](./README.md)
- [Examples Guide](./examples/README.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Wiro AI API Documentation](https://docs.wiro.ai)

## Questions?

If you have questions about contributing:
1. Check existing examples in the `examples/` directory
2. Review the [CLAUDE.md](./CLAUDE.md) for architecture details
3. Open an issue on GitHub for discussion

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (see LICENSE.md).
