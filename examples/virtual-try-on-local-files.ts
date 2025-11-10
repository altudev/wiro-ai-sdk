/**
 * Virtual Try-On with Local Files Example
 *
 * This example demonstrates how to use the Wiro AI SDK with local file uploads
 * to generate virtual try-on images. This is useful when you have local image
 * files that you want to process directly without uploading them to URLs first.
 *
 * Prerequisites:
 * 1. Copy examples/.env.example to .env (or create .env in project root)
 * 2. Add your Wiro API credentials to .env
 * 3. Get your API key and secret from https://dashboard.wiro.ai
 * 4. Prepare your local images: one human photo and up to 2 garment images
 *
 * To run this example:
 *   # Using Bun (recommended):
 *   bun run examples/virtual-try-on-local-files.ts
 *
 *   # Using Node.js with npm/pnpm/yarn:
 *   npm install dotenv
 *   node --import tsx examples/virtual-try-on-local-files.ts
 */

import { WiroClient } from '../src/index';
import type { Task } from '../src/types/index';
import {
  loadEnv,
  getApiCredentials,
  waitForTaskCompletion,
  type PollingConfig,
} from './shared/helpers';

// Load environment variables
await loadEnv();

// Get API credentials from environment
const { apiKey, apiSecret } = getApiCredentials();

if (!apiKey || !apiSecret) {
  console.error('Error: Missing API credentials');
  console.error('Please copy examples/.env.example to .env and add your credentials');
  console.error('Get your API key and secret from https://dashboard.wiro.ai');
  process.exit(1);
}

/**
 * Interface for virtual try-on parameters
 */
interface VirtualTryOnParams {
  style: 'virtual-try-on' | 'studio' | 'indoor' | 'outdoor';
  pose: 'auto' | 'sitting' | 'standing' | 'side-profile';
  plan: 'auto' | 'headshot' | 'medium-shot' | 'wide-shot';
  callbackUrl?: string;
}

/**
 * Validate that local files exist and are accessible
 *
 * @param filePaths - Array of file paths to validate
 * @throws Error if any file doesn't exist or isn't accessible
 */
async function validateLocalFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      // Check if file exists using Bun.file or fs
      if (typeof Bun !== 'undefined') {
        const file = Bun.file(filePath);
        const exists = await file.exists();
        if (!exists) {
          throw new Error(`File not found: ${filePath}`);
        }
      } else {
        // Fallback for Node.js environments
        const fs = await import('fs/promises');
        try {
          await fs.access(filePath);
        } catch {
          throw new Error(`File not found: ${filePath}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to access file: ${filePath}`);
    }
  }
}

/**
 * Main example function demonstrating virtual try-on with local files
 */
async function main() {
  console.log('=== Wiro AI Virtual Try-On with Local Files Example ===\n');

  // Step 1: Initialize the WiroClient
  console.log('Step 1: Initializing WiroClient...');
  const client = new WiroClient({
    apiKey,
    apiSecret,
    // baseUrl: 'https://api.wiro.ai/v1' // Optional: customize base URL
  });
  console.log('Client initialized successfully');

  // Step 2: Define local file paths
  console.log('\nStep 2: Configuring local files...');

  // IMPORTANT: Replace these paths with your actual local image files
  const humanImagePath = './examples/sample-images/human-model.jpg';
  const clothingImagePaths = [
    './examples/sample-images/garment-1.jpg',
    './examples/sample-images/garment-2.jpg',
  ];

  console.log('Local files to be uploaded:');
  console.log('  Human model:', humanImagePath);
  console.log('  Garments:', clothingImagePaths.join(', '));

  // Check if files exist
  const allFilePaths = [humanImagePath, ...clothingImagePaths];
  try {
    await validateLocalFiles(allFilePaths);
    console.log('✓ All local files found and accessible');
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ File validation failed:', error.message);
      console.log('\n📝 To run this example:');
      console.log('1. Create a directory: mkdir -p examples/sample-images');
      console.log('2. Place your images in that directory:');
      console.log('   - Human model photo: human-model.jpg');
      console.log('   - Garment images: garment-1.jpg, garment-2.jpg');
      console.log('3. Update the file paths in this script to match your files');
    }
    process.exit(1);
  }

  // Step 3: Define model parameters
  console.log('\nStep 3: Configuring model parameters...');

  const params: VirtualTryOnParams = {
    // Photography style and environment
    // Options: "virtual-try-on" (keep original scene), "studio", "indoor", "outdoor"
    style: 'studio',

    // Body posture for the model
    // Options: "auto" (best for garment), "sitting", "standing", "side-profile"
    pose: 'standing',

    // Shot type/framing
    // Options: "auto" (best for garment), "headshot" (shoulders up), "medium-shot" (waist up), "wide-shot" (full body)
    plan: 'medium-shot',

    // Optional: Callback URL to receive a POST request when task completes
    // callbackUrl: 'https://your-server.com/callback',
  };

  console.log('Parameters:', JSON.stringify(params, null, 2));

  // Step 4: Prepare file uploads
  console.log('\nStep 4: Preparing file uploads...');

  // The virtual try-on model requires file uploads
  // We'll use local file paths which the SDK will handle
  const files = [
    {
      name: 'inputImageHuman',
      file: humanImagePath,
    },
    ...clothingImagePaths.map((path, index) => ({
      name: `inputImageClothes[${index}]`,
      file: path,
    })),
  ];

  console.log('Files to upload:', files.length);
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.name}: ${file.file}`);
  });

  // Step 5: Run the virtual-try-on model
  console.log('\nStep 5: Submitting task to Wiro AI...');
  try {
    const runResult = await client.run('wiro', 'virtual-try-on', params, files);

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

    // Step 6: Poll for task completion
    // Configure polling: virtual try-on typically takes longer due to complex processing
    const pollingConfig: PollingConfig = {
      maxAttempts: 90, // Try up to 90 times (~3 minutes with 2s interval)
      intervalMs: 2000, // Wait 2 seconds between attempts
    };
    console.log('\nStep 6: Waiting for task to complete...');
    console.log('Note: Virtual try-on processing typically takes 30-90 seconds...');
    const completedTask = await waitForTaskCompletion(client, runResult.taskid, pollingConfig);

    // Step 7: Display results
    console.log('\n=== Task Completed ===');
    console.log('Task ID:', completedTask.id);
    console.log('Status:', completedTask.status);
    console.log('Elapsed Time:', completedTask.elapsedseconds, 'seconds');

    if (completedTask.outputs && completedTask.outputs.length > 0) {
      console.log('\n=== Generated Virtual Try-On Images ===');
      completedTask.outputs.forEach((output, index) => {
        console.log(`\nOutput ${index + 1}:`);
        console.log('  Name:', output.name);
        console.log('  Type:', output.contenttype);
        console.log('  Size:', parseInt(output.size).toLocaleString(), 'bytes');
        console.log('  URL:', output.url);
      });

      console.log('\n✓ Success! Your virtual try-on images are ready.');
      console.log('Download the images from the URL(s) above.');

      // Optional: Download the generated images locally
      console.log('\n💡 You can download these images using:');
      console.log('  curl -o result-1.png', completedTask.outputs[0]?.url || '<output-url>');
      console.log('  # or in your browser, right-click and "Save Image As..."');

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