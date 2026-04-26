import * as tus from "tus-js-client";
import { getToken } from "./client";

export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export function tusUpload(
  file: File,
  path: string,
  onProgress: (progress: number) => void,
  onComplete: () => void,
  onError: (err: Error) => void
): tus.Upload {
  const token = getToken();
  const encodedPath = encodeURI(path).replace(/#/g, "%23");

  const upload = new tus.Upload(file, {
    endpoint: `/api/tus`,
    retryDelays: [0, 1000, 3000, 5000],
    chunkSize: 10 * 1024 * 1024,
    metadata: {
      filename: file.name,
      filetype: file.type,
    },
    headers: token ? { "X-Auth": token } : {},
    onError: (error) => {
      onError(error instanceof Error ? error : new Error(String(error)));
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
    },
    onSuccess: () => {
      onComplete();
    },
    overridePatchMethod: false,
  });

  (upload as unknown as Record<string, unknown>)["_urlPath"] = encodedPath;

  upload.findPreviousUploads().then((previousUploads) => {
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    upload.start();
  });

  return upload;
}

export async function simpleUpload(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const token = getToken();
  const encodedPath = encodeURI(`${path}/${file.name}`).replace(/#/g, "%23");

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));

    xhr.open("POST", `/api/resources${encodedPath}?override=false`);
    if (token) xhr.setRequestHeader("X-Auth", token);
    xhr.send(file);
  });
}
