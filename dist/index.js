// src/auth.ts
import { createHmac } from "crypto";
function generateAuthHeaders(apiKey, apiSecret) {
  if (!apiKey || apiKey.length < 8) {
    throw new Error("Invalid apiKey: must be at least 8 characters long");
  }
  if (!apiSecret || apiSecret.length < 8) {
    throw new Error("Invalid apiSecret: must be at least 8 characters long");
  }
  const nonce = Math.floor(Date.now() / 1000).toString();
  const message = apiSecret + nonce;
  const hmac = createHmac("sha256", apiKey);
  hmac.update(message);
  const signature = hmac.digest("hex");
  return {
    "x-api-key": apiKey,
    "x-nonce": nonce,
    "x-signature": signature
  };
}

// src/client.ts
class WiroClient {
  apiKey;
  apiSecret;
  baseUrl;
  constructor(options) {
    const { apiKey, apiSecret, baseUrl = "https://api.wiro.ai/v1" } = options;
    if (!apiKey) {
      throw new Error("WiroClient requires an apiKey");
    }
    if (!apiSecret) {
      throw new Error("WiroClient requires an apiSecret");
    }
    if (baseUrl && !baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      throw new Error("Invalid baseUrl: must start with http:// or https://");
    }
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }
  async run(owner, model, params, files) {
    const authHeaders = generateAuthHeaders(this.apiKey, this.apiSecret);
    const url = `${this.baseUrl}/Run/${owner}/${model}`;
    let body;
    let headers;
    if (files && files.length > 0) {
      const form = new FormData;
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value === undefined || value === null)
            continue;
          if (Array.isArray(value)) {
            value.forEach((v) => form.append(key, String(v)));
          } else {
            form.append(key, String(value));
          }
        }
      }
      for (const fileParam of files) {
        let fileData;
        let filename = fileParam.filename;
        if (typeof fileParam.file === "string") {
          try {
            const bunFile = Bun.file(fileParam.file);
            fileData = bunFile;
            if (!filename) {
              const pathParts = fileParam.file.split(/[/\\]/);
              filename = pathParts[pathParts.length - 1] || fileParam.name;
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to read file at "${fileParam.file}": ${errorMsg}`);
          }
        } else {
          fileData = fileParam.file;
          if (!filename) {
            if ("name" in fileData && fileData.name) {
              filename = fileData.name;
            } else {
              filename = `${fileParam.name}.bin`;
            }
          }
        }
        form.append(fileParam.name, fileData, filename);
      }
      body = form;
      headers = { ...authHeaders };
    } else {
      body = JSON.stringify(params);
      headers = {
        ...authHeaders,
        "Content-Type": "application/json"
      };
    }
    const response = await fetch(url, {
      method: "POST",
      headers,
      body
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wiro API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }
  async getTaskDetail(taskInfo) {
    if (!taskInfo.taskid && !taskInfo.tasktoken) {
      throw new Error("getTaskDetail requires either a taskid or a tasktoken");
    }
    const authHeaders = generateAuthHeaders(this.apiKey, this.apiSecret);
    const url = `${this.baseUrl}/Task/Detail`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskInfo)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wiro API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }
  async killTask(taskInfo) {
    if (!taskInfo.taskid && !taskInfo.tasktoken) {
      throw new Error("killTask requires either a taskid or a tasktoken");
    }
    const authHeaders = generateAuthHeaders(this.apiKey, this.apiSecret);
    const url = `${this.baseUrl}/Task/Kill`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taskInfo)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wiro API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }
  async cancelTask(taskid) {
    const authHeaders = generateAuthHeaders(this.apiKey, this.apiSecret);
    const url = `${this.baseUrl}/Task/Cancel`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ taskid })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wiro API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response.json();
  }
}
export {
  generateAuthHeaders,
  WiroClient as default,
  WiroClient
};

//# debugId=D319ED8A1EB299F364756E2164756E21
