# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

This is a Bun-based TypeScript project. Bun is a fast all-in-one JavaScript runtime that serves as an alternative to Node.js.

## Key Commands

### Development
- Install dependencies: `bun install`
- Run the project: `bun run index.ts`

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
2. Run `bun run index.ts` to test changes
3. Run `bun test` to execute tests (if any)
4. Run `bun run tsc --noEmit` to check for type errors

## Bun-Specific Features

Bun provides built-in functionality for:
- Running TypeScript files directly without compilation
- Fast package installation
- Built-in test runner
- Bundle creation with `bun build`
- Web APIs like fetch, WebSocket, etc.