# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

**Wiro AI SDK** is a production-ready TypeScript SDK (npm package) for the Wiro AI API. The SDK provides a type-safe, zero-dependency interface for running AI models, managing tasks, and handling image processing operations. Built with modern standards and strict TypeScript support.

- **Runtime:** Bun v1.2.22+ (JavaScript runtime)
- **Language:** TypeScript 5+ with strict type checking
- **Module System:** ESM (ES Modules)
- **Package Manager:** Bun (with bun.lock for dependencies)
- **Authentication:** HMAC-SHA256 based on API key/secret
- **Package Name:** `wiro-ai-sdk` (published to npm)

## Key Commands

### Build & Type Checking
- Full build: `bun run build` (bundle + type declarations)
- Build bundle only: `bun run build:bundle` (creates dist/index.js)
- Build types only: `bun run build:types` (creates dist/index.d.ts)
- Type check: `bun run typecheck` (no output files)

### Development
- Install dependencies: `bun install`
- Run main file: `bun run src/index.ts`
- Run examples: `bun run examples/professional-headshot.ts`

### Testing
- Run tests: `bun test`
- Run tests in watch mode: `bun test --watch`
- Run specific test file: `bun test <file-path>`

### Publishing
- Build and publish: `bun publish` (runs prepublishOnly hook automatically)

## Code Architecture

### Project Structure
```
src/
  index.ts           # Public API exports
  client.ts          # Main WiroClient class (310 lines)
  auth.ts            # HMAC-SHA256 authentication (~50 lines)
  types/
    index.ts         # TypeScript type definitions (193 lines)
examples/
  professional-headshot.ts  # Complete usage example with polling
  README.md          # Examples documentation
  .env.example       # Environment template
docs/
  wiro-ai-research/
    wiro-ai-perplexity-research.md  # Implementation guide (907 lines)
  wiro-ai/
    professional-headshot/
      llms.txt       # API endpoint specifications (428 lines)
dist/               # Build output (generated)
  index.js           # ESM bundle
  index.d.ts         # TypeScript declarations
  *.map              # Source maps
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
2. Run `bun run typecheck` to check for type errors
3. Run `bun test` to execute tests
4. Run `bun run build` to create the bundle and type declarations
5. Test with examples: `bun run examples/professional-headshot.ts`
6. Commit changes and push to feature branch
7. Create pull request with `gh pr create`
8. After merge, publish to npm with `bun publish`

## Bun-Specific Features

Bun provides built-in functionality for:
- Running TypeScript files directly without compilation
- Fast package installation
- Built-in test runner
- Bundle creation with `bun build`
- Web APIs like fetch, WebSocket, etc.

## Implementation Status

✅ **Completed Features:**
1. ✅ TypeScript SDK with strict type checking
2. ✅ HMAC-SHA256 authentication (src/auth.ts)
3. ✅ Core API endpoints:
   - `run()` - Execute AI models with optional file uploads
   - `getTaskDetail()` - Query task status and outputs
   - `killTask()` - Terminate running tasks
   - `cancelTask()` - Cancel queued tasks
4. ✅ Comprehensive type definitions (src/types/index.ts)
5. ✅ File upload handling (string paths, Blob, File objects)
6. ✅ Task lifecycle management and status tracking
7. ✅ Zero dependencies (uses built-in fetch, crypto, Blob APIs)
8. ✅ Build system with ESM bundle + TypeScript declarations
9. ✅ Multiple example implementations:
   - Professional headshot example with task polling
   - Avatar motion example
   - Iconic locations example
   - Cartoonify example
10. ✅ Comprehensive documentation (README, examples, CLAUDE.md)

🔄 **Future Enhancements:**
- WebSocket support for real-time task updates
- Additional model examples
- Browser compatibility testing
- Rate limiting utilities

## Architecture

The SDK uses a simple, layered architecture:

1. **Client Layer** (`src/client.ts`): Main `WiroClient` class handling API communication
2. **Auth Layer** (`src/auth.ts`): HMAC-SHA256 authentication utilities
3. **Type Layer** (`src/types/index.ts`): TypeScript interfaces for all API interactions
4. **Export Layer** (`src/index.ts`): Public API surface

### Core Client Methods

```typescript
// Execute AI model with optional file uploads
async run<T>(owner: string, model: string, params: Record<string, any>, files?: WiroFileParam[]): Promise<RunResponse>

// Retrieve task status by ID or token
async getTaskDetail<T>(taskInfo: TaskDetailRequest): Promise<TaskDetailResponse<T>>

// Terminate running task
async killTask(taskInfo: KillTaskRequest): Promise<KillTaskResponse>

// Cancel queued task
async cancelTask(taskid: string): Promise<CancelTaskResponse>
```

### Authentication

Every API request includes HMAC-SHA256 authentication:
- Formula: `HMAC-SHA256(apiSecret + nonce, apiKey)`
- Headers: `x-api-key`, `x-nonce`, `x-signature`
- See `src/auth.ts:generateAuthHeaders()` for implementation

### Task Lifecycle

Tasks progress through these statuses:
- **Active:** `task_queue` → `task_accept` → `task_assign` → `task_preprocess_start` → `task_preprocess_end` → `task_start` → `task_output` → `task_postprocess_start`
- **Terminal:** `task_postprocess_end` (success) or `task_cancel` (cancelled)