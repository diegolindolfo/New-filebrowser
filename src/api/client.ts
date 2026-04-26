const API_BASE = "/api";

let authToken: string | null = null;

export function setToken(token: string) {
  authToken = token;
  localStorage.setItem("fb_token", token);
}

export function getToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem("fb_token");
  }
  return authToken;
}

export function clearToken() {
  authToken = null;
  localStorage.removeItem("fb_token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  skipReloadOn401 = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["X-Auth"] = token;
  }
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (!skipReloadOn401) {
      window.location.reload();
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res.text() as unknown as T;
}

export function apiUrl(path: string): string {
  const token = getToken();
  const base = `${API_BASE}${path}`;
  return token ? `${base}${base.includes("?") ? "&" : "?"}auth=${token}` : base;
}

export async function login(
  username: string,
  password: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const token = await res.text();
  setToken(token);
  return token;
}

export async function loginNoAuth(): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    body: "{}",
  });
  if (!res.ok) throw new Error("NoAuth login failed");
  const token = await res.text();
  setToken(token);
  return token;
}

export async function renewToken(): Promise<string> {
  const token = await apiFetch<string>("/renew", { method: "POST" }, true);
  setToken(token);
  return token;
}

export function getUserIdFromToken(): number {
  const token = getToken();
  if (!token) return 1;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.user?.id ?? 1;
  } catch {
    return 1;
  }
}
