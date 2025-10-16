/**
 * Options used to configure the WiroClient.
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
 * a string path (to be read using Bun.file()), a Blob, or a File.
 */
export interface WiroFileParam {
  /**
   * Parameter name for the file. For example `inputImage`.
   */
  name: string;
  /**
   * The file contents or path to the file on disk. If a string is provided the file
   * will be read from the filesystem using Bun.file(); otherwise Blobs and Files are passed through.
   */
  file: string | Blob | File;
  /**
   * Optional filename to send. If omitted and `file` is a string, the basename of the
   * path will be used. If `file` is a Blob or File without a name, a generic name will be generated.
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
 * Represents a single output file from a completed task.
 */
export interface TaskOutput {
  id: string;
  name: string;
  contenttype: string;
  parentid: string;
  uuid: string;
  size: string;
  addedtime: string;
  modifiedtime: string;
  accesskey: string;
  foldercount?: string;
  filecount?: string;
  ispublic?: number;
  expiretime?: string | null;
  url: string;
}

/**
 * Represents a task object returned by the API.
 */
export interface Task {
  id: string;
  uuid: string;
  name?: string;
  socketaccesstoken: string;
  parameters: Record<string, any>;
  debugoutput: string;
  debugerror: string;
  starttime: string;
  endtime: string;
  elapsedseconds: string;
  status: TaskStatus;
  cps?: string;
  totalcost?: string;
  guestid?: string | null;
  projectid?: string;
  modelid?: string;
  description?: string;
  basemodelid?: string;
  runtype?: string;
  modelfolderid?: string;
  modelfileid?: string;
  callbackurl?: string;
  marketplaceid?: string | null;
  createtime: string;
  canceltime: string;
  assigntime: string;
  accepttime: string;
  preprocessstarttime: string;
  preprocessendtime: string;
  postprocessstarttime: string;
  postprocessendtime: string;
  pexit?: string;
  categories?: string;
  outputs: TaskOutput[];
  size: string;
}

/**
 * Possible task statuses returned by the Wiro AI API.
 * 
 * Completed statuses (polling can stop):
 * - task_postprocess_end: Task completed successfully
 * - task_cancel: Task was cancelled
 * 
 * Running statuses (continue polling):
 * - task_queue: Task is waiting in queue
 * - task_accept: Task has been accepted
 * - task_assign: Task is being assigned
 * - task_preprocess_start: Preprocessing is starting
 * - task_preprocess_end: Preprocessing is complete
 * - task_start: Task execution has started
 * - task_output: Output is being generated
 */
export type TaskStatus =
  | 'task_queue'
  | 'task_accept'
  | 'task_assign'
  | 'task_preprocess_start'
  | 'task_preprocess_end'
  | 'task_start'
  | 'task_output'
  | 'task_postprocess_start'
  | 'task_postprocess_end'
  | 'task_cancel';

/**
 * API response returned from Task/Detail endpoint. The generic parameter T can be used to
 * describe the shape of the `tasklist` items. When `taskid` or `tasktoken` is provided the
 * API returns a list with a single task.
 */
export interface TaskDetailResponse<T = Task> {
  total: string;
  errors: any[];
  tasklist: T[];
  result: boolean;
}

/**
 * API response returned from Task/Kill endpoint.
 */
export interface KillTaskResponse {
  errors: any[];
  tasklist: Task[];
  result: boolean;
}

/**
 * API response returned from Task/Cancel endpoint.
 */
export interface CancelTaskResponse {
  errors: any[];
  tasklist: Task[];
  result: boolean;
}

/**
 * Request body for getting task details.
 */
export interface TaskDetailRequest {
  taskid?: string;
  tasktoken?: string;
}

/**
 * Request body for killing a task.
 */
export interface KillTaskRequest {
  taskid?: string;
  tasktoken?: string;
}

/**
 * Request body for cancelling a task.
 */
export interface CancelTaskRequest {
  taskid: string;
}
