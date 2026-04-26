import { apiFetch } from "./client";
import type { User } from "../types";

export async function listUsers(): Promise<User[]> {
  return apiFetch<User[]>("/users");
}

export async function getUser(id: number): Promise<User> {
  return apiFetch<User>(`/users/${id}`);
}

export async function createUser(
  data: Partial<User> & { username: string; password: string }
): Promise<void> {
  await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify({
      what: "user",
      which: [],
      data: {
        scope: ".",
        hideDotfiles: true,
        ...data,
      },
    }),
  });
}

export async function updateUser(
  id: number,
  data: Partial<User>,
  which?: string[]
): Promise<void> {
  await apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      what: "user",
      which: which || ["all"],
      data,
    }),
  });
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
}
