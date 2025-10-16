/**
 * Professional Headshot Example
 * 
 * This example demonstrates how to use the Wiro AI SDK to generate professional
 * headshots from an input image using the wiro/professional-headshot model.
 * 
 * Prerequisites:
 * 1. Copy .env.example to .env
 * 2. Add your Wiro API credentials to .env
 * 3. Get your API key and secret from https://dashboard.wiro.ai
 * 
 * To run this example:
 *   bun run examples/professional-headshot.ts
 */

import { WiroClient } from '../src/index';
import type { Task, TaskStatus } from '../src/types/index';

// Load environment variables (Bun automatically loads .env files)
const apiKey = Bun.env.WIRO_API_KEY;
const apiSecret = Bun.env.WIRO_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error('Error: Missing API credentials');
  console.error('Please copy examples/.env.example to .env and add your credentials');
  console.error('Get your API key and secret from https://dashboard.wiro.ai');
  process.exit(1);
}

/**
 * Helper function to poll task status until completion.
 * 
 * The Wiro API uses async task processing. After submitting a task via run(),
 * you need to poll the Task/Detail endpoint to check when it's complete.
 * 
 * @param client - The WiroClient instance
 * @param taskid - The task ID to poll
 * @param maxAttempts - Maximum number of polling attempts (default: 60)
 * @param intervalMs - Time to wait between polls in milliseconds (default: 2000)
 * @returns The completed task details
 */
async function waitForTaskCompletion(
  client: WiroClient,
  taskid: string,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<Task> {
  console.log(`\nPolling task ${taskid} for completion...`);
  
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
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error(`Task did not complete within ${maxAttempts * intervalMs / 1000} seconds`);
}

/**
 * Main example function demonstrating professional headshot generation
 */
async function main() {
  console.log('=== Wiro AI Professional Headshot Example ===\n');
  
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
  const inputImageUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';
  
  const params = {
    // Required: URL of the image to transform into a professional headshot
    inputImageUrl,
    
    // Background options: white, black, neutral, gray, office
    background: 'neutral',
    
    // Optional: Aspect ratio for the output
    // Options: "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
    // Leave empty to match input image
    aspectRatio: '1:1',
    
    // Seed for reproducibility (same seed = same output for same input)
    seed: 42,
    
    // Output format: jpeg or png
    outputFormat: 'jpeg',
    
    // Safety tolerance (0-6, where 0 is strictest, 6 is most permissive)
    safetyTolerance: 2,
    
    // Optional: Callback URL to receive a POST request when task completes
    // callbackUrl: 'https://your-server.com/callback',
  };
  
  console.log('Parameters:', JSON.stringify(params, null, 2));
  
  // Step 3: Run the professional-headshot model
  console.log('\nStep 3: Submitting task to Wiro AI...');
  try {
    const runResult = await client.run('wiro', 'professional-headshot', params);
    
    console.log('Task submitted successfully!');
    console.log('Task ID:', runResult.taskid);
    console.log('Socket Access Token:', runResult.socketaccesstoken);
    
    if (!runResult.result) {
      console.error('Warning: API returned result=false');
      if (runResult.errors && runResult.errors.length > 0) {
        console.error('Errors:', runResult.errors);
      }
      return;
    }
    
    if (!runResult.taskid) {
      throw new Error('No task ID returned from API');
    }
    
    // Step 4: Poll for task completion
    console.log('\nStep 4: Waiting for task to complete...');
    const completedTask = await waitForTaskCompletion(client, runResult.taskid);
    
    // Step 5: Display results
    console.log('\n=== Task Completed ===');
    console.log('Task ID:', completedTask.id);
    console.log('Status:', completedTask.status);
    console.log('Elapsed Time:', completedTask.elapsedseconds, 'seconds');
    
    if (completedTask.outputs && completedTask.outputs.length > 0) {
      console.log('\n=== Generated Headshots ===');
      completedTask.outputs.forEach((output, index) => {
        console.log(`\nOutput ${index + 1}:`);
        console.log('  Name:', output.name);
        console.log('  Type:', output.contenttype);
        console.log('  Size:', parseInt(output.size).toLocaleString(), 'bytes');
        console.log('  URL:', output.url);
      });
      
      console.log('\n✓ Success! Your professional headshot is ready.');
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
