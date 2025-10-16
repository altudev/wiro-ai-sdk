# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

This is a Bun-based TypeScript project for creating an npm package for Wiro AI. Bun is a fast all-in-one JavaScript runtime that serves as an alternative to Node.js.

## Key Commands

### Development
- Install dependencies: `bun install`
- Run the project: `bun run src/index.ts`

### Testing
- Run tests: `bun test`
- Run tests in watch mode: `bun test --watch`
- Run specific test file: `bun test <file-path>`

### Type Checking
- Check types: `bun run tsc --noEmit`

### Building
- This project uses Bun's built-in bundler: `bun build`

## Code Architecture

### Project Structure
```
src/
  index.ts     # Entry point
docs/
  wiro-ai-research/
    wiro-ai-perplexity-research.md  # Comprehensive guide for Wiro AI SDK implementation
```

### Key Configuration Files
- `package.json` - Project metadata and dependencies
- `tsconfig.json` - TypeScript configuration with strict settings
- `bun.lock` - Dependency lock file

### Technology Stack
- Runtime: Bun
- Language: TypeScript
- Type Checking: Strict mode enabled
- Module System: ES Modules

## Development Workflow

1. Make changes to files in the `src/` directory
2. Run `bun run src/index.ts` to test changes
3. Run `bun test` to execute tests (if any)
4. Run `bun run tsc --noEmit` to check for type errors

## Bun-Specific Features

Bun provides built-in functionality for:
- Running TypeScript files directly without compilation
- Fast package installation
- Built-in test runner
- Bundle creation with `bun build`
- Web APIs like fetch, WebSocket, etc.

## Implementation Plan

Based on the documentation in `docs/wiro-ai-research/wiro-ai-perplexity-research.md`, this project will implement:
1. A TypeScript SDK for the Wiro AI API
2. HMAC-SHA256 authentication
3. Core API endpoints for running models and managing tasks
4. WebSocket support for real-time updates
5. Proper type definitions for all API interactions

The implementation will follow the structure outlined in the research document with separate modules for:
- Client implementation
- Authentication utilities
- WebSocket handling
- Type definitions
- Utility functions