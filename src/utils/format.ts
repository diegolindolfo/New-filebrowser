export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function getFileIcon(item: {
  isDir: boolean;
  type: string;
  extension: string;
  name: string;
}): string {
  if (item.isDir) return "folder";
  const ext = item.extension.toLowerCase().replace(".", "");
  const type = item.type;

  if (type === "image" || ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(ext))
    return "image";
  if (type === "video" || ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv"].includes(ext))
    return "video";
  if (type === "audio" || ["mp3", "flac", "wav", "ogg", "aac", "m4a", "wma"].includes(ext))
    return "audio";
  if (["pdf"].includes(ext)) return "pdf";
  if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(ext))
    return "archive";
  if (["doc", "docx", "odt", "rtf"].includes(ext)) return "doc";
  if (["xls", "xlsx", "ods", "csv"].includes(ext)) return "spreadsheet";
  if (["ppt", "pptx", "odp"].includes(ext)) return "presentation";
  if (
    type === "text" ||
    [
      "txt", "md", "json", "yaml", "yml", "xml", "html", "css", "js",
      "ts", "tsx", "jsx", "py", "go", "rs", "java", "c", "cpp", "h",
      "sh", "bash", "zsh", "env", "conf", "ini", "toml", "cfg",
      "log", "sql", "graphql", "proto",
    ].includes(ext)
  )
    return "text";
  return "file";
}

export function isEditable(extension: string): boolean {
  const ext = extension.toLowerCase().replace(".", "");
  return [
    "txt", "md", "json", "yaml", "yml", "xml", "html", "css", "js",
    "ts", "tsx", "jsx", "py", "go", "rs", "java", "c", "cpp", "h",
    "sh", "bash", "zsh", "env", "conf", "ini", "toml", "cfg",
    "log", "sql", "graphql", "proto", "makefile", "dockerfile",
    "gitignore", "editorconfig",
  ].includes(ext);
}

export function isPreviewable(type: string, extension: string): boolean {
  const ext = extension.toLowerCase().replace(".", "");
  if (["image", "video", "audio"].includes(type)) return true;
  if (ext === "pdf") return true;
  if (isEditable(extension)) return true;
  return false;
}

export function getLanguage(extension: string): string {
  const ext = extension.toLowerCase().replace(".", "");
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "javascript",
    tsx: "javascript",
    py: "python",
    html: "html",
    htm: "html",
    css: "css",
    scss: "css",
    less: "css",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    svg: "xml",
    md: "markdown",
    markdown: "markdown",
  };
  return map[ext] || "text";
}
