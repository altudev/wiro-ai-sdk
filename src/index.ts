// Main exports
export { WiroClient } from './client.ts';
export { generateAuthHeaders } from './auth.ts';

// Type exports
export type {
  WiroClientOptions,
  WiroFileParam,
  RunResponse,
  TaskOutput,
  Task,
  TaskStatus,
  TaskDetailResponse,
  KillTaskResponse,
  CancelTaskResponse,
  TaskDetailRequest,
  KillTaskRequest,
  CancelTaskRequest,
} from './types/index.ts';

export type { WiroAuthHeaders } from './auth.ts';

// Default export
export { WiroClient as default } from './client.ts';