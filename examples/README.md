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

### Cartoonify (`cartoonify.ts`)

Demonstrates how to transform photos into fun, vibrant cartoons using the `wiro/cartoonify` model.

**What it demonstrates:**
- Image transformation and artistic effect application
- Parameter validation before API submission
- Safety tolerance configuration for content moderation
- Aspect ratio control for output dimensions
- Reproducible results using seeds
- Same robust polling and error handling patterns

**To run:**
```bash
bun run examples/cartoonify.ts
```

**Key features shown:**
- **Model Parameters**: Safety tolerance (0-6), aspect ratio, seed, output format
- **Parameter Validation**: Pre-flight validation using helper functions
- **Image Transformation**: Converting photos into cartoon style
- **Output Handling**: Accessing transformed image URLs
- **Error Handling**: Comprehensive error reporting and debugging

**Expected output:**
```
=== Wiro AI Cartoonify Example ===

Step 1: Initializing WiroClient...
Client initialized successfully

Step 2: Configuring model parameters...
Parameters: {
  inputImageUrl: 'https://example.com/image.jpg',
  safetyTolerance: '2',
  aspectRatio: '',
  seed: '42',
  outputFormat: 'jpeg'
}

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
Elapsed Time: 8.0000 seconds

=== Generated Cartoon Images ===

Output 1:
  Name: 0.jpeg
  Type: image/jpeg
  Size: 156,234 bytes
  URL: https://cdn1.wiro.ai/.../0.jpeg

✓ Success! Your cartoonified image is ready.
Download the image from the URL(s) above.
```

### Virtual Try-On (`virtual-try-on.ts`)

Demonstrates how to generate hyper-realistic apparel fitting images using the `wiro/virtual-try-on` model with remote image URLs. This example shows how to upload multiple files and configure photography styles and poses.

**What it demonstrates:**
- Multi-file upload handling (human model + up to 2 garment images)
- Photography style configuration (virtual try-on, studio, indoor, outdoor)
- Pose selection (auto, sitting, standing, side-profile)
- Shot type/framing control (auto, headshot, medium-shot, wide-shot)
- Parameter validation for complex multi-input models
- Extended polling timeout for longer processing times

**To run:**
```bash
bun run examples/virtual-try-on.ts
```

**Key features shown:**
- **Multi-File Upload**: Handling multiple image inputs with proper file parameter naming
- **Style Options**: Choose from 4 photography styles for different environments
- **Pose Control**: Configure model posture for optimal garment presentation
- **Shot Types**: Control framing from headshots to full-body shots
- **Extended Polling**: Longer timeouts for complex image processing (30-90 seconds)
- **Comprehensive Validation**: Parameter validation for all input types

**Expected output:**
```
=== Wiro AI Virtual Try-On Example ===

Step 1: Initializing WiroClient...
Client initialized successfully

Step 2: Configuring model parameters...
Parameters: {
  "inputImageHuman": "https://...",
  "inputImageClothes": ["https://...", "https://..."],
  "style": "virtual-try-on",
  "pose": "auto",
  "plan": "auto"
}

Step 3: Preparing file uploads...
Files to upload: 3
  1. inputImageHuman: https://cdn.wiro.ai/.../human.jpg
  2. inputImageClothes[0]: https://cdn.wiro.ai/.../garment1.jpg
  3. inputImageClothes[1]: https://cdn.wiro.ai/.../garment2.jpg

Step 4: Submitting task to Wiro AI...
Task submitted successfully!
Task ID: 2221
Socket Access Token: eDcCm5yyUfIvMFspTwww49OUfgXkQt

Step 5: Waiting for task to complete...
Note: Virtual try-on processing typically takes 30-90 seconds...
Polling task 2221 for completion...
[Attempt 15/90] Status: task_postprocess_end
Task completed successfully!

=== Task Completed ===
Task ID: 2221
Status: task_postprocess_end
Elapsed Time: 30.0000 seconds

=== Generated Virtual Try-On Images ===

Output 1:
  Name: 0.png
  Type: image/png
  Size: 1,234,567 bytes
  URL: https://cdn1.wiro.ai/.../0.png

✓ Success! Your virtual try-on images are ready.
Download the images from the URL(s) above.

💡 Tips for best results:
  - Use high-quality, well-lit photos
  - Ensure clothing images are on plain backgrounds
  - Try different styles and poses for various effects
  - Use "auto" settings for best garment presentation
```

### Virtual Try-On with Local Files (`virtual-try-on-local-files.ts`)

Demonstrates how to use local file uploads for virtual try-on generation, perfect for processing images stored on your local filesystem without first uploading them to URLs.

**What it demonstrates:**
- Local file path validation and accessibility checking
- File system operations with both Bun and Node.js compatibility
- Local file upload handling in the SDK
- Error handling for missing or inaccessible files
- File preparation guidance and setup instructions

**To run:**
```bash
# First, create a directory for your sample images
mkdir -p examples/sample-images

# Place your images in that directory:
# - human-model.jpg (your model photo)
# - garment-1.jpg, garment-2.jpg (clothing items)

# Then run the example
bun run examples/virtual-try-on-local-files.ts
```

**Key features shown:**
- **Local File Handling**: Direct file path uploads without URL conversion
- **File Validation**: Pre-flight checks for file existence and accessibility
- **Cross-Platform Compatibility**: Works with both Bun and Node.js file APIs
- **Setup Guidance**: Clear instructions for preparing local files
- **Error Recovery**: Helpful error messages when files are missing

**Expected output:**
```
=== Wiro AI Virtual Try-On with Local Files Example ===

Step 1: Initializing WiroClient...
Client initialized successfully

Step 2: Configuring local files...
Local files to be uploaded:
  Human model: ./examples/sample-images/human-model.jpg
  Garments: ./examples/sample-images/garment-1.jpg, ./examples/sample-images/garment-2.jpg
✓ All local files found and accessible

Step 3: Configuring model parameters...
Parameters: {
  "style": "studio",
  "pose": "standing",
  "plan": "medium-shot"
}

Step 4: Preparing file uploads...
Files to upload: 3
  1. inputImageHuman: ./examples/sample-images/human-model.jpg
  2. inputImageClothes[0]: ./examples/sample-images/garment-1.jpg
  3. inputImageClothes[1]: ./examples/sample-images/garment-2.jpg

Step 5: Submitting task to Wiro AI...
Task submitted successfully!
Task ID: 2221

Step 6: Waiting for task to complete...
Note: Virtual try-on processing typically takes 30-90 seconds...

=== Task Completed ===
✓ Success! Your virtual try-on images are ready.
Download the images from the URL(s) above.

💡 You can download these images using:
  curl -o result-1.png https://cdn1.wiro.ai/.../0.png
  # or in your browser, right-click and "Save Image As..."
```

### Iconic Locations (`iconic-locations.ts`)

Demonstrates how to place images seamlessly into iconic landmarks and breathtaking locations around the world using the `wiro/iconic-locations` model.

**What it demonstrates:**
- Placing images into 65+ iconic locations worldwide
- Location options including Eiffel Tower, Tokyo Tower, Taj Mahal, Times Square, and many more
- Aspect ratio control with input dimension matching
- Reproducible generation with seeds
- Same robust polling and error handling patterns

**To run:**
```bash
bun run examples/iconic-locations.ts
```

**Key features shown:**
- **Location Selection**: Choose from 65+ iconic landmarks (or "Random" for surprise)
- **Flexible Output**: Control aspect ratio or match input image dimensions
- **Model Parameters**: Safety tolerance, seed, output format (JPEG/PNG)
- **Task Polling**: Automated polling with configurable timeouts
- **Error Handling**: URL validation and comprehensive error reporting

**Expected output:**
```
=== Wiro AI Iconic Locations Example ===

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

=== Generated Images with Iconic Locations ===

Output 1:
  Name: 0.png
  Type: image/png
  Size: 202,472 bytes
  URL: https://cdn1.wiro.ai/.../0.png

✓ Success! Your image has been placed into an iconic location.
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
// Upload a single local file
const result = await client.run('wiro', 'model-name', {
  prompt: 'Generate an image',
}, [
  { name: 'inputImage', file: './path/to/image.jpg' }
]);

// Upload multiple files (like Virtual Try-On)
const files = [
  { name: 'inputImageHuman', file: './human.jpg' },
  { name: 'inputImageClothes[0]', file: './shirt.jpg' },
  { name: 'inputImageClothes[1]', file: './pants.jpg' }
];

const result = await client.run('wiro', 'virtual-try-on', {
  style: 'studio',
  pose: 'standing',
  plan: 'auto'
}, files);
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
