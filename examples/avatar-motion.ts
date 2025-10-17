/**
 * Avatar Motion Example
 *
 * This example demonstrates how to use the Wiro AI SDK to generate avatars from photos
 * and animate them into engaging videos using the wiro/avatarmotion model.
 *
 * Prerequisites:
 * 1. Copy examples/.env.example to .env (or create .env in project root)
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
import type { Task } from '../src/types/index';
import { loadEnv, isValidUrl, waitForTaskCompletion, type PollingConfig } from './shared/helpers';

// Load environment variables
await loadEnv();

// Get API credentials from environment
// Works with both Bun (Bun.env) and Node.js (process.env)
const apiKey = (typeof Bun !== 'undefined' ? Bun.env.WIRO_API_KEY : null) || process.env.WIRO_API_KEY;
const apiSecret = (typeof Bun !== 'undefined' ? Bun.env.WIRO_API_SECRET : null) || process.env.WIRO_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error('Error: Missing API credentials');
  console.error('Please copy examples/.env.example to .env and add your credentials');
  console.error('Get your API key and secret from https://dashboard.wiro.ai');
  process.exit(1);
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
    // The effect type determines the animation style applied to the avatar.
    // Check the Wiro AI dashboard or model documentation for all available options.
    // Example: '3d_figure_smashing' (default)
    effectType: '3d_figure_smashing',

    // Output type for the generated video
    // Determines what type of output files are generated (image, video, or both).
    // Options: 'both' (default) - generates both image and video outputs
    // Check the Wiro AI dashboard for complete list of options.
    outputType: 'both',

    // Seed for reproducibility (same seed = same output for same input)
    // Can be any string value, typically numeric strings like '42'
    seed: '42',

    // Optional: Callback URL to receive a POST request when task completes
    // When provided, Wiro will send a POST request to this URL with task results
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
