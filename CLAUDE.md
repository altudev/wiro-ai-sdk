# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Command Reference

### Build & Type Checking
```bash
bun run build              # Full build (bundle + type declarations)
bun run build:bundle      # Create ESM bundle to dist/index.js
bun run build:types       # Generate TypeScript declarations
bun run typecheck         # Type check without building
```

### Development
```bash
bun install               # Install dependencies
bun run src/index.ts      # Run the main source file
```

### Testing
```bash
bun test                  # Run all tests
bun test --watch         # Watch mode for tests
bun test src/client.test.ts  # Run specific test file
```

## Project Overview

**Wiro AI SDK** is a production-ready TypeScript SDK (npm package) for the Wiro AI API. The SDK provides a client for running AI models, querying task status, and managing task lifecycles.

- **Runtime:** Bun v1.2.22+ (JavaScript runtime)
- **Language:** TypeScript 5+ with strict type checking
- **Module System:** ESM (ES Modules)
- **Package Manager:** Bun (with bun.lock for dependencies)
- **Authentication:** HMAC-SHA256 based on API key/secret

## Architecture Overview

### High-Level Design

The SDK is structured around a **single client class** (`WiroClient`) that wraps the Wiro AI REST API:

1. **Client Layer** (`src/client.ts`): Main `WiroClient` class handling API communication
2. **Auth Layer** (`src/auth.ts`): HMAC-SHA256 authentication utilities
3. **Type Layer** (`src/types/index.ts`): TypeScript interfaces for all API interactions
4. **Export Layer** (`src/index.ts`): Public API surface

### Core Client Methods

The `WiroClient` class provides four main operations:

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

### Authentication Flow

1. Generate HMAC-SHA256 signature: `HMAC-SHA256(apiSecret + nonce, apiKey)`
2. Set three headers on every request:
   - `x-api-key`: The API key
   - `x-nonce`: Current Unix timestamp (seconds)
   - `x-signature`: Hex-encoded HMAC signature

See `src/auth.ts:generateAuthHeaders()` for implementation.

### File Handling

The SDK abstracts file uploads across multiple input types:

- **String paths:** Automatically read via `Bun.file()`
- **Blob/File objects:** Used directly
- **FormData encoding:** Automatically applied when files are present
- **Fallback:** JSON request body when no files

This is handled in `src/client.ts:run()` method around file parameter processing.

### Task Lifecycle

Tasks progress through these statuses (see `src/types/index.ts:TaskStatus`):

**Active:** `task_queue` → `task_accept` → `task_assign` → `task_preprocess_start` → `task_preprocess_end` → `task_start` → `task_output` → `task_postprocess_start`

**Terminal:** `task_postprocess_end` (success) or `task_cancel` (cancelled)

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/Run/{owner}/{model}` | POST | Execute AI models (returns taskid) |
| `/Task/Detail` | POST | Query task status and outputs |
| `/Task/Kill` | POST | Terminate running tasks |
| `/Task/Cancel` | POST | Cancel queued tasks |

**Base URL:** `https://api.wiro.ai/v1` (configurable via `WiroClientOptions.baseUrl`)

## Key Files & Responsibilities

| File | Size | Purpose |
|------|------|---------|
| `src/client.ts` | 310 lines | Main `WiroClient` implementation with all API methods |
| `src/auth.ts` | ~50 lines | `generateAuthHeaders()` for HMAC-SHA256 authentication |
| `src/types/index.ts` | 193 lines | All TypeScript interfaces and types (requests, responses, task statuses) |
| `src/index.ts` | <20 lines | Public exports for npm package |
| `package.json` | 55 lines | NPM metadata, build scripts, dependencies |
| `tsconfig.json` | 37 lines | TypeScript strict mode configuration |
| `docs/wiro-ai-research/wiro-ai-perplexity-research.md` | 907 lines | Comprehensive implementation guide and best practices |
| `docs/wiro-ai/professional-headshot/llms.txt` | 428 lines | Wiro AI API endpoint specs and curl examples |

## Build Output

Running `bun run build` creates:

- `dist/index.js` - ESM bundle with external source maps
- `dist/index.d.ts` - TypeScript declaration file
- `dist/index.d.ts.map` - Declaration source maps

These are published to npm. The `prepublishOnly` hook ensures building happens before publishing.

## Type System

The SDK exports comprehensive TypeScript types covering:

- **Configuration:** `WiroClientOptions`, `WiroFileParam`
- **Responses:** `RunResponse`, `TaskDetailResponse<T>`, `KillTaskResponse`, `CancelTaskResponse`
- **Task Data:** `Task`, `TaskStatus` (union of 9 statuses), `TaskOutput`
- **Requests:** `TaskDetailRequest`, `KillTaskRequest`, `CancelTaskRequest`

Generic types like `run<T>()` and `getTaskDetail<T>()` support typed responses for model outputs.

## Common Development Scenarios

### Adding a New API Method
1. Add request/response types to `src/types/index.ts`
2. Implement method in `src/client.ts` following existing patterns (generateAuthHeaders, fetch, error handling)
3. Export from `src/index.ts` if needed
4. Update type definitions and ensure `bun run typecheck` passes

### Working with Files
The `run()` method handles file abstraction. Pass files as `WiroFileParam[]`:
- `name`: form field name
- `file`: string path or Blob/File object

See `src/client.ts` for how files are converted to FormData.

### Debugging API Issues
1. Check authentication headers via `generateAuthHeaders()` in `src/auth.ts`
2. Verify nonce is current Unix timestamp
3. Look at API specs in `docs/wiro-ai/professional-headshot/llms.txt`
4. Check request/response types match the documented schema

## Zero Dependencies

The core SDK has **no external npm dependencies**. It uses:
- Bun/Node.js built-in `fetch` API for HTTP
- Node.js `crypto` module for HMAC-SHA256
- Web standard `Blob`, `FormData` APIs

This keeps the package lightweight for npm consumers.

## Publishing Workflow

```bash
# Update version in package.json
# Make commits as needed
bun run build              # Ensure build succeeds
bun publish                # Publishes to npm (runs prepublishOnly hook automatically)
```

The `prepublishOnly` script ensures `dist/` is rebuilt before publishing.

## Important Implementation Details

1. **Strict TypeScript:** All files use `strict: true` in tsconfig.json. No implicit `any` types.
2. **Source Maps:** Both JS and declaration files have source maps for debugging transpiled code.
3. **Error Handling:** Check HTTP status codes and throw descriptive errors in client methods (see `src/client.ts`).
4. **Flexible Task Queries:** Both `taskid` and `tasktoken` can be used to query/manage tasks (see `TaskDetailRequest` type).
5. **Generic Responses:** `run()` and `getTaskDetail()` are generic to support typed model outputs.

## Related Documentation

- `AGENTS.md` - Guidance for Qoder agents
- `docs/wiro-ai-research/wiro-ai-perplexity-research.md` - Deep dive on implementation decisions and best practices
- `docs/wiro-ai/professional-headshot/llms.txt` - Official API documentation with examples
