import { apiFetch } from "./client";
import type { Share } from "../types";

export async function listShares(): Promise<Share[]> {
  return apiFetch<Share[]>("/shares");
}

export async function getSharesForPath(path: string): Promise<Share[]> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  return apiFetch<Share[]>(`/share${encoded}`);
}

export async function createShare(
  path: string,
  expires?: string,
  password?: string,
  unit?: string
): Promise<Share> {
  const encoded = encodeURI(path).replace(/#/g, "%23");
  const body: Record<string, unknown> = {};
  if (expires) body.expires = expires;
  if (password) body.password = password;
  if (unit) body.unit = unit;
  return apiFetch<Share>(`/share${encoded}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteShare(hash: string): Promise<void> {
  await apiFetch(`/share/${hash}`, { method: "DELETE" });
}
