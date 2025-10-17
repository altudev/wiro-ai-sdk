/**
 * Avatar Motion Example
 *
 * This example demonstrates how to use the Wiro AI SDK to generate avatars from photos
 * and animate them into engaging videos using the wiro/avatarmotion model.
 *
 * Prerequisites:
 * 1. Copy .env.example to .env
 * 2. Add your Wiro API credentials to .env
 * 3. Get your API key and secret from https://dashboard.wiro.ai
 *
 * To run this example:
 *   # Using Bun (recommended):
 *   bun run examples/avatar-motion.ts
 *
 *   # Using Node.js with npm/pnpm/yarn:
 *   npm install dotenv
 *   node --loader tsx examples/avatar-motion.ts
 */

import { WiroClient } from '../src/index';
import type { Task, TaskStatus } from '../src/types/index';

/**
 * Load environment variables from .env file.
 * Works with both Bun and Node.js environments.
 *
 * Bun automatically loads .env files, but for Node.js compatibility,
 * we explicitly load it to support npm/pnpm/yarn users.
 */
async function loadEnv(): Promise<void> {
  try {
    // Try to use dotenv for Node.js environments
    // This is optional - users can install dotenv or use Bun
    if (typeof require !== 'undefined') {
      try {
        require('dotenv').config();
      } catch {
        // dotenv not installed, continue with existing env vars
      }
    }
  } catch {
    // Silently continue if dotenv is not available
  }
}

// Load environment variables
await loadEnv();

// Get API credentials from environment
// Works with both Bun (Bun.env) and Node.js (process.env)
const apiKey = (typeof Bun !== 'undefined' ? Bun.env.WIRO_API_KEY : null) || process.env.WIRO_API_KEY;
const apiSecret = (typeof Bun !== 'undefined' ? Bun.env.WIRO_API_SECRET : null) || process.env.WIRO_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error('Error: Missing API credentials');
  console.error('Please copy .env.example to .env and add your credentials');
  console.error('Get your API key and secret from https://dashboard.wiro.ai');
  process.exit(1);
}

/**
 * Configuration for task polling behavior.
 * Can be customized for different use cases.
 */
interface PollingConfig {
  maxAttempts?: number;  // Default: 60 (~2 minutes with 2s interval)
  intervalMs?: number;   // Default: 2000 (2 seconds between polls)
}

/**
 * Validate that a string is a valid URL.
 *
 * @param url - The URL to validate
 * @returns true if the URL is valid, false otherwise
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to poll task status until completion.
 *
 * The Wiro API uses async task processing. After submitting a task via run(),
 * you need to poll the Task/Detail endpoint to check when it's complete.
 *
 * @param client - The WiroClient instance
 * @param taskid - The task ID to poll
 * @param config - Polling configuration (optional)
 * @returns The completed task details
 */
async function waitForTaskCompletion(
  client: WiroClient,
  taskid: string,
  config: PollingConfig = {}
): Promise<Task> {
  const maxAttempts = config.maxAttempts ?? 60; // ~2 minutes at 2s intervals
  const intervalMs = config.intervalMs ?? 2000;

  console.log(`\nPolling task ${taskid} for completion...`);
  console.log(`(Max attempts: ${maxAttempts}, Interval: ${intervalMs}ms ≈ ${(maxAttempts * intervalMs) / 1000}s timeout)`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Query task status
    const detail = await client.getTaskDetail({ taskid });

    if (!detail.tasklist || detail.tasklist.length === 0) {
      throw new Error('Task not found in response');
    }

    const task = detail.tasklist[0];
    const status: TaskStatus = task.status;

    console.log(`[Attempt ${attempt}/${maxAttempts}] Status: ${status}`);

    // Check if task has reached a terminal state
    if (status === 'task_postprocess_end') {
      console.log('Task completed successfully!');
      return task;
    } else if (status === 'task_cancel') {
      throw new Error('Task was cancelled');
    }

    // Task is still processing, wait before next poll
    // Status progression: task_queue -> task_accept -> task_assign ->
    // task_preprocess_start -> task_preprocess_end -> task_start ->
    // task_output -> task_postprocess_start -> task_postprocess_end

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(`Task did not complete within ${(maxAttempts * intervalMs) / 1000} seconds`);
}

/**
 * Main example function demonstrating avatar motion generation
 */
async function main() {
  console.log('=== Wiro AI Avatar Motion Example ===\n');

  // Step 1: Initialize the WiroClient
  console.log('Step 1: Initializing WiroClient...');
  const client = new WiroClient({
    apiKey,
    apiSecret,
    // baseUrl: 'https://api.wiro.ai/v1' // Optional: customize base URL
  });
  console.log('Client initialized successfully');

  // Step 2: Define model parameters
  console.log('\nStep 2: Configuring model parameters...');

  // Example input image URL (replace with your own image)
  const inputImageUrl = 'https://i.hizliresim.com/qnm71if.jpg';

  // Validate the input URL
  if (!isValidUrl(inputImageUrl)) {
    throw new Error(`Invalid input image URL: "${inputImageUrl}". URL must be a valid HTTP or HTTPS URL.`);
  }

  const params = {
    // Required: URL of the image to generate avatar from and animate
    inputImage: inputImageUrl,

    // Effect type for avatar animation
    // Default: 3d_figure_smashing
    effectType: '3d_figure_smashing',

    // Output type for the generated video
    // Default: both
    outputType: 'both',

    // Seed for reproducibility (same seed = same output for same input)
    seed: '42',

    // Optional: Callback URL to receive a POST request when task completes
    // callbackUrl: 'https://your-server.com/callback',
  };

  console.log('Parameters:', JSON.stringify(params, null, 2));

  // Step 3: Run the avatar-motion model
  console.log('\nStep 3: Submitting task to Wiro AI...');
  try {
    const runResult = await client.run('wiro', 'avatarmotion', params);

    // Check if the API returned a successful response
    if (!runResult.result) {
      console.error('Error: API returned result=false');
      if (runResult.errors && runResult.errors.length > 0) {
        console.error('API Errors:');
        runResult.errors.forEach((error) => {
          console.error(`  - ${error}`);
        });
      }
      throw new Error('Failed to submit task to Wiro AI');
    }

    // Verify that we got a task ID
    if (!runResult.taskid) {
      console.error('Error: No task ID returned from API');
      console.error('Full response:', JSON.stringify(runResult, null, 2));
      throw new Error('API did not return a task ID. The request may have been invalid.');
    }

    console.log('Task submitted successfully!');
    console.log('Task ID:', runResult.taskid);
    console.log('Socket Access Token:', runResult.socketaccesstoken);

    // Step 4: Poll for task completion
    // Configure polling: faster for testing, slower for production
    const pollingConfig: PollingConfig = {
      maxAttempts: 60, // Try up to 60 times (~2 minutes with 2s interval)
      intervalMs: 2000, // Wait 2 seconds between attempts
    };
    console.log('\nStep 4: Waiting for task to complete...');
    const completedTask = await waitForTaskCompletion(client, runResult.taskid, pollingConfig);

    // Step 5: Display results
    console.log('\n=== Task Completed ===');
    console.log('Task ID:', completedTask.id);
    console.log('Status:', completedTask.status);
    console.log('Elapsed Time:', completedTask.elapsedseconds, 'seconds');

    if (completedTask.outputs && completedTask.outputs.length > 0) {
      console.log('\n=== Generated Avatar Motion Video ===');
      completedTask.outputs.forEach((output, index) => {
        console.log(`\nOutput ${index + 1}:`);
        console.log('  Name:', output.name);
        console.log('  Type:', output.contenttype);
        console.log('  Size:', parseInt(output.size).toLocaleString(), 'bytes');
        console.log('  URL:', output.url);
      });

      console.log('\n✓ Success! Your avatar motion video is ready.');
      console.log('Download the video from the URL(s) above.');
    } else {
      console.log('\nWarning: No outputs were generated');
    }

    // Debug information (if any)
    if (completedTask.debugoutput) {
      console.log('\nDebug Output:', completedTask.debugoutput);
    }
    if (completedTask.debugerror) {
      console.log('\nDebug Errors:', completedTask.debugerror);
    }

  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the example
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
