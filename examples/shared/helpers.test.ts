/**
 * Unit tests for shared helper utilities
 */

import { describe, it, expect, mock } from 'bun:test';
import { isValidUrl, waitForTaskCompletion, type PollingConfig } from './helpers';
import { WiroClient } from '../../src/index';
import type { TaskDetailResponse, Task } from '../../src/types/index';

describe('Shared Helpers - isValidUrl', () => {
  it('should validate HTTPS URLs', () => {
    expect(isValidUrl('https://example.com/image.jpg')).toBe(true);
    expect(isValidUrl('https://cdn.wiro.ai/image.png')).toBe(true);
  });

  it('should validate HTTP URLs', () => {
    expect(isValidUrl('http://example.com/image.jpg')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('just-text')).toBe(false);
  });

  it('should reject URLs without protocol', () => {
    expect(isValidUrl('example.com/image.jpg')).toBe(false);
    expect(isValidUrl('www.example.com')).toBe(false);
  });

  it('should handle URLs with query parameters', () => {
    expect(isValidUrl('https://example.com/image.jpg?size=large')).toBe(true);
    expect(isValidUrl('https://example.com/image.jpg?size=large&format=png')).toBe(true);
  });

  it('should handle URLs with fragments', () => {
    expect(isValidUrl('https://example.com/page#section')).toBe(true);
  });

  it('should handle URLs with ports', () => {
    expect(isValidUrl('https://example.com:8080/image.jpg')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('should handle file:// protocol', () => {
    expect(isValidUrl('file:///path/to/file.jpg')).toBe(true);
  });
});

describe('Shared Helpers - waitForTaskCompletion', () => {
  it('should return completed task immediately when status is task_postprocess_end', async () => {
    const mockClient = {
      getTaskDetail: mock(() =>
        Promise.resolve({
          tasklist: [
            {
              id: '123',
              status: 'task_postprocess_end',
              outputs: [],
            } as Task,
          ],
        } as TaskDetailResponse)
      ),
    } as unknown as WiroClient;

    const result = await waitForTaskCompletion(mockClient, '123', {
      maxAttempts: 10,
      intervalMs: 100,
    });

    expect(result.status).toBe('task_postprocess_end');
    expect(mockClient.getTaskDetail).toHaveBeenCalledTimes(1);
  });

  it('should throw error when task is cancelled', async () => {
    const mockClient = {
      getTaskDetail: mock(() =>
        Promise.resolve({
          tasklist: [
            {
              id: '123',
              status: 'task_cancel',
              outputs: [],
            } as Task,
          ],
        } as TaskDetailResponse)
      ),
    } as unknown as WiroClient;

    await expect(
      waitForTaskCompletion(mockClient, '123', {
        maxAttempts: 10,
        intervalMs: 100,
      })
    ).rejects.toThrow('Task was cancelled');
  });

  it('should throw error when tasklist is empty', async () => {
    const mockClient = {
      getTaskDetail: mock(() =>
        Promise.resolve({
          tasklist: [],
        } as TaskDetailResponse)
      ),
    } as unknown as WiroClient;

    await expect(
      waitForTaskCompletion(mockClient, '123', {
        maxAttempts: 10,
        intervalMs: 100,
      })
    ).rejects.toThrow('Task not found in response');
  });

  it('should poll multiple times until completion', async () => {
    let callCount = 0;
    const mockClient = {
      getTaskDetail: mock(() => {
        callCount++;
        return Promise.resolve({
          tasklist: [
            {
              id: '123',
              status: callCount < 3 ? 'task_start' : 'task_postprocess_end',
              outputs: [],
            } as Task,
          ],
        } as TaskDetailResponse);
      }),
    } as unknown as WiroClient;

    const result = await waitForTaskCompletion(mockClient, '123', {
      maxAttempts: 10,
      intervalMs: 50,
    });

    expect(result.status).toBe('task_postprocess_end');
    expect(mockClient.getTaskDetail).toHaveBeenCalledTimes(3);
  });

  it('should throw timeout error when max attempts reached', async () => {
    const mockClient = {
      getTaskDetail: mock(() =>
        Promise.resolve({
          tasklist: [
            {
              id: '123',
              status: 'task_start',
              outputs: [],
            } as Task,
          ],
        } as TaskDetailResponse)
      ),
    } as unknown as WiroClient;

    await expect(
      waitForTaskCompletion(mockClient, '123', {
        maxAttempts: 3,
        intervalMs: 50,
      })
    ).rejects.toThrow('Task did not complete within');
  });

  it('should use default config values when not provided', async () => {
    const mockClient = {
      getTaskDetail: mock(() =>
        Promise.resolve({
          tasklist: [
            {
              id: '123',
              status: 'task_postprocess_end',
              outputs: [],
            } as Task,
          ],
        } as TaskDetailResponse)
      ),
    } as unknown as WiroClient;

    const result = await waitForTaskCompletion(mockClient, '123');
    expect(result.status).toBe('task_postprocess_end');
  });

  it('should handle all running task statuses', async () => {
    const statuses = [
      'task_queue',
      'task_accept',
      'task_assign',
      'task_preprocess_start',
      'task_preprocess_end',
      'task_start',
      'task_output',
      'task_postprocess_start',
      'task_postprocess_end',
    ];

    let statusIndex = 0;
    const mockClient = {
      getTaskDetail: mock(() => {
        const status = statuses[statusIndex];
        statusIndex++;
        return Promise.resolve({
          tasklist: [
            {
              id: '123',
              status,
              outputs: [],
            } as Task,
          ],
        } as TaskDetailResponse);
      }),
    } as unknown as WiroClient;

    const result = await waitForTaskCompletion(mockClient, '123', {
      maxAttempts: 20,
      intervalMs: 10,
    });

    expect(result.status).toBe('task_postprocess_end');
    expect(mockClient.getTaskDetail).toHaveBeenCalledTimes(statuses.length);
  });
});

describe('Shared Helpers - PollingConfig', () => {
  it('should accept valid polling config', () => {
    const config: PollingConfig = {
      maxAttempts: 30,
      intervalMs: 1000,
    };
    expect(config.maxAttempts).toBe(30);
    expect(config.intervalMs).toBe(1000);
  });

  it('should allow partial config', () => {
    const config1: PollingConfig = {
      maxAttempts: 30,
    };
    expect(config1.maxAttempts).toBe(30);

    const config2: PollingConfig = {
      intervalMs: 1000,
    };
    expect(config2.intervalMs).toBe(1000);
  });

  it('should allow empty config', () => {
    const config: PollingConfig = {};
    expect(config).toBeDefined();
  });
});
