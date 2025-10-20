/**
 * Cartoonify Example
 *
 * This example demonstrates how to use the Wiro AI SDK to transform photos
 * into fun, vibrant cartoons using the wiro/cartoonify model.
 *
 * Prerequisites:
 * 1. Copy examples/.env.example to .env (or create .env in project root)
 * 2. Add your Wiro API credentials to .env
 * 3. Get your API key and secret from https://dashboard.wiro.ai
 *
 * To run this example:
 *   # Using Bun (recommended):
 *   bun run examples/cartoonify.ts
 *
 *   # Using Node.js with npm/pnpm/yarn:
 *   npm install dotenv
 *   node --loader tsx examples/cartoonify.ts
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
 * Main example function demonstrating cartoonify transformation
 */
async function main() {
  console.log('=== Wiro AI Cartoonify Example ===\n');

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
    // Required: URL of the image to transform into a cartoon
    inputImageUrl,

    // Safety tolerance (0-6, where 0 is strictest, 6 is most permissive)
    safetyTolerance: '2',

    // Aspect ratio for the output
    // Options: "", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    // Leave empty ("") to match input image aspect ratio
    aspectRatio: '',

    // Seed for reproducibility (same seed = same output for same input)
    seed: '42',

    // Output format: jpeg or png
    outputFormat: 'jpeg',

    // Optional: Callback URL to receive a POST request when task completes
    // callbackUrl: 'https://your-server.com/callback',
  };

  console.log('Parameters:', JSON.stringify(params, null, 2));

  // Step 3: Run the cartoonify model
  console.log('\nStep 3: Submitting task to Wiro AI...');
  try {
    const runResult = await client.run('wiro', 'cartoonify', params);

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
      console.log('\n=== Generated Cartoon Images ===');
      completedTask.outputs.forEach((output, index) => {
        console.log(`\nOutput ${index + 1}:`);
        console.log('  Name:', output.name);
        console.log('  Type:', output.contenttype);
        console.log('  Size:', parseInt(output.size).toLocaleString(), 'bytes');
        console.log('  URL:', output.url);
      });

      console.log('\n✓ Success! Your cartoonified image is ready.');
      console.log('Download the image from the URL(s) above.');
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