# Wiro AI SDK Examples

This directory contains comprehensive examples demonstrating how to use the Wiro AI SDK with various models.

## Prerequisites

Before running any examples, you need to:

1. **Get API Credentials**
   - Sign up at [Wiro Dashboard](https://dashboard.wiro.ai)
   - Create a new project
   - Copy your API Key and API Secret

2. **Set Up Environment Variables**
   ```bash
   # Copy the environment template
   cp examples/.env.example .env
   
   # Edit .env and add your credentials
   # WIRO_API_KEY=your_api_key_here
   # WIRO_API_SECRET=your_api_secret_here
   ```

3. **Install Dependencies** (if not already done)
   ```bash
   bun install
   ```

## Available Examples

### Professional Headshot (`professional-headshot.ts`)

Demonstrates how to generate professional headshots from input images using the `wiro/professional-headshot` model.

**What it demonstrates:**
- Initializing the WiroClient with API credentials
- Running a model with parameters
- Polling for task completion
- Handling task status progression
- Retrieving and displaying output URLs
- Error handling and debugging

**To run:**
```bash
bun run examples/professional-headshot.ts
```

**Key features shown:**
- **Model Parameters**: Background selection, aspect ratio, seed, output format
- **Task Polling**: Automated polling with status tracking
- **Output Handling**: Accessing generated image URLs
- **Error Handling**: Proper try/catch and error reporting

**Expected output:**
```
=== Wiro AI Professional Headshot Example ===

Step 1: Initializing WiroClient...
Client initialized successfully

Step 2: Configuring model parameters...
Parameters: { ... }

Step 3: Submitting task to Wiro AI...
Task submitted successfully!
Task ID: 2221
Socket Access Token: eDcCm5yyUfIvMFspTwww49OUfgXkQt

Step 4: Waiting for task to complete...
Polling task 2221 for completion...
[Attempt 1/60] Status: task_queue
[Attempt 2/60] Status: task_start
[Attempt 3/60] Status: task_output
[Attempt 4/60] Status: task_postprocess_end
Task completed successfully!

=== Task Completed ===
Task ID: 2221
Status: task_postprocess_end
Elapsed Time: 6.0000 seconds

=== Generated Headshots ===

Output 1:
  Name: 0.png
  Type: image/png
  Size: 202,472 bytes
  URL: https://cdn1.wiro.ai/.../0.png

✓ Success! Your professional headshot is ready.
Download the image from the URL(s) above.
```

## Understanding Task Status Flow

When you submit a task to Wiro AI, it goes through several status stages:

### Active Statuses (Task is still processing)
1. `task_queue` - Task is waiting in queue
2. `task_accept` - Task has been accepted
3. `task_assign` - Task is being assigned to a worker
4. `task_preprocess_start` - Preprocessing is starting
5. `task_preprocess_end` - Preprocessing is complete
6. `task_start` - Task execution has started
7. `task_output` - Output is being generated
8. `task_postprocess_start` - Post-processing is starting

### Terminal Statuses (Polling can stop)
- `task_postprocess_end` - ✅ Task completed successfully
- `task_cancel` - ❌ Task was cancelled

## Common Patterns

### 1. Basic Model Execution

```typescript
import { WiroClient } from 'wiro-ai-sdk';

const client = new WiroClient({
  apiKey: process.env.WIRO_API_KEY!,
  apiSecret: process.env.WIRO_API_SECRET!,
});

const result = await client.run('wiro', 'professional-headshot', {
  inputImageUrl: 'https://example.com/photo.jpg',
  background: 'neutral',
});

console.log('Task ID:', result.taskid);
```

### 2. Polling for Completion

```typescript
async function waitForTask(client: WiroClient, taskid: string) {
  while (true) {
    const detail = await client.getTaskDetail({ taskid });
    const task = detail.tasklist[0];
    
    if (task.status === 'task_postprocess_end') {
      return task; // Success!
    } else if (task.status === 'task_cancel') {
      throw new Error('Task cancelled');
    }
    
    // Wait before polling again
    await new Promise(r => setTimeout(r, 2000));
  }
}
```

### 3. Using File Uploads

```typescript
// Upload a local file
const result = await client.run('wiro', 'model-name', {
  prompt: 'Generate an image',
}, [
  { name: 'inputImage', file: './path/to/image.jpg' }
]);
```

### 4. Error Handling

```typescript
try {
  const result = await client.run('wiro', 'professional-headshot', params);
  
  if (!result.result) {
    console.error('API returned error:', result.errors);
    return;
  }
  
  const task = await waitForTaskCompletion(client, result.taskid!);
  console.log('Outputs:', task.outputs);
  
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## TypeScript Support

All examples are written in TypeScript and demonstrate:
- Type-safe API interactions
- Proper type annotations
- Generic type parameters for model outputs
- Interface usage for better IDE support

## Environment Variables

The examples use Bun's built-in environment variable support:

```typescript
// Bun automatically loads .env files
const apiKey = Bun.env.WIRO_API_KEY;
const apiSecret = Bun.env.WIRO_API_SECRET;
```

For Node.js environments, you would use:
```typescript
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.WIRO_API_KEY;
const apiSecret = process.env.WIRO_API_SECRET;
```

## Troubleshooting

### "Missing API credentials" error
- Make sure you copied `.env.example` to `.env`
- Verify your API key and secret are correctly set in `.env`
- Check that there are no extra spaces or quotes around the values

### Task never completes
- Check the Wiro dashboard for task status
- Verify your input parameters are correct
- Ensure the input image URL is accessible
- Check the debug output from the task details

### "Task was cancelled" error
- This usually means the task failed validation or processing
- Check `task.debugerror` for more information
- Verify your input parameters match the model requirements

## Additional Resources

- [Wiro Dashboard](https://dashboard.wiro.ai) - Manage your projects and API keys
- [Wiro Documentation](https://docs.wiro.ai) - Complete API documentation
- [SDK Source Code](../src/) - Browse the SDK implementation
- [Model Documentation](../docs/wiro-ai/professional-headshot/llms.txt) - Detailed model specs

## Contributing Examples

If you'd like to add more examples:
1. Create a new `.ts` file in this directory
2. Follow the existing example structure
3. Include comprehensive comments
4. Update this README with the new example
5. Submit a pull request

## License

These examples are part of the Wiro AI SDK and are subject to the same license terms.
