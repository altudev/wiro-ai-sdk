# Wiro AI SDK

Production-ready TypeScript SDK for the Wiro AI API. Generate professional headshots, apply image effects, and access other AI models through a simple, type-safe interface.

## Installation

```bash
bun install
```

## Quick Start

```typescript
import { WiroClient } from 'wiro-ai-sdk';

// Initialize the client
const client = new WiroClient({
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret'
});

// Run a model
const result = await client.run('wiro', 'professional-headshot', {
  inputImageUrl: 'https://example.com/photo.jpg',
  background: 'neutral',
  outputFormat: 'jpeg'
});

// Get task details
const task = await client.getTaskDetail({ taskid: result.taskid });
console.log('Status:', task.tasklist[0].status);
```

## Examples

Comprehensive examples are available in the [`examples/`](./examples) directory:

- **[professional-headshot.ts](./examples/professional-headshot.ts)** - Generate professional headshots with full task polling and error handling

### Running Examples

1. Get your API credentials from [Wiro Dashboard](https://dashboard.wiro.ai)
2. Copy the environment template:
   ```bash
   cp examples/.env.example .env
   ```
3. Add your credentials to `.env`
4. Run the example:
   ```bash
   bun run examples/professional-headshot.ts
   ```

See the [examples README](./examples/README.md) for detailed documentation.

## Features

- ✅ **Type-Safe**: Full TypeScript support with strict type checking
- ✅ **Zero Dependencies**: Uses built-in fetch and crypto APIs
- ✅ **File Uploads**: Automatic handling of file parameters
- ✅ **Authentication**: Built-in HMAC-SHA256 authentication
- ✅ **Task Management**: Complete task lifecycle support
- ✅ **ESM Support**: Modern ES Module format

## API Reference

### Client Methods

- `run()` - Execute AI models with optional file uploads
- `getTaskDetail()` - Query task status and outputs
- `killTask()` - Terminate running tasks
- `cancelTask()` - Cancel queued tasks

See [CLAUDE.md](./CLAUDE.md) for comprehensive API documentation.

## Development

```bash
# Type checking
bun run typecheck

# Build
bun run build

# Run tests
bun test
```

## License

See [LICENSE.md](./LICENSE.md)

## Links

- [Wiro Dashboard](https://dashboard.wiro.ai) - Get API credentials
- [API Documentation](./docs/wiro-ai/professional-headshot/llms.txt) - Detailed API specs
- [Examples](./examples) - Comprehensive usage examples

---

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
