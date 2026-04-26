export interface FileItem {
  path: string;
  name: string;
  size: number;
  extension: string;
  modified: string;
  mode: number;
  isDir: boolean;
  isSymlink: boolean;
  type: string;
  subtitles?: string[];
  content?: string;
  checksums?: Record<string, string>;
  token?: string;
}

export interface ResourceResponse {
  items: FileItem[];
  numDirs: number;
  numFiles: number;
  sorting: SortConfig;
  path: string;
  name: string;
  size: number;
  extension: string;
  modified: string;
  mode: number;
  isDir: boolean;
  isSymlink: boolean;
  type: string;
}

export interface SortConfig {
  by: string;
  asc: boolean;
}

export interface User {
  id: number;
  username: string;
  password: string;
  scope: string;
  locale: string;
  lockPassword: boolean;
  viewMode: string;
  singleClick: boolean;
  redirectAfterCopyMove: boolean;
  perm: Permissions;
  commands: string[];
  sorting: SortConfig;
  rules: Rule[];
  hideDotfiles: boolean;
  dateFormat: boolean;
  aceEditorTheme: string;
}

export interface Permissions {
  admin: boolean;
  execute: boolean;
  create: boolean;
  rename: boolean;
  modify: boolean;
  delete: boolean;
  share: boolean;
  download: boolean;
}

export interface Rule {
  regex: boolean;
  allow: boolean;
  path: string;
}

export interface Share {
  hash: string;
  path: string;
  userID: number;
  expire: number;
  passwordHash: string;
  token: string;
}

export interface Settings {
  signup: boolean;
  hideLoginButton: boolean;
  createUserDir: boolean;
  minimumPasswordLength: number;
  userHomeBasePath: string;
  defaults: User;
  authMethod: string;
  rules: Rule[];
  branding: Branding;
  tus: TusSettings;
  shell: string[];
  commands: Record<string, string[]>;
}

export interface Branding {
  name: string;
  disableExternal: boolean;
  disableUsedPercentage: boolean;
  files: string;
  theme: string;
  color: string;
}

export interface TusSettings {
  chunkSize: number;
  retryCount: number;
}

export type ViewMode = "list" | "grid";

export interface SearchResult {
  items: FileItem[];
}

export interface PatchAction {
  action: "copy" | "rename";
  destination: string;
  override: boolean;
  rename: boolean;
}
