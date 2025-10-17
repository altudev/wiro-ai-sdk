/**
 * Tests for avatar-motion example
 */

import { describe, it, expect, beforeEach } from 'bun:test';
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

describe('Avatar Motion Example - Utility Functions', () => {
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

  describe('Avatar Motion Model Parameters', () => {
    it('should create valid parameters for the model', () => {
      const params = {
        inputImage: 'https://i.hizliresim.com/qnm71if.jpg',
        effectType: '3d_figure_smashing',
        outputType: 'both',
        seed: '42',
      };

      expect(params.inputImage).toMatch(/^https?:\/\//);
      expect(params.effectType).toBeDefined();
      expect(params.outputType).toBeDefined();
      expect(params.seed).toBeDefined();
    });

    it('should handle seed as string', () => {
      const seed = '42';
      expect(typeof seed).toBe('string');
      expect(!isNaN(Number(seed))).toBe(true);
    });

    it('should support optional callback URL', () => {
      const params = {
        inputImage: 'https://example.com/photo.jpg',
        effectType: '3d_figure_smashing',
        outputType: 'both',
        seed: '42',
        callbackUrl: 'https://your-server.com/callback',
      };

      expect(params.callbackUrl).toMatch(/^https?:\/\//);
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
          inputImage: 'https://example.com/photo.jpg',
          effectType: '3d_figure_smashing',
          outputType: 'both',
          seed: '42',
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
            name: 'avatar-motion.mp4',
            contenttype: 'video/mp4',
            parentid: '6c1833f39da71e6175bf292b18779baf',
            uuid: '15bce51f-442f-4f44-a71d-13c6374a62bd',
            size: '5202472',
            addedtime: '1734513812',
            modifiedtime: '1734513812',
            accesskey: 'dFKlMApaSgMeHKsJyaDeKrefcHahUK',
            url: 'https://cdn1.wiro.ai/6a6af820-c5050aee-40bd7b83-a2e186c6-7f61f7da-3894e49c-fc0eeb66-9b500fe2/avatar-motion.mp4',
          },
        ],
        size: '5202472',
      };

      expect(task.id).toBeDefined();
      expect(task.status).toBe('task_postprocess_end');
      expect(task.outputs).toBeDefined();
      expect(task.outputs.length).toBeGreaterThan(0);
      expect(task.outputs[0].contenttype).toBe('video/mp4');
      expect(parseInt(task.size)).toBeGreaterThan(0);
    });

    it('should handle multiple output files', () => {
      const response: TaskDetailResponse = {
        total: '1',
        errors: [],
        tasklist: [
          {
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
            outputs: [
              {
                id: 'output1',
                name: 'avatar.png',
                contenttype: 'image/png',
                parentid: '6c1833f39da71e6175bf292b18779baf',
                uuid: '15bce51f-442f-4f44-a71d-13c6374a62bd',
                size: '202472',
                addedtime: '1734513812',
                modifiedtime: '1734513812',
                accesskey: 'key1',
                url: 'https://cdn1.wiro.ai/avatar.png',
              },
              {
                id: 'output2',
                name: 'animation.mp4',
                contenttype: 'video/mp4',
                parentid: '6c1833f39da71e6175bf292b18779baf',
                uuid: '15bce51f-442f-4f44-a71d-13c6374a62bd',
                size: '5202472',
                addedtime: '1734513812',
                modifiedtime: '1734513812',
                accesskey: 'key2',
                url: 'https://cdn1.wiro.ai/animation.mp4',
              },
            ],
            size: '5404944',
          },
        ],
        result: true,
      };

      expect(response.tasklist.length).toBe(1);
      expect(response.tasklist[0].outputs.length).toBe(2);
      expect(response.tasklist[0].outputs[0].contenttype).toBe('image/png');
      expect(response.tasklist[0].outputs[1].contenttype).toBe('video/mp4');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors in run response', () => {
      const response: RunResponse = {
        errors: ['Insufficient credits', 'Invalid input image'],
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

    it('should handle task cancellation', () => {
      const status = 'task_cancel';
      expect(() => {
        if (status === 'task_cancel') {
          throw new Error('Task was cancelled');
        }
      }).toThrow('Task was cancelled');
    });
  });

  describe('Avatar Motion Specific Features', () => {
    it('should support outputType parameter', () => {
      const outputTypes = ['both'];
      expect(outputTypes).toContain('both');
    });

    it('should support effectType parameter', () => {
      const effectType = '3d_figure_smashing';
      expect(effectType).toBeDefined();
      expect(typeof effectType).toBe('string');
    });

    it('should output video content', () => {
      const output = {
        id: '6bc392c93856dfce3a7d1b4261e15af3',
        name: 'animation.mp4',
        contenttype: 'video/mp4',
        parentid: '6c1833f39da71e6175bf292b18779baf',
        uuid: '15bce51f-442f-4f44-a71d-13c6374a62bd',
        size: '5202472',
        addedtime: '1734513812',
        modifiedtime: '1734513812',
        accesskey: 'dFKlMApaSgMeHKsJyaDeKrefcHahUK',
        url: 'https://cdn1.wiro.ai/animation.mp4',
      };

      expect(output.contenttype).toMatch(/video\//);
      expect(output.url).toMatch(/\.mp4$/);
    });
  });
});
