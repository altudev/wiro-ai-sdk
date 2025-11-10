/**
 * Virtual Try-On Example
 *
 * This example demonstrates how to use the Wiro AI SDK to generate hyper-realistic
 * apparel fitting images using the wiro/virtual-try-on model. The example shows
 * how to upload multiple files (human model and garment images) and configure
 * various photography styles and poses.
 *
 * Prerequisites:
 * 1. Copy examples/.env.example to .env (or create .env in project root)
 * 2. Add your Wiro API credentials to .env
 * 3. Get your API key and secret from https://dashboard.wiro.ai
 * 4. Prepare your images: one human photo and up to 2 garment images
 *
 * To run this example:
 *   # Using Bun (recommended):
 *   bun run examples/virtual-try-on.ts
 *
 *   # Using Node.js with npm/pnpm/yarn:
 *   npm install dotenv
 *   node --import tsx examples/virtual-try-on.ts
 */

import { WiroClient } from '../src/index';
import type { Task } from '../src/types/index';
import {
  loadEnv,
  getApiCredentials,
  isValidUrl,
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
  inputImageHuman: string;
  inputImageClothes: string[];
  style: 'virtual-try-on' | 'studio' | 'indoor' | 'outdoor';
  pose: 'auto' | 'sitting' | 'standing' | 'side-profile';
  plan: 'auto' | 'headshot' | 'medium-shot' | 'wide-shot';
  callbackUrl?: string;
}

/**
 * Validate virtual try-on parameters
 *
 * @param params - The parameters object to validate
 * @throws Error if any parameter is invalid
 */
function validateVirtualTryOnParams(params: VirtualTryOnParams): void {
  // Validate inputImageHuman
  if (!params.inputImageHuman) {
    throw new Error('inputImageHuman is required');
  }
  if (!isValidUrl(params.inputImageHuman)) {
    throw new Error(
      `Invalid inputImageHuman: "${params.inputImageHuman}". URL must be a valid HTTP or HTTPS URL.`
    );
  }

  // Validate inputImageClothes
  if (!params.inputImageClothes || params.inputImageClothes.length === 0) {
    throw new Error('At least one clothing image is required in inputImageClothes array');
  }
  if (params.inputImageClothes.length > 2) {
    throw new Error('Maximum 2 clothing images allowed in inputImageClothes array');
  }
  for (const clothingUrl of params.inputImageClothes) {
    if (!isValidUrl(clothingUrl)) {
      throw new Error(
        `Invalid clothing image URL: "${clothingUrl}". URL must be a valid HTTP or HTTPS URL.`
      );
    }
  }

  // Validate style
  const validStyles = ['virtual-try-on', 'studio', 'indoor', 'outdoor'];
  if (!validStyles.includes(params.style)) {
    throw new Error(`Invalid style: "${params.style}". Must be one of: ${validStyles.join(', ')}`);
  }

  // Validate pose
  const validPoses = ['auto', 'sitting', 'standing', 'side-profile'];
  if (!validPoses.includes(params.pose)) {
    throw new Error(`Invalid pose: "${params.pose}". Must be one of: ${validPoses.join(', ')}`);
  }

  // Validate plan
  const validPlans = ['auto', 'headshot', 'medium-shot', 'wide-shot'];
  if (!validPlans.includes(params.plan)) {
    throw new Error(`Invalid plan: "${params.plan}". Must be one of: ${validPlans.join(', ')}`);
  }
}

/**
 * Main example function demonstrating virtual try-on generation
 */
async function main() {
  console.log('=== Wiro AI Virtual Try-On Example ===\n');

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

  // Example images - replace with your own image URLs
  const humanImageUrl = 'https://cdn.wiro.ai/uploads/sampleinputs/wiro-virtual-try-on-input-1-1.jpg';
  const clothingImageUrls = [
    'https://cdn.wiro.ai/uploads/sampleinputs/wiro-virtual-try-on-input-1-2.jpg',
    'https://cdn.wiro.ai/uploads/sampleinputs/wiro-virtual-try-on-input-1-3.jpg',
  ];

  const params: VirtualTryOnParams = {
    // Required: URL of the human model image
    inputImageHuman: humanImageUrl,

    // Required: Array of 1-2 clothing/garment image URLs
    inputImageClothes: clothingImageUrls,

    // Photography style and environment
    // Options: "virtual-try-on" (keep original scene), "studio", "indoor", "outdoor"
    style: 'virtual-try-on',

    // Body posture for the model
    // Options: "auto" (best for garment), "sitting", "standing", "side-profile"
    pose: 'auto',

    // Shot type/framing
    // Options: "auto" (best for garment), "headshot" (shoulders up), "medium-shot" (waist up), "wide-shot" (full body)
    plan: 'auto',

    // Optional: Callback URL to receive a POST request when task completes
    // callbackUrl: 'https://your-server.com/callback',
  };

  // Validate all parameters before sending to API
  try {
    validateVirtualTryOnParams(params);
  } catch (validationError) {
    if (validationError instanceof Error) {
      throw new Error(`Parameter validation failed: ${validationError.message}`);
    }
    throw validationError;
  }

  console.log('Parameters:', JSON.stringify(params, null, 2));

  // Step 3: Prepare file uploads for the virtual try-on model
  console.log('\nStep 3: Preparing file uploads...');

  // The virtual try-on model requires file uploads rather than URLs
  // We need to convert our URLs to WiroFileParam format
  const files = [
    {
      name: 'inputImageHuman',
      file: params.inputImageHuman,
    },
    ...params.inputImageClothes.map((url, index) => ({
      name: `inputImageClothes[${index}]`,
      file: url,
    })),
  ];

  console.log('Files to upload:', files.length);
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.name}: ${file.file}`);
  });

  // Step 4: Run the virtual-try-on model
  console.log('\nStep 4: Submitting task to Wiro AI...');
  try {
    const modelParams = {
      style: params.style,
      pose: params.pose,
      plan: params.plan,
      ...(params.callbackUrl && { callbackUrl: params.callbackUrl }),
    };

    const runResult = await client.run('wiro', 'virtual-try-on', modelParams, files);

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

    // Step 5: Poll for task completion
    // Configure polling: virtual try-on typically takes longer due to complex processing
    const pollingConfig: PollingConfig = {
      maxAttempts: 90, // Try up to 90 times (~3 minutes with 2s interval)
      intervalMs: 2000, // Wait 2 seconds between attempts
    };
    console.log('\nStep 5: Waiting for task to complete...');
    console.log('Note: Virtual try-on processing typically takes 30-90 seconds...');
    const completedTask = await waitForTaskCompletion(client, runResult.taskid, pollingConfig);

    // Step 6: Display results
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
      console.log('\n💡 Tips for best results:');
      console.log('  - Use high-quality, well-lit photos');
      console.log('  - Ensure clothing images are on plain backgrounds');
      console.log('  - Try different styles and poses for various effects');
      console.log('  - Use "auto" settings for best garment presentation');
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