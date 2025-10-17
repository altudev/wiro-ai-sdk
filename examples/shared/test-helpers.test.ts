/**
 * Unit tests for shared test helper utilities
 */

import { describe, it, expect } from 'bun:test';
import {
  testFixtures,
  urlTestCases,
  clientTestCases,
  taskStatuses,
  calculateTimeout,
  isTerminalStatus,
  isRunningStatus,
} from './test-helpers';

describe('Test Helpers - testFixtures', () => {
  it('should have valid runResponse fixture', () => {
    expect(testFixtures.runResponse).toBeDefined();
    expect(testFixtures.runResponse.result).toBe(true);
    expect(testFixtures.runResponse.taskid).toBeDefined();
    expect(testFixtures.runResponse.errors).toEqual([]);
  });

  it('should have valid errorRunResponse fixture', () => {
    expect(testFixtures.errorRunResponse).toBeDefined();
    expect(testFixtures.errorRunResponse.result).toBe(false);
    expect(testFixtures.errorRunResponse.errors.length).toBeGreaterThan(0);
  });

  it('should have valid completedTask fixture', () => {
    expect(testFixtures.completedTask).toBeDefined();
    expect(testFixtures.completedTask.status).toBe('task_postprocess_end');
    expect(testFixtures.completedTask.id).toBeDefined();
  });

  it('should have valid emptyTaskDetail fixture', () => {
    expect(testFixtures.emptyTaskDetail).toBeDefined();
    expect(testFixtures.emptyTaskDetail.tasklist).toEqual([]);
    expect(testFixtures.emptyTaskDetail.result).toBe(true);
  });
});

describe('Test Helpers - urlTestCases', () => {
  it('should have valid URLs', () => {
    expect(urlTestCases.valid).toBeDefined();
    expect(urlTestCases.valid.length).toBeGreaterThan(0);
    urlTestCases.valid.forEach((url) => {
      expect(typeof url).toBe('string');
      expect(url).toMatch(/^https?:\/\//);
    });
  });

  it('should have invalid URLs', () => {
    expect(urlTestCases.invalid).toBeDefined();
    expect(urlTestCases.invalid.length).toBeGreaterThan(0);
    urlTestCases.invalid.forEach((url) => {
      expect(typeof url).toBe('string');
    });
  });
});

describe('Test Helpers - clientTestCases', () => {
  it('should have valid config', () => {
    expect(clientTestCases.validConfig).toBeDefined();
    expect(clientTestCases.validConfig.apiKey).toBeDefined();
    expect(clientTestCases.validConfig.apiSecret).toBeDefined();
  });

  it('should have valid config with baseUrl', () => {
    expect(clientTestCases.validConfigWithBaseUrl).toBeDefined();
    expect(clientTestCases.validConfigWithBaseUrl.apiKey).toBeDefined();
    expect(clientTestCases.validConfigWithBaseUrl.apiSecret).toBeDefined();
    expect(clientTestCases.validConfigWithBaseUrl.baseUrl).toMatch(/^https?:\/\//);
  });

  it('should have invalid configs with error messages', () => {
    expect(clientTestCases.invalidConfigs).toBeDefined();
    expect(clientTestCases.invalidConfigs.length).toBeGreaterThan(0);
    clientTestCases.invalidConfigs.forEach((config) => {
      expect(config.error).toBeDefined();
      expect(typeof config.error).toBe('string');
    });
  });
});

describe('Test Helpers - taskStatuses', () => {
  it('should have terminal statuses', () => {
    expect(taskStatuses.terminal).toBeDefined();
    expect(taskStatuses.terminal).toContain('task_postprocess_end');
    expect(taskStatuses.terminal).toContain('task_cancel');
    expect(taskStatuses.terminal.length).toBe(2);
  });

  it('should have running statuses', () => {
    expect(taskStatuses.running).toBeDefined();
    expect(taskStatuses.running.length).toBeGreaterThan(0);
    expect(taskStatuses.running).toContain('task_queue');
    expect(taskStatuses.running).toContain('task_start');
  });

  it('should not have overlap between terminal and running statuses', () => {
    const overlap = taskStatuses.terminal.filter((status) =>
      taskStatuses.running.includes(status)
    );
    expect(overlap.length).toBe(0);
  });
});

describe('Test Helpers - calculateTimeout', () => {
  it('should calculate timeout correctly', () => {
    expect(calculateTimeout(60, 2000)).toBe(120);
    expect(calculateTimeout(30, 1000)).toBe(30);
    expect(calculateTimeout(10, 500)).toBe(5);
  });

  it('should handle edge cases', () => {
    expect(calculateTimeout(0, 2000)).toBe(0);
    expect(calculateTimeout(60, 0)).toBe(0);
    expect(calculateTimeout(1, 1000)).toBe(1);
  });

  it('should handle fractional results', () => {
    expect(calculateTimeout(5, 333)).toBe(1.665);
    expect(calculateTimeout(3, 1500)).toBe(4.5);
  });
});

describe('Test Helpers - isTerminalStatus', () => {
  it('should identify terminal statuses', () => {
    expect(isTerminalStatus('task_postprocess_end')).toBe(true);
    expect(isTerminalStatus('task_cancel')).toBe(true);
  });

  it('should reject running statuses', () => {
    expect(isTerminalStatus('task_queue')).toBe(false);
    expect(isTerminalStatus('task_start')).toBe(false);
    expect(isTerminalStatus('task_accept')).toBe(false);
  });

  it('should reject invalid statuses', () => {
    expect(isTerminalStatus('invalid_status')).toBe(false);
    expect(isTerminalStatus('')).toBe(false);
  });
});

describe('Test Helpers - isRunningStatus', () => {
  it('should identify running statuses', () => {
    expect(isRunningStatus('task_queue')).toBe(true);
    expect(isRunningStatus('task_accept')).toBe(true);
    expect(isRunningStatus('task_start')).toBe(true);
    expect(isRunningStatus('task_output')).toBe(true);
  });

  it('should reject terminal statuses', () => {
    expect(isRunningStatus('task_postprocess_end')).toBe(false);
    expect(isRunningStatus('task_cancel')).toBe(false);
  });

  it('should reject invalid statuses', () => {
    expect(isRunningStatus('invalid_status')).toBe(false);
    expect(isRunningStatus('')).toBe(false);
  });
});

describe('Test Helpers - status consistency', () => {
  it('should cover all known task statuses', () => {
    const allStatuses = [...taskStatuses.terminal, ...taskStatuses.running];

    // Should have exactly 10 unique statuses (2 terminal + 8 running)
    expect(new Set(allStatuses).size).toBe(10);
  });

  it('should have consistent status helpers', () => {
    // Every terminal status should pass isTerminalStatus
    taskStatuses.terminal.forEach((status) => {
      expect(isTerminalStatus(status)).toBe(true);
      expect(isRunningStatus(status)).toBe(false);
    });

    // Every running status should pass isRunningStatus
    taskStatuses.running.forEach((status) => {
      expect(isRunningStatus(status)).toBe(true);
      expect(isTerminalStatus(status)).toBe(false);
    });
  });
});
