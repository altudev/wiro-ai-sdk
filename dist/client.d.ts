import type { WiroClientOptions, WiroFileParam, RunResponse, TaskDetailResponse, TaskDetailRequest, KillTaskResponse, KillTaskRequest, CancelTaskResponse } from './types/index.ts';
/**
 * Client library for interacting with the Wiro AI API.
 *
 * This client provides methods to run AI models, check task status, and manage tasks.
 * It uses Bun's native fetch API for HTTP requests and supports file uploads via FormData.
 *
 * @example
 * ```ts
 * import { WiroClient } from 'wiro-ai-sdk';
 *
 * const client = new WiroClient({
 *   apiKey: 'your_key',
 *   apiSecret: 'your_secret'
 * });
 *
 * // Run a model with parameters
 * const runResult = await client.run('wiro', 'professional-headshot', {
 *   background: 'neutral',
 *   outputFormat: 'jpeg',
 *   callbackUrl: 'https://example.com/callback'
 * });
 *
 * // Get task details
 * const taskId = runResult.taskid!;
 * const detail = await client.getTaskDetail({ taskid: taskId });
 * console.log('Task status:', detail.tasklist[0]?.status);
 *
 * // Run a model with file upload
 * const runWithFile = await client.run('wiro', 'polaroid-effect', {
 *   effectType: 'polaroid_smile',
 *   seed: 42,
 * }, [
 *   { name: 'inputImage', file: '/path/to/image.jpg' }
 * ]);
 * ```
 */
export declare class WiroClient {
    private readonly apiKey;
    private readonly apiSecret;
    private readonly baseUrl;
    constructor(options: WiroClientOptions);
    /**
     * Run a Wiro AI model. You must provide the owner (e.g. "wiro") and model slug
     * (e.g. "professional-headshot"). Parameters specific to the model can be passed as
     * an object. Files can optionally be attached; supply them via the `files` array.
     *
     * @param owner - The owner/namespace of the model (e.g., "wiro")
     * @param model - The model slug/name (e.g., "professional-headshot")
     * @param params - Object representing JSON parameters accepted by the model
     * @param files - Optional array of file parameters. Each file will be appended to a
     *                multipart form under its `name` property.
     * @returns Promise resolving to the API response with taskid and socketaccesstoken
     *
     * @example
     * ```ts
     * // Run without files
     * const result = await client.run('wiro', 'professional-headshot', {
     *   inputImageUrl: 'https://example.com/photo.jpg',
     *   background: 'neutral'
     * });
     *
     * // Run with file upload
     * const result = await client.run('wiro', 'polaroid-effect', {
     *   effectType: 'polaroid_smile'
     * }, [
     *   { name: 'inputImage', file: './photo.jpg' }
     * ]);
     * ```
     */
    run<T = any>(owner: string, model: string, params: Record<string, any>, files?: WiroFileParam[]): Promise<RunResponse & {
        data?: T;
    }>;
    /**
     * Retrieve details about one or more tasks. You can supply either a task ID or a
     * socket access token. At least one of these properties must be provided.
     *
     * @param taskInfo - An object containing either a `taskid` or `tasktoken` field
     * @returns Promise resolving to task details including status and outputs
     *
     * @example
     * ```ts
     * // Get task by ID
     * const detail = await client.getTaskDetail({ taskid: '2221' });
     *
     * // Get task by token
     * const detail = await client.getTaskDetail({
     *   tasktoken: 'eDcCm5yyUfIvMFspTwww49OUfgXkQt'
     * });
     *
     * // Check task status
     * const task = detail.tasklist[0];
     * if (task.status === 'task_postprocess_end') {
     *   console.log('Task completed!', task.outputs);
     * }
     * ```
     */
    getTaskDetail<T = any>(taskInfo: TaskDetailRequest): Promise<TaskDetailResponse<T>>;
    /**
     * Kill a running task. Provide either the task ID or the socket access token.
     * Use this to terminate tasks that are currently executing.
     *
     * @param taskInfo - An object containing either `taskid` or `tasktoken`
     * @returns Promise resolving to the kill task response
     *
     * @example
     * ```ts
     * // Kill by task ID
     * await client.killTask({ taskid: '534574' });
     *
     * // Kill by token
     * await client.killTask({
     *   tasktoken: 'ZpYote30on42O4jjHXNiKmrWAZqbRE'
     * });
     * ```
     */
    killTask(taskInfo: KillTaskRequest): Promise<KillTaskResponse>;
    /**
     * Cancel a queued task by its task ID. Use this for tasks that are waiting in the queue
     * and have not started execution yet.
     *
     * @param taskid - The task ID to cancel
     * @returns Promise resolving to the cancel task response
     *
     * @example
     * ```ts
     * await client.cancelTask('634574');
     * ```
     */
    cancelTask(taskid: string): Promise<CancelTaskResponse>;
}
//# sourceMappingURL=client.d.ts.map