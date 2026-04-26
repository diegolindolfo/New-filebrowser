import { apiFetch } from "./client";
import type { Settings } from "../types";

export async function getSettings(): Promise<Settings> {
  return apiFetch<Settings>("/settings");
}

export async function updateSettings(data: Partial<Settings>): Promise<void> {
  await apiFetch("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
