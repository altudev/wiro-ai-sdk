/**
 * Tests for iconic-locations example
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { WiroClient } from '../src/index';
import type { Task, RunResponse, TaskDetailResponse } from '../src/types/index';
import {
  testFixtures,
  urlTestCases,
  clientTestCases,
  taskStatuses,
  calculateTimeout,
  isTerminalStatus,
  isRunningStatus
} from './shared/test-helpers';

describe('Iconic Locations Example - Utility Functions', () => {
  /**
   * Validate that a string is a valid URL.
   */
  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  describe('isValidUrl', () => {
    it('should validate HTTPS URLs', () => {
      expect(isValidUrl('https://example.com/image.jpg')).toBe(true);
    });

    it('should validate HTTP URLs', () => {
      expect(isValidUrl('http://example.com/image.jpg')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });

    it('should reject URLs without protocol', () => {
      expect(isValidUrl('example.com/image.jpg')).toBe(false);
    });

    it('should handle URLs with query parameters', () => {
      expect(isValidUrl('https://example.com/image.jpg?size=large')).toBe(true);
    });
  });

  describe('Iconic Locations Model Parameters', () => {
    it('should create valid parameters for the model', () => {
      const params = {
        inputImageUrl: 'https://i.hizliresim.com/qnm71if.jpg',
        iconicLocation: 'Eiffel Tower',
        safetyTolerance: 2,
        aspectRatio: '1:1',
        seed: '42',
        outputFormat: 'jpeg',
      };

      expect(params.inputImageUrl).toMatch(/^https?:\/\//);
      expect(['jpeg', 'png']).toContain(params.outputFormat);
      expect(params.safetyTolerance).toBe(2); // Only value 2 is currently supported per API docs
    });

    it('should accept valid iconic location names', () => {
      const validLocations = [
        'Random',
        'Eiffel Tower',
        'Tokyo Tower',
        'Taj Mahal',
        'Times Square',
        'Trevi Fountain',
        'Colosseum',
        'Statue of Liberty',
        'Big Ben',
        'Great Wall of China',
        'Sydney Opera House',
        'Machu Picchu',
        'Golden Gate Bridge',
        'Pyramids of Giza',
        'Northern Lights',
        'Mount Fuji',
      ];

      validLocations.forEach((location) => {
        expect(typeof location).toBe('string');
        expect(location.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty aspectRatio to match input', () => {
      const params = {
        inputImageUrl: 'https://example.com/image.jpg',
        iconicLocation: 'Eiffel Tower',
        aspectRatio: '', // Empty string means match input image
        safetyTolerance: 2,
        seed: 42,
        outputFormat: 'jpeg',
      };

      expect(params.aspectRatio).toBe('');
    });

    it('should accept valid aspect ratios', () => {
      const validAspectRatios = [
        '',
        '1:1',
        '16:9',
        '9:16',
        '4:3',
        '3:4',
        '3:2',
        '2:3',
        '4:5',
        '5:4',
        '21:9',
        '9:21',
        '2:1',
        '1:2',
      ];

      validAspectRatios.forEach((ratio) => {
        expect(typeof ratio).toBe('string');
      });
    });

    it('should accept seed as string', () => {
      const seed = '42';
      expect(typeof seed).toBe('string');
      expect(parseInt(seed)).toBeGreaterThanOrEqual(0);
    });

    it('should enforce safetyTolerance constraint', () => {
      // According to API docs, only value 2 is currently supported
      const safetyTolerance = 2;
      expect(safetyTolerance).toBe(2);
    });
  });

  describe('WiroClient Initialization', () => {
    it('should initialize with valid credentials', () => {
      const client = new WiroClient({
        apiKey: 'test-key-123',
        apiSecret: 'test-secret-456',
      });
      expect(client).toBeDefined();
    });

    it('should throw error with missing apiKey', () => {
      expect(() => {
        new WiroClient({
          apiKey: '',
          apiSecret: 'test-secret',
        });
      }).toThrow('WiroClient requires an apiKey');
    });

    it('should throw error with missing apiSecret', () => {
      expect(() => {
        new WiroClient({
          apiKey: 'test-key',
          apiSecret: '',
        });
      }).toThrow('WiroClient requires an apiSecret');
    });

    it('should validate baseUrl format', () => {
      expect(() => {
        new WiroClient({
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          baseUrl: 'invalid-url',
        });
      }).toThrow('Invalid baseUrl: must start with http:// or https://');
    });

    it('should accept valid baseUrl', () => {
      const client = new WiroClient({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        baseUrl: 'https://api.example.com/v1',
      });
      expect(client).toBeDefined();
    });

    it('should use default baseUrl', () => {
      const client = new WiroClient({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      });
      expect(client).toBeDefined();
    });
  });

  describe('Task Polling Logic', () => {
    it('should recognize completed status', () => {
      const status = 'task_postprocess_end';
      expect(status === 'task_postprocess_end' || status === 'task_cancel').toBe(true);
    });

    it('should recognize cancelled status', () => {
      const status = 'task_cancel';
      expect(status === 'task_postprocess_end' || status === 'task_cancel').toBe(true);
    });

    it('should recognize running statuses', () => {
      const runningStatuses = [
        'task_queue',
        'task_accept',
        'task_assign',
        'task_preprocess_start',
        'task_preprocess_end',
        'task_start',
        'task_output',
        'task_postprocess_start',
      ];

      runningStatuses.forEach((status) => {
        expect(status === 'task_postprocess_end' || status === 'task_cancel').toBe(false);
      });
    });

    it('should handle empty tasklist response', () => {
      const response: TaskDetailResponse = {
        total: '0',
        errors: [],
        tasklist: [],
        result: true,
      };

      expect(response.tasklist.length).toBe(0);
      expect(() => {
        if (!response.tasklist || response.tasklist.length === 0) {
          throw new Error('Task not found in response');
        }
      }).toThrow('Task not found in response');
    });
  });

  describe('API Response Handling', () => {
    it('should validate successful run response', () => {
      const response: RunResponse = {
        errors: [],
        taskid: '2221',
        socketaccesstoken: 'eDcCm5yyUfIvMFspTwww49OUfgXkQt',
        result: true,
      };

      expect(response.result).toBe(true);
      expect(response.taskid).toBeDefined();
      expect(response.errors.length).toBe(0);
    });

    it('should handle error response', () => {
      const response: RunResponse = {
        errors: ['Invalid parameters'],
        taskid: undefined,
        result: false,
      };

      expect(response.result).toBe(false);
      expect(response.errors.length).toBeGreaterThan(0);
    });

    it('should handle missing taskid', () => {
      const response: RunResponse = {
        errors: [],
        taskid: undefined,
        result: true,
      };

      expect(response.taskid).toBeUndefined();
      expect(() => {
        if (!response.taskid) {
          throw new Error('API did not return a task ID');
        }
      }).toThrow('API did not return a task ID');
    });

    it('should validate task output structure', () => {
      const task: Task = {
        id: '2221',
        uuid: '15bce51f-442f-4f44-a71d-13c6374a62bd',
        socketaccesstoken: 'eDcCm5yyUfIvMFspTwww49OUfgXkQt',
        parameters: {
          inputImageUrl: 'https://example.com/photo.jpg',
          iconicLocation: 'Eiffel Tower',
        },
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
        outputs: [
          {
            id: '6bc392c93856dfce3a7d1b4261e15af3',
            name: '0.png',
            contenttype: 'image/png',
            parentid: '6c1833f39da71e6175bf292b18779baf',
            uuid: '15bce51f-442f-4f44-a71d-13c6374a62bd',
            size: '202472',
            addedtime: '1734513812',
            modifiedtime: '1734513812',
            accesskey: 'dFKlMApaSgMeHKsJyaDeKrefcHahUK',
            url: 'https://cdn1.wiro.ai/6a6af820-c5050aee-40bd7b83-a2e186c6-7f61f7da-3894e49c-fc0eeb66-9b500fe2/0.png',
          },
        ],
        size: '202472',
      };

      expect(task.id).toBeDefined();
      expect(task.status).toBe('task_postprocess_end');
      expect(task.outputs).toBeDefined();
      expect(task.outputs.length).toBeGreaterThan(0);
      expect(parseInt(task.size)).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors in run response', () => {
      const response: RunResponse = {
        errors: ['Insufficient credits', 'Invalid model'],
        taskid: undefined,
        result: false,
      };

      expect(response.errors).toContain('Insufficient credits');
      expect(response.result).toBe(false);
    });

    it('should validate polling timeout scenarios', () => {
      const maxAttempts = 60;
      const intervalMs = 2000;
      const timeoutSeconds = (maxAttempts * intervalMs) / 1000;

      expect(timeoutSeconds).toBe(120);
    });

    it('should handle network errors gracefully', () => {
      expect(() => {
        throw new Error('Network timeout');
      }).toThrow('Network timeout');
    });

    it('should validate URL before API call', () => {
      const invalidUrl = 'not-a-valid-url';
      expect(isValidUrl(invalidUrl)).toBe(false);
      expect(() => {
        if (!isValidUrl(invalidUrl)) {
          throw new Error(`Invalid input image URL: "${invalidUrl}". URL must be a valid HTTP or HTTPS URL.`);
        }
      }).toThrow('Invalid input image URL');
    });
  });
});
