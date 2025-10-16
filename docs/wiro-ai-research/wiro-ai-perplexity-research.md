<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# I want to create an npm package for an AI Web Application called "Wiro AI". They have examples in many coding languages, but they don't have an npm package, and I want to develop one as an open-source project. This is going to be my first npm package, which I'll publish, so I'm just a beginner. I use "bun" and Typescript. Let me show you an example models that I'll be using.

[https://wiro.ai/](https://wiro.ai/)

[https://wiro.ai/models/wiro/professional-headshot](https://wiro.ai/models/wiro/professional-headshot)

[https://wiro.ai/models/wiro/polaroid-effect\#apisamples-nodejs](https://wiro.ai/models/wiro/polaroid-effect#apisamples-nodejs)

[https://wiro.ai/models/wiro/professional-headshot\#apisamples-nodejs](https://wiro.ai/models/wiro/professional-headshot#apisamples-nodejs)

[https://wiro.ai/models/wiro/avatarmotion\#apisamples-nodejs](https://wiro.ai/models/wiro/avatarmotion#apisamples-nodejs)

Now I have comprehensive information about Wiro AI's API structure and best practices for creating npm packages with TypeScript and Bun. Let me create a detailed guide for you.

## Creating Your First NPM Package: Wiro AI TypeScript SDK

Based on the Wiro AI API documentation and modern TypeScript/Bun best practices, here's a comprehensive guide for building your first open-source npm package.[^1][^2][^3][^4]

### Understanding Wiro AI's API Structure

Wiro AI uses a **HMAC-SHA256 authentication** system with the following workflow:[^2][^3][^4][^1]

**Authentication Headers:**

- `x-api-key`: Your API key
- `x-nonce`: Unix timestamp or random integer
- `x-signature`: HMAC-SHA256 hash of (API_SECRET + NONCE) using API_KEY

**Core Endpoints:**

- `POST /Run/{owner}/{project}` - Execute AI models
- `POST /Task/Detail` - Get task status (by taskId or taskToken)
- `POST /Task/Kill` - Terminate running tasks
- `POST /Task/Cancel` - Cancel queued tasks
- `WebSocket wss://socket.wiro.ai/v1` - Real-time task updates


### Project Structure

Here's the recommended folder structure for your npm package:[^5][^6][^7]

```
wiro-ai-sdk/
├── src/
│   ├── index.ts              # Main entry point
│   ├── client.ts             # API client class
│   ├── auth.ts               # Authentication utilities
│   ├── websocket.ts          # WebSocket handler
│   ├── types/
│   │   ├── index.ts          # Type definitions
│   │   ├── models.ts         # Model-specific types
│   │   └── responses.ts      # API response types
│   └── utils/
│       ├── errors.ts         # Custom error classes
│       └── helpers.ts        # Helper functions
├── tests/
│   └── client.test.ts
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── .gitignore
```


### Step 1: Initialize Your Project

```bash
# Create project directory
mkdir wiro-ai-sdk
cd wiro-ai-sdk

# Initialize with Bun
bun init -y

# Install development dependencies
bun add -d typescript @types/bun
bun add -d @types/node  # For crypto module
```


### Step 2: Configure TypeScript

Create `tsconfig.json`:[^1][^2]

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```


### Step 3: Configure package.json

Update your `package.json`:[^8][^9][^5]

```json
{
  "name": "wiro-ai-sdk",
  "version": "0.1.0",
  "description": "Unofficial TypeScript SDK for Wiro AI API",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "bun build src/index.ts --outdir dist --target node --format esm --sourcemap=external && bun run build:cjs && bun run build:types",
    "build:cjs": "bun build src/index.ts --outdir dist --target node --format cjs --sourcemap=external --outfile=index.js",
    "build:types": "tsc --emitDeclarationOnly --project tsconfig.json",
    "dev": "bun --watch src/index.ts",
    "test": "bun test",
    "prepublishOnly": "bun run build"
  },
  "keywords": [
    "wiro",
    "ai",
    "api",
    "sdk",
    "typescript",
    "image-generation",
    "ai-models"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/wiro-ai-sdk.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/wiro-ai-sdk/issues"
  },
  "homepage": "https://github.com/yourusername/wiro-ai-sdk#readme"
}
```


### Step 4: Create Type Definitions

`src/types/index.ts`:[^3][^4][^2][^1]

```typescript
export interface WiroConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  timeout?: number;
}

export interface WiroAuthHeaders {
  'x-api-key': string;
  'x-nonce': string;
  'x-signature': string;
  'Content-Type': string;
}

export interface RunTaskRequest {
  owner: string;
  project: string;
  parameters: Record<string, any>;
}

export interface RunTaskResponse {
  errors: string[];
  taskid: string;
  socketaccesstoken: string;
  result: boolean;
}

export interface TaskDetailRequest {
  taskid?: string;
  tasktoken?: string;
}

export interface TaskOutput {
  id: string;
  name: string;
  contenttype: string;
  url: string;
  size: string;
}

export interface Task {
  id: string;
  uuid: string;
  status: string;
  socketaccesstoken: string;
  parameters: Record<string, any>;
  outputs: TaskOutput[];
  starttime: string;
  endtime: string;
  elapsedseconds: string;
  totalcost: string;
}

export interface TaskDetailResponse {
  total: string;
  errors: string[];
  tasklist: Task[];
  result: boolean;
}

export type TaskStatus = 
  | 'task_queue'
  | 'task_accept'
  | 'task_preprocess_start'
  | 'task_preprocess_end'
  | 'task_assign'
  | 'task_start'
  | 'task_output'
  | 'task_error'
  | 'task_end'
  | 'task_postprocess_start'
  | 'task_postprocess_end'
  | 'task_cancel';

export interface WebSocketMessage {
  type: TaskStatus;
  message?: any;
  target?: string;
}
```


### Step 5: Implement Authentication

`src/auth.ts`:[^10][^11]

```typescript
import { createHmac } from 'crypto';
import type { WiroAuthHeaders } from './types';

export class WiroAuth {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Generate authentication headers for Wiro AI API
   * Uses HMAC-SHA256 signature
   */
  generateHeaders(): WiroAuthHeaders {
    // Generate nonce (unix timestamp)
    const nonce = Math.floor(Date.now() / 1000).toString();
    
    // Create HMAC-SHA256 signature
    const signature = this.generateSignature(nonce);

    return {
      'x-api-key': this.apiKey,
      'x-nonce': nonce,
      'x-signature': signature,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generate HMAC-SHA256 signature
   * Formula: HMAC-SHA256(apiSecret + nonce, apiKey)
   */
  private generateSignature(nonce: string): string {
    const message = `${this.apiSecret}${nonce}`;
    const hmac = createHmac('sha256', this.apiKey);
    hmac.update(message);
    return hmac.digest('hex');
  }
}
```


### Step 6: Create the Main Client

`src/client.ts`:[^12]

```typescript
import type {
  WiroConfig,
  RunTaskRequest,
  RunTaskResponse,
  TaskDetailRequest,
  TaskDetailResponse
} from './types';
import { WiroAuth } from './auth';
import { WiroWebSocket } from './websocket';

export class WiroClient {
  private auth: WiroAuth;
  private baseUrl: string;
  private timeout: number;

  constructor(config: WiroConfig) {
    this.auth = new WiroAuth(config.apiKey, config.apiSecret);
    this.baseUrl = config.baseUrl || 'https://api.wiro.ai/v1';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Run an AI model
   */
  async runModel(
    owner: string,
    project: string,
    parameters: Record<string, any>
  ): Promise<RunTaskResponse> {
    const url = `${this.baseUrl}/Run/${owner}/${project}`;
    const headers = this.auth.generateHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(parameters),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get task details by ID or token
   */
  async getTaskDetail(request: TaskDetailRequest): Promise<TaskDetailResponse> {
    const url = `${this.baseUrl}/Task/Detail`;
    const headers = this.auth.generateHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Kill a running task
   */
  async killTask(taskIdOrToken: { taskid?: string; socketaccesstoken?: string }): Promise<TaskDetailResponse> {
    const url = `${this.baseUrl}/Task/Kill`;
    const headers = this.auth.generateHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(taskIdOrToken),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Cancel a queued task
   */
  async cancelTask(taskid: string): Promise<TaskDetailResponse> {
    const url = `${this.baseUrl}/Task/Cancel`;
    const headers = this.auth.generateHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ taskid }),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload a file to Wiro AI
   */
  async uploadFile(file: File | Blob, filename: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file, filename);

    const headers = this.auth.generateHeaders();
    delete (headers as any)['Content-Type']; // Let browser set multipart boundary

    const response = await fetch(`${this.baseUrl}/File/Upload`, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a WebSocket connection for real-time task updates
   */
  createWebSocket(socketAccessToken: string): WiroWebSocket {
    return new WiroWebSocket(socketAccessToken);
  }
}
```


### Step 7: Implement WebSocket Handler

`src/websocket.ts`:[^13][^14][^15]

```typescript
import type { WebSocketMessage, TaskStatus } from './types';

export type WebSocketEventHandler = (data: WebSocketMessage) => void;

export class WiroWebSocket {
  private ws: WebSocket | null = null;
  private socketAccessToken: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<TaskStatus | 'error' | 'close', WebSocketEventHandler[]> = new Map();

  constructor(socketAccessToken: string) {
    this.socketAccessToken = socketAccessToken;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://socket.wiro.ai/v1');

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Register task token
          this.ws?.send(JSON.stringify({
            type: 'task_info',
            tasktoken: this.socketAccessToken
          }));
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error' as any, { type: 'error' as TaskStatus, message: error });
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
          this.emit('close' as any, { type: 'task_end', message: event.reason });
          
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register event handler
   */
  on(event: TaskStatus | 'error' | 'close', handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event handler
   */
  off(event: TaskStatus | 'error' | 'close', handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all registered handlers
   */
  private emit(event: TaskStatus | 'error' | 'close', data: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log(`📨 Received: ${message.type}`);
    this.emit(message.type, message);
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
```


### Step 8: Create Main Entry Point

`src/index.ts`:

```typescript
export { WiroClient } from './client';
export { WiroWebSocket } from './websocket';
export { WiroAuth } from './auth';
export * from './types';

// Default export
export { WiroClient as default } from './client';
```


### Step 9: Write Usage Examples

Create `README.md`:[^16][^5]

```markdown
# Wiro AI SDK - Unofficial TypeScript Client

An unofficial TypeScript SDK for the [Wiro AI API](https://wiro.ai), built with Bun and designed for modern JavaScript/TypeScript projects.

## Installation

```

npm install wiro-ai-sdk

# or

bun add wiro-ai-sdk

# or

yarn add wiro-ai-sdk

```

## Quick Start

```

import { WiroClient } from 'wiro-ai-sdk';

const client = new WiroClient({
apiKey: 'your-api-key',
apiSecret: 'your-api-secret'
});

// Run a professional headshot model
const task = await client.runModel('wiro', 'professional-headshot', {
inputImage: 'https://example.com/image.jpg'
});

console.log('Task ID:', task.taskid);

// Get task details
const details = await client.getTaskDetail({ taskid: task.taskid });
console.log('Task status:', details.tasklist.status);

```

## Real-time Updates with WebSocket

```

// Create WebSocket connection
const ws = client.createWebSocket(task.socketaccesstoken);

// Listen for task events
ws.on('task_start', (data) => {
console.log('Task started!');
});

ws.on('task_postprocess_end', (data) => {
console.log('Task completed!');
console.log('Outputs:', data.message);
});

ws.on('error', (data) => {
console.error('Error:', data.message);
});

// Connect to WebSocket
await ws.connect();

```

## API Reference

### WiroClient

#### Constructor

```

new WiroClient(config: WiroConfig)

```

#### Methods

- `runModel(owner, project, parameters)` - Execute an AI model
- `getTaskDetail(request)` - Get task status and results
- `killTask(taskIdOrToken)` - Terminate a running task
- `cancelTask(taskid)` - Cancel a queued task
- `uploadFile(file, filename)` - Upload a file
- `createWebSocket(token)` - Create WebSocket connection

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Disclaimer

This is an unofficial SDK and is not affiliated with Wiro AI.
```


### Step 10: Build and Test

```bash
# Build the package
bun run build

# Test locally before publishing
bun link

# In another project
bun link wiro-ai-sdk
```


### Step 11: Publish to NPM

```bash
# Login to npm (first time only)
npm login

# Publish your package
npm publish
```


### Best Practices for Your First Package[^9][^17][^5]

**Documentation:**

- Write clear README with examples
- Add JSDoc comments to all public methods
- Include TypeScript types for better DX

**Version Management:**

- Start with 0.1.0 for initial release
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update changelog for each release

**Testing:**

- Add unit tests before publishing
- Test in both Node.js and browser environments
- Validate TypeScript types

**Security:**

- Never commit API keys or secrets
- Add `.env` to `.gitignore`
- Use environment variables for testing

**Community:**

- Add a contributing guide
- Set up issue templates
- Respond to issues and PRs promptly

This guide provides everything you need to create a production-ready npm package for Wiro AI. The architecture follows modern best practices, uses type-safe TypeScript, and implements proper authentication with HMAC-SHA256. Since this is your first package, start simple and iterate based on user feedback![^11][^2][^8][^5][^12][^10][^1]
<span style="display:none">[^18][^19][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^30][^31][^32][^33][^34][^35][^36][^37][^38][^39][^40][^41][^42][^43][^44][^45][^46][^47][^48][^49][^50][^51][^52][^53][^54][^55][^56][^57][^58]</span>

<div align="center">⁂</div>

[^1]: https://liblab.com/blog/typescript-npm-packages-done-right

[^2]: https://dev.to/arshadyaseen/building-a-typescript-library-in-2026-with-bunup-3bmg

[^3]: https://github.com/goldbergyoni/nodebestpractices

[^4]: https://betterstack.com/community/guides/scaling-nodejs/nodejs-typescript/

[^5]: https://dev.to/snyk/best-practices-for-creating-a-modern-npm-package-46g0

[^6]: https://mikbry.com/blog/javascript/npm/best-practices-npm-package

[^7]: https://survivejs.com/books/maintenance/packaging/anatomy/

[^8]: https://www.groff.dev/blog/function-agents

[^9]: https://snyk.io/blog/best-practices-create-modern-npm-package/

[^10]: https://ssojet.com/hashing/hmac-sha256-in-typescript/

[^11]: https://mojoauth.com/hashing/hmac-sha256-in-typescript/

[^12]: https://dev.to/ra1nbow1/how-to-write-the-right-api-client-in-typescript-38g3

[^13]: https://krython.com/tutorial/typescript/websockets-typescript-real-time-communication/

[^14]: https://github.com/t34-dev/ts-ws-client

[^15]: https://blog.stackademic.com/getting-started-with-websockets-in-typescript-c48c5519f7d4

[^16]: https://dev.to/martinpersson/create-and-publish-your-first-npm-package-a-comprehensive-guide-3l0a

[^17]: https://reemus.dev/article/npm-package-best-practices

[^18]: https://www.youtube.com/watch?v=TLDc91vfPGg

[^19]: https://jlarky.vercel.app/posts/how-to-create-npm-package

[^20]: https://bun.com/guides/runtime/typescript

[^21]: https://www.reddit.com/r/typescript/comments/dsidr4/best_practices_for_organizingarchitecting_a_npm/

[^22]: https://www.youtube.com/watch?v=LkHy0YWvpRI

[^23]: https://bun.com

[^24]: https://dev.to/seven/building-an-npm-package-in-2023-10l4

[^25]: https://javascript.plainenglish.io/a-beginners-guide-to-creating-a-typescript-starter-project-6129deeeb973

[^26]: https://github.com/oven-sh/bun/discussions/6034

[^27]: https://spin.atomicobject.com/npm-package-typescript/

[^28]: https://danielmiessler.com/blog/executable-typescript-programs-using-bun

[^29]: https://wiro.ai

[^30]: https://stackoverflow.com/questions/63552858/design-pattern-writing-an-api-wrapper-library-typescript

[^31]: https://wiro.ai/product/status

[^32]: https://buildwithfern.com/post/generate-typescript-sdk

[^33]: https://tr.linkedin.com/company/wiroai

[^34]: https://signalso.com/docs/start-your-first-project

[^35]: https://www.speakeasy.com/docs/languages/typescript/methodology-ts

[^36]: https://blog.logrocket.com/node-js-project-architecture-best-practices/

[^37]: https://developers.hrflow.ai/docs/api-authentication

[^38]: https://neon.com/docs/reference/typescript-sdk

[^39]: https://docs.backend.ai/en/latest/manager/common-api/auth.html

[^40]: https://github.com/hey-api/openapi-ts

[^41]: https://stackoverflow.com/questions/70612534/best-practice-for-structuring-files-within-a-node-js-project

[^42]: https://docs.solo.io/gateway/main/ai/tutorials/auth/

[^43]: https://fastapi.tiangolo.com/advanced/generate-clients/

[^44]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects

[^45]: https://bun.com/guides/http/file-uploads

[^46]: https://mojoauth.com/hashing/hmac-sha1-in-typescript/

[^47]: https://uploadcare.com/blog/how-to-upload-files-using-js/

[^48]: https://ssojet.com/hashing/sha-256-in-typescript/

[^49]: https://www.youtube.com/watch?v=Y_gzsO4U7Dw

[^50]: https://stackoverflow.com/questions/52953317/is-that-possible-to-send-formdata-along-with-image-file-to-web-api-from-angular

[^51]: https://www.w3schools.com/nodejs/ref_hmac.asp

[^52]: https://stackoverflow.com/questions/48554582/writing-websocket-client-with-typescript-running-both-on-browser-and-node-js

[^53]: https://forums.servicestack.net/t/problem-with-uploading-files-from-typescript/11780

[^54]: https://stackoverflow.com/questions/63762091/how-to-generate-hmac-sha-256-sign-in-javascript-for-datatrans

[^55]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications

[^56]: https://github.com/openapi-ts/openapi-typescript/issues/1214

[^57]: https://dev.to/burhanahmeed/the-right-way-to-do-hmac-authentication-in-expressjs-5489

[^58]: https://wasp.sh/blog/2023/08/09/build-real-time-voting-app-websockets-react-typescript

