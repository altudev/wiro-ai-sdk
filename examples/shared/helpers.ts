/**
 * Shared helper functions for Wiro AI SDK examples
 *
 * This module contains common utilities used across multiple example files
 * to reduce code duplication and ensure consistent behavior.
 */

import { WiroClient } from '../../src/index';
import type { Task, TaskStatus } from '../../src/types/index';

/**
 * Configuration for task polling behavior.
 * Can be customized for different use cases.
 */
export interface PollingConfig {
  maxAttempts?: number;  // Default: 60 (~2 minutes with 2s interval)
  intervalMs?: number;   // Default: 2000 (2 seconds between polls)
}

/**
 * Load environment variables from .env file.
 * Works with both Bun and Node.js environments.
 *
 * Bun automatically loads .env files, but for Node.js compatibility,
 * we explicitly load it to support npm/pnpm/yarn users.
 */
export async function loadEnv(): Promise<void> {
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

/**
 * Validate that a string is a valid URL.
 *
 * @param url - The URL to validate
 * @returns true if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
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
 *
 * @example
 * ```ts
 * const client = new WiroClient({ apiKey, apiSecret });
 * const runResult = await client.run('wiro', 'professional-headshot', params);
 *
 * const completedTask = await waitForTaskCompletion(client, runResult.taskid, {
 *   maxAttempts: 60,
 *   intervalMs: 2000
 * });
 * ```
 */
export async function waitForTaskCompletion(
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
