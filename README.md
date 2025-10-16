# Wiro AI SDK

Production-ready TypeScript SDK for the Wiro AI API. Generate professional headshots, apply image effects, and access other AI models through a simple, type-safe interface.

## About

Wiro AI SDK is the official TypeScript/JavaScript client library for the [Wiro AI](https://wiro.ai) platform. It provides a type-safe, zero-dependency interface for running AI models, managing tasks, and handling image processing operations. Built with modern standards and strict TypeScript support, this SDK simplifies integration with Wiro AI's powerful model ecosystem while handling authentication, file uploads, and task lifecycle management automatically.

**Why Wiro AI SDK?**
- 🎯 **Simple Integration**: Start using AI models with just a few lines of code
- 🔒 **Secure by Default**: Built-in HMAC-SHA256 authentication
- 📦 **Zero Dependencies**: Lightweight and production-ready
- 🛡️ **Type-Safe**: Full TypeScript support with strict type checking
- ⚡ **Modern**: Built on Web Standards (fetch, crypto, Blob APIs)

## Installation

Install the package via npm, yarn, pnpm, or bun:

```bash
# npm
npm install wiro-ai-sdk

# yarn
yarn add wiro-ai-sdk

# pnpm
pnpm add wiro-ai-sdk

# bun
bun add wiro-ai-sdk
```

## Quick Start

Get your API credentials from the [Wiro Dashboard](https://dashboard.wiro.ai), then:

```typescript
import { WiroClient } from 'wiro-ai-sdk';

// Initialize the client with your credentials
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

console.log('Task ID:', result.taskid);

// Get task details
const task = await client.getTaskDetail({ taskid: result.taskid });
console.log('Status:', task.tasklist[0].status);
```

## Usage Examples

### Professional Headshot Generation

Generate professional headshots from casual photos:

```typescript
import { WiroClient } from 'wiro-ai-sdk';

const client = new WiroClient({
  apiKey: process.env.WIRO_API_KEY!,
  apiSecret: process.env.WIRO_API_SECRET!
});

async function generateHeadshot(imageUrl: string) {
  // Start the headshot generation task
  const runResponse = await client.run('wiro', 'professional-headshot', {
    inputImageUrl: imageUrl,
    background: 'professional_office',
    outputFormat: 'png',
    outputQuality: 95
  });

  console.log(`Task started: ${runResponse.taskid}`);

  // Poll for task completion
  let task;
  do {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const detailResponse = await client.getTaskDetail({ 
      taskid: runResponse.taskid 
    });
    task = detailResponse.tasklist[0];
    console.log(`Status: ${task.status}`);
  } while (task.status !== 'task_postprocess_end' && task.status !== 'task_cancel');

  // Check result
  if (task.status === 'task_postprocess_end' && task.result) {
    console.log('✅ Success! Generated headshot:', task.result.outputImageUrl);
    return task.result;
  } else {
    throw new Error(`Task failed or was cancelled: ${task.status}`);
  }
}

// Use the function
generateHeadshot('https://example.com/casual-photo.jpg')
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
```

### Working with Local Files

Upload local images instead of URLs:

```typescript
import { WiroClient, WiroFileParam } from 'wiro-ai-sdk';
import { readFileSync } from 'fs';

const client = new WiroClient({
  apiKey: process.env.WIRO_API_KEY!,
  apiSecret: process.env.WIRO_API_SECRET!
});

// Option 1: Using file path (Bun runtime)
const files: WiroFileParam[] = [{
  name: 'inputImage',
  file: './my-photo.jpg'
}];

const result = await client.run('wiro', 'professional-headshot', {
  background: 'neutral',
  outputFormat: 'jpeg'
}, files);

// Option 2: Using Blob (Node.js or browser)
const imageBuffer = readFileSync('./my-photo.jpg');
const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

const filesWithBlob: WiroFileParam[] = [{
  name: 'inputImage',
  file: blob
}];

const result2 = await client.run('wiro', 'professional-headshot', {
  background: 'neutral',
  outputFormat: 'jpeg'
}, filesWithBlob);
```

### Task Management

Manage running and queued tasks:

```typescript
import { WiroClient } from 'wiro-ai-sdk';

const client = new WiroClient({
  apiKey: process.env.WIRO_API_KEY!,
  apiSecret: process.env.WIRO_API_SECRET!
});

// Kill a running task
await client.killTask({ taskid: 'task_123456' });

// Cancel a queued task
await client.cancelTask('task_123456');

// Query task by token (alternative to taskid)
const task = await client.getTaskDetail({ 
  tasktoken: 'your_task_token' 
});
```

## Repository Examples

This repository includes comprehensive examples showing best practices for task polling, error handling, and advanced usage patterns. These are useful if you've cloned the repository and want to see full implementations:

- **[professional-headshot.ts](./examples/professional-headshot.ts)** - Complete example with task polling and error handling

### Running Repository Examples (For Development)

If you've cloned this repository:

1. Install dependencies:
   ```bash
   bun install
   ```
2. Get your API credentials from [Wiro Dashboard](https://dashboard.wiro.ai)
3. Copy the environment template:
   ```bash
   cp examples/.env.example .env
   ```
4. Add your credentials to `.env`
5. Run the example:
   ```bash
   bun run examples/professional-headshot.ts
   ```

See the [examples README](./examples/README.md) for detailed documentation.

**Note:** If you're using the SDK as an installed npm package in your own project, refer to the "Usage Examples" section above instead.

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
