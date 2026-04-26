import { apiFetch, apiUrl, encodePath } from "./client";
import type { ResourceResponse, FileItem, PatchAction } from "../types";

export async function getResource(path: string): Promise<ResourceResponse> {
  const encoded = encodePath(path);
  return apiFetch<ResourceResponse>(`/resources${encoded}`);
}

export async function getFileContent(path: string): Promise<string> {
  const encoded = encodePath(path);
  return apiFetch<string>(`/resources${encoded}`);
}

export async function createResource(
  path: string,
  isDir: boolean
): Promise<void> {
  const encoded = encodePath(path);
  await apiFetch(`/resources${encoded}?override=false`, {
    method: "POST",
    headers: isDir ? {} : { "Content-Type": "text/plain" },
    body: isDir ? undefined : "",
  });
}

export async function updateResource(
  path: string,
  content: string
): Promise<void> {
  const encoded = encodePath(path);
  await apiFetch(`/resources${encoded}`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: content,
  });
}

export async function deleteResource(path: string): Promise<void> {
  const encoded = encodePath(path);
  await apiFetch(`/resources${encoded}`, { method: "DELETE" });
}

export async function patchResource(
  path: string,
  action: PatchAction
): Promise<void> {
  const encoded = encodePath(path);
  const params = new URLSearchParams();
  params.set("action", action.action);
  params.set("destination", action.destination);
  if (action.override) params.set("override", "true");
  if (action.rename) params.set("rename", "true");
  await apiFetch(`/resources${encoded}?${params.toString()}`, {
    method: "PATCH",
  });
}

export async function getChecksum(
  path: string,
  algo: string
): Promise<Record<string, string>> {
  const encoded = encodePath(path);
  return apiFetch(`/resources${encoded}?checksum=${algo}`);
}

export function rawDownloadUrl(path: string): string {
  const encoded = encodePath(path);
  return apiUrl(`/raw${encoded}`);
}

export function rawDownloadMultiUrl(
  files: string[],
  algo?: string
): string {
  const params = files.map((f) => `files=${encodeURIComponent(f)}`).join("&");
  const base = apiUrl(`/raw/?${params}`);
  return algo ? `${base}&algo=${algo}` : base;
}

export function previewUrl(
  path: string,
  size: "thumb" | "big" = "thumb"
): string {
  const encoded = encodePath(path);
  return apiUrl(`/preview/${size}${encoded}`);
}

export async function searchFiles(
  query: string,
  path: string = "/"
): Promise<FileItem[]> {
  const encoded = encodePath(path);
  const res = await apiFetch<FileItem[]>(
    `/search${encoded}?query=${encodeURIComponent(query)}`
  );
  return Array.isArray(res) ? res : [];
}
