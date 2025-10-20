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

## AI-Assisted Development

**Using AI coding assistants?** We've got you covered! This SDK includes a comprehensive [llms.txt](./llms.txt) file designed specifically for AI coding agents like Claude, GitHub Copilot, Cursor, and other LLM-powered development tools.

### How to Use llms.txt with Your AI Assistant

The `llms.txt` file contains detailed integration guides, usage patterns, and best practices that help AI models understand how to implement wiro-ai-sdk in your projects. Here's how to use it:

1. **Share the file with your AI assistant:**
   - When starting a new project: "Read @llms.txt and help me integrate wiro-ai-sdk"
   - For specific tasks: "Using @llms.txt as reference, help me generate professional headshots"
   - For troubleshooting: "Check @llms.txt and help me debug this task polling issue"

2. **What's inside:**
   - Complete installation and setup instructions
   - Copy-paste ready code examples for all use cases
   - Task lifecycle management patterns
   - Error handling best practices
   - TypeScript type definitions and interfaces
   - Troubleshooting guides for common issues

3. **Perfect for "vibe coding":**
   - Quickly scaffold new integrations with AI assistance
   - Get instant help with SDK patterns and best practices
   - Build production-ready code faster with AI-generated implementations
   - Learn the SDK through interactive development with your AI pair programmer

**Example conversation with your AI assistant:**

```
You: "Read @llms.txt and create a function that generates professional headshots
from a URL with proper error handling and task polling"

AI: *Creates a complete, production-ready implementation following SDK best practices*
```

The llms.txt file is continuously updated to ensure your AI assistant has the latest SDK knowledge and patterns.

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

**Note:** When using public image URLs, be mindful of image privacy. Avoid sharing sensitive or personal photos via publicly accessible URLs. For sensitive content, consider uploading local files directly or using authenticated/temporary URLs.

### Working with Local Files

Upload local images instead of URLs:

```typescript
import { WiroClient, WiroFileParam } from 'wiro-ai-sdk';
import { readFileSync } from 'fs';

const client = new WiroClient({
  apiKey: process.env.WIRO_API_KEY!,
  apiSecret: process.env.WIRO_API_SECRET!
});

try {
  // Option 1: Using file path (Bun runtime)
  const files: WiroFileParam[] = [{
    name: 'inputImage',
    file: './my-photo.jpg'
  }];

  const result = await client.run('wiro', 'professional-headshot', {
    background: 'neutral',
    outputFormat: 'jpeg'
  }, files);

  console.log('Task submitted:', result.taskid);

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

  console.log('Task submitted:', result2.taskid);
} catch (error) {
  console.error('Error uploading file:', error instanceof Error ? error.message : error);
}
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

- **[professional-headshot.ts](./examples/professional-headshot.ts)** - Generate professional headshots with customizable backgrounds and formatting
- **[cartoonify.ts](./examples/cartoonify.ts)** - Transform photos into fun, vibrant cartoons with adjustable style parameters
- **[avatar-motion.ts](./examples/avatar-motion.ts)** - Avatar animation example demonstrating the AvatarMotion model
- **[iconic-locations.ts](./examples/iconic-locations.ts)** - Place images into 65+ iconic landmarks and locations worldwide

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
   # or
   bun run examples/avatar-motion.ts
   ```

See the [examples README](./examples/README.md) for detailed documentation.

**Note:** If you're using the SDK as an installed npm package in your own project, refer to the "Usage Examples" section above instead.

### Shared Utilities for Examples

The repository includes reusable utilities in `examples/shared/` to help you build your own examples:

```typescript
import {
  loadEnv,
  isValidUrl,
  waitForTaskCompletion
} from './examples/shared/helpers';

// Load environment variables (works with both Bun and Node.js)
await loadEnv();

// Validate URLs before using them
if (!isValidUrl(imageUrl)) {
  throw new Error('Invalid URL');
}

// Poll for task completion with configurable timeout
const completedTask = await waitForTaskCompletion(client, taskId, {
  maxAttempts: 60,  // Try up to 60 times
  intervalMs: 2000  // Wait 2 seconds between attempts
});
```

**Available Utilities:**
- `loadEnv()` - Cross-platform environment variable loading
- `isValidUrl(url)` - URL validation helper
- `waitForTaskCompletion(client, taskId, config)` - Task polling with timeout
- `PollingConfig` - Type-safe polling configuration

These utilities are designed to reduce code duplication across examples and provide consistent behavior. They're fully tested with 95+ unit tests.

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

# Run all tests
bun test

# Run tests with coverage
bun run test:coverage

# Run specific test suites
bun run test:professional-headshot
bun run test:avatar-motion

# Watch mode for tests
bun run test:watch
```

## Troubleshooting

### Authentication Errors

**Problem:** "Wiro API request failed: 401 Unauthorized"

**Solution:**
- Verify your API key and secret are correct
- Check that credentials are properly loaded from environment variables
- Ensure no extra spaces or quotes around credential values

### Task Never Completes

**Problem:** Task stays in `task_queue` or `task_start` indefinitely

**Solution:**
- Check the [Wiro Dashboard](https://dashboard.wiro.ai) for task status
- Verify input parameters match model requirements
- Ensure input image URLs are publicly accessible
- Check task `debugerror` field: `task.debugerror`

### File Upload Errors

**Problem:** "Failed to read file" or file upload failures

**Solution:**
- Verify file path is correct and file exists
- Ensure file is a supported image format (JPEG, PNG, etc.)
- For Bun file paths, make sure you're using the Bun runtime
- For Node.js, use Blob/Buffer approach instead of file paths

### Task Cancelled

**Problem:** Task status shows `task_cancel`

**Solution:**
- Check `task.debugerror` for cancellation reason
- Verify input image meets model requirements (size, format, content)
- Review safety tolerance settings if content was flagged
- Ensure image URL is accessible and not behind authentication

For more troubleshooting help, see the [examples README](./examples/README.md#troubleshooting).

## License

See [LICENSE.md](./LICENSE.md)

## Links

- [Wiro Dashboard](https://dashboard.wiro.ai) - Get API credentials
- [API Documentation](./docs/wiro-ai/professional-headshot/llms.txt) - Detailed API specs
- [Examples](./examples) - Comprehensive usage examples

---

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
