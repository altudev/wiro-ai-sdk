import axios, { AxiosInstance, AxiosResponse } from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import fs from 'fs';

/**
 * Options used to configure the WiroClient. Only the API key and secret are required.
 */
export interface WiroClientOptions {
  /**
   * Your Wiro project API key. Obtain this value from the Wiro dashboard after creating a project.
   */
  apiKey: string;
  /**
   * Your Wiro project API secret. Obtain this value from the Wiro dashboard after creating a project.
   */
  apiSecret: string;
  /**
   * Base URL for the Wiro REST API. Defaults to `https://api.wiro.ai/v1`.
   */
  baseUrl?: string;
}

/**
 * Possible shape of a file attached to a run call. The field name should correspond
 * to the expected parameter name (e.g. `inputImage`). The file can be specified as
 * an absolute path, Buffer or a readable stream. When using a path, a ReadStream
 * will be created internally.
 */
export interface WiroFileParam {
  /**
   * Parameter name for the file. For example `inputImage`.
   */
  name: string;
  /**
   * The file contents or path to the file on disk. If a string is provided the file
   * will be read from the filesystem; otherwise Buffers and streams are passed through.
   */
  file: string | Buffer | fs.ReadStream;
  /**
   * Optional filename to send. If omitted and `file` is a string, the basename of the
   * path will be used. If `file` is a Buffer or ReadStream, a generic name will be
   * generated.
   */
  filename?: string;
}

/**
 * API response for starting a run. Contains the task ID/token and a boolean result flag.
 */
export interface RunResponse {
  errors: any[];
  taskid?: string;
  tasktoken?: string;
  socketaccesstoken?: string;
  result: boolean;
}

/**
 * API response returned from Task/Detail endpoint. The generic parameter T can be used to
 * describe the shape of the `tasklist` items. When `taskid` or `tasktoken` is provided the
 * API returns a list with a single task.
 */
export interface TaskDetailResponse<T = any> {
  total: string;
  errors: any[];
  tasklist: T[];
  result: boolean;
}

/**
 * API response returned from Task/Kill endpoint. Contains a result flag.
 */
export interface KillTaskResponse {
  errors: any[];
  result: boolean;
}

/**
 * Client library for interacting with the Wiro AI API.
 *
 * Example usage:
 *
 * ```ts
 * import { WiroClient } from 'wiro-ai-client';
 *
 * const client = new WiroClient({ apiKey: 'your_key', apiSecret: 'your_secret' });
 * const runResult = await client.run('wiro', 'polaroid-effect', {
 *   effectType: 'polaroid_smile',
 *   seed: 42,
 *   callbackUrl: 'https://example.com/callback'
 * }, [
 *   { name: 'inputImage', file: '/path/to/my.jpg' }
 * ]);
 *
 * const taskId = runResult.taskid!;
 * const detail = await client.getTaskDetail({ taskid: taskId });
 * ```
 */
export class WiroClient {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private readonly axios: AxiosInstance;

  constructor(options: WiroClientOptions) {
    const { apiKey, apiSecret, baseUrl = 'https://api.wiro.ai/v1' } = options;
    if (!apiKey) {
      throw new Error('WiroClient requires an apiKey');
    }
    if (!apiSecret) {
      throw new Error('WiroClient requires an apiSecret');
    }
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.axios = axios.create({ baseURL: this.baseUrl });
  }

  /**
   * Generate a UNIX timestamp-based nonce. Wiro uses the plain numeric value rather than
   * a UUID. This helper returns `Date.now()` by default but can be overridden.
   */
  protected generateNonce(): number {
    return Date.now();
  }

  /**
   * Compute the HMAC-SHA256 signature used to authenticate requests. According to the
   * official samples, the secret and nonce are concatenated and hashed with the API key
   * as the HMAC key. See the Node.js example for details【530686015421432†screenshot】.
   *
   * @param nonce A UNIX timestamp or random integer. If omitted a timestamp will be generated.
   * @returns Hex encoded signature string
   */
  protected generateSignature(nonce: number): string {
    const hmac = crypto.createHmac('sha256', this.apiKey);
    hmac.update(this.apiSecret + String(nonce));
    return hmac.digest('hex');
  }

  /**
   * Create the common headers required by Wiro API calls. Includes the API key, nonce,
   * and signature fields. Optionally accepts additional headers which will be merged.
   */
  protected createHeaders(nonce: number, signature: string, extra?: Record<string, string>): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'x-nonce': String(nonce),
      'x-signature': signature,
      ...extra,
    };
  }

  /**
   * Run a Wiro model. You must provide the owner (e.g. "wiro") and model slug
   * (e.g. "polaroid-effect"). Parameters specific to the model can be passed as
   * an object. Files can optionally be attached; supply them via the `files` array.
   *
   * @param owner The toolSlugOwner portion of the endpoint
   * @param model The toolSlugProject or model slug portion of the endpoint
   * @param params Object representing JSON parameters accepted by the model
   * @param files Optional array of file parameters. Each file will be appended to a
   *              multipart form under its `name` property.
   */
  async run<T = any>(owner: string, model: string, params: Record<string, any>, files?: WiroFileParam[]): Promise<RunResponse & { data?: T }> {
    const nonce = this.generateNonce();
    const signature = this.generateSignature(nonce);

    let body: any;
    let headers: Record<string, string>;

    // When files are present, construct a FormData body. Otherwise send JSON.
    if (files && files.length > 0) {
      const form = new FormData();
      // Append provided parameters to the form. If arrays are passed they will be
      // appended once per element (FormData supports duplicate keys).
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value === undefined || value === null) continue;
          if (Array.isArray(value)) {
            value.forEach(v => form.append(key, String(v)));
          } else {
            form.append(key, String(value));
          }
        }
      }
      // Append files to the form
      for (const fileParam of files) {
        let data: any = fileParam.file;
        let filename = fileParam.filename;
        // If the file is a string treat it as a path on disk
        if (typeof data === 'string') {
          // Create a read stream and derive filename from path if not provided
          data = fs.createReadStream(data);
          if (!filename) {
            filename = data.path ? String(data.path).split(/[/\\]/).pop() : fileParam.name;
          }
        } else if (!filename) {
          // If file is buffer or stream assign a default filename
          filename = `${fileParam.name}.bin`;
        }
        form.append(fileParam.name, data, filename);
      }
      body = form;
      headers = this.createHeaders(nonce, signature, form.getHeaders());
    } else {
      // When no files are provided, send the parameters as JSON. According to the
      // official examples the Content-Type is "multipart/form-data" even when
      // sending JSON【530686015421432†screenshot】, however sending JSON with application/json works as well.
      body = params;
      headers = this.createHeaders(nonce, signature, { 'Content-Type': 'application/json' });
    }
    const url = `/Run/${owner}/${model}`;
    const response: AxiosResponse<RunResponse & { data?: T }> = await this.axios.post(url, body, { headers });
    return response.data;
  }

  /**
   * Retrieve details about one or more tasks. You can supply either a task ID or a
   * socket access token. At least one of these properties must be provided.
   *
   * @param detail An object containing either a `taskid` or `tasktoken` field.
   */
  async getTaskDetail<T = any>(detail: { taskid?: string; tasktoken?: string }): Promise<TaskDetailResponse<T>> {
    if (!detail.taskid && !detail.tasktoken) {
      throw new Error('getTaskDetail requires either a taskid or a tasktoken');
    }
    const nonce = this.generateNonce();
    const signature = this.generateSignature(nonce);
    const headers = this.createHeaders(nonce, signature, { 'Content-Type': 'application/json' });
    const response: AxiosResponse<TaskDetailResponse<T>> = await this.axios.post('/Task/Detail', detail, { headers });
    return response.data;
  }

  /**
   * Kill a running task. Provide either the task ID or the socket access token.
   *
   * @param taskInfo An object containing either `taskid` or `tasktoken`.
   */
  async killTask(taskInfo: { taskid?: string; tasktoken?: string }): Promise<KillTaskResponse> {
    if (!taskInfo.taskid && !taskInfo.tasktoken) {
      throw new Error('killTask requires either a taskid or a tasktoken');
    }
    const nonce = this.generateNonce();
    const signature = this.generateSignature(nonce);
    const headers = this.createHeaders(nonce, signature, { 'Content-Type': 'application/json' });
    const response: AxiosResponse<KillTaskResponse> = await this.axios.post('/Task/Kill', taskInfo, { headers });
    return response.data;
  }
}