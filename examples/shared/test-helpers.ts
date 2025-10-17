/**
 * Shared test utilities for Wiro AI SDK example tests
 *
 * This module contains common test fixtures and utilities used across
 * multiple test files to reduce duplication and ensure consistency.
 */

import type { Task, RunResponse, TaskDetailResponse } from '../../src/types/index';

/**
 * Common test fixtures for API responses
 */
export const testFixtures = {
  /**
   * Sample successful RunResponse
   */
  runResponse: {
    errors: [],
    taskid: '2221',
    socketaccesstoken: 'eDcCm5yyUfIvMFspTwww49OUfgXkQt',
    result: true,
  } as RunResponse,

  /**
   * Sample error RunResponse
   */
  errorRunResponse: {
    errors: ['Invalid parameters'],
    taskid: undefined,
    result: false,
  } as RunResponse,

  /**
   * Sample completed Task
   */
  completedTask: {
    id: '2221',
    uuid: '15bce51f-442f-4f44-a71d-13c6374a62bd',
    socketaccesstoken: 'eDcCm5yyUfIvMFspTwww49OUfgXkQt',
    parameters: {},
    debugoutput: '',
    debugerror: '',
    starttime: '1734513809',
    endtime: '1734513813',
    elapsedseconds: '6.0000',
    status: 'task_postprocess_end',
    createtime: '1734513807',
    canceltime: '0',
    assigntime: '1734513807',
    accepttime: '1734513807',
    preprocessstarttime: '1734513807',
    preprocessendtime: '1734513807',
    postprocessstarttime: '1734513813',
    postprocessendtime: '1734513814',
    outputs: [],
    size: '202472',
  } as Task,

  /**
   * Sample empty TaskDetailResponse
   */
  emptyTaskDetail: {
    total: '0',
    errors: [],
    tasklist: [],
    result: true,
  } as TaskDetailResponse,
};

/**
 * Common test data for URL validation
 */
export const urlTestCases = {
  valid: [
    'https://example.com/image.jpg',
    'http://example.com/image.jpg',
    'https://example.com/image.jpg?size=large',
  ],
  invalid: [
    'not-a-url',
    'example.com/image.jpg',
    '',
  ],
};

/**
 * Common test data for WiroClient initialization
 */
export const clientTestCases = {
  validConfig: {
    apiKey: 'test-key-123',
    apiSecret: 'test-secret-456',
  },
  validConfigWithBaseUrl: {
    apiKey: 'test-key-123',
    apiSecret: 'test-secret-456',
    baseUrl: 'https://api.example.com/v1',
  },
  invalidConfigs: [
    { apiKey: '', apiSecret: 'test-secret', error: 'WiroClient requires an apiKey' },
    { apiKey: 'test-key', apiSecret: '', error: 'WiroClient requires an apiSecret' },
    { apiKey: 'test-key', apiSecret: 'test-secret', baseUrl: 'invalid-url', error: 'Invalid baseUrl: must start with http:// or https://' },
  ],
};

/**
 * Common task status values for testing
 */
export const taskStatuses = {
  terminal: ['task_postprocess_end', 'task_cancel'],
  running: [
    'task_queue',
    'task_accept',
    'task_assign',
    'task_preprocess_start',
    'task_preprocess_end',
    'task_start',
    'task_output',
    'task_postprocess_start',
  ],
};

/**
 * Helper function to validate polling timeout calculations
 */
export function calculateTimeout(maxAttempts: number, intervalMs: number): number {
  return (maxAttempts * intervalMs) / 1000;
}

/**
 * Helper function to check if a status is terminal
 */
export function isTerminalStatus(status: string): boolean {
  return taskStatuses.terminal.includes(status);
}

/**
 * Helper function to check if a status is running
 */
export function isRunningStatus(status: string): boolean {
  return taskStatuses.running.includes(status);
}
