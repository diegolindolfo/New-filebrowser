import { apiFetch, apiUrl } from "./client";
import type { ResourceResponse, FileItem, PatchAction } from "../types";

export async function getResource(path: string): Promise<ResourceResponse> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  return apiFetch<ResourceResponse>(`/resources${encoded}`);
}

export async function getFileContent(path: string): Promise<string> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  return apiFetch<string>(`/resources${encoded}`);
}

export async function createResource(
  path: string,
  isDir: boolean
): Promise<void> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  const override = isDir ? "" : "&override=false";
  await apiFetch(`/resources${encoded}?override=false${override}`, {
    method: "POST",
    headers: isDir ? {} : { "Content-Type": "text/plain" },
    body: isDir ? undefined : "",
  });
}

export async function updateResource(
  path: string,
  content: string
): Promise<void> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  await apiFetch(`/resources${encoded}`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: content,
  });
}

export async function deleteResource(path: string): Promise<void> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  await apiFetch(`/resources${encoded}`, { method: "DELETE" });
}

export async function patchResource(
  path: string,
  action: PatchAction
): Promise<void> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  await apiFetch(`/resources${encoded}`, {
    method: "PATCH",
    body: JSON.stringify(action),
  });
}

export async function getChecksum(
  path: string,
  algo: string
): Promise<Record<string, string>> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  return apiFetch(`/resources${encoded}?checksum=${algo}`);
}

export function rawDownloadUrl(path: string): string {
  const encoded = encodeURI(path).replace(/#/g, "%23");
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
  const encoded = encodeURI(path).replace(/#/g, "%23");
  return apiUrl(`/preview/${size}${encoded}`);
}

export async function searchFiles(
  query: string,
  path: string = "/"
): Promise<FileItem[]> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  const res = await apiFetch<FileItem[]>(
    `/search${encoded}?query=${encodeURIComponent(query)}`
  );
  return Array.isArray(res) ? res : [];
}
