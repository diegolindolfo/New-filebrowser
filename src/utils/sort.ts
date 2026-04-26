import type { FileItem, SortConfig } from "../types";

export function sortItems(items: FileItem[], config: SortConfig): FileItem[] {
  const dirs = items.filter((i) => i.isDir);
  const files = items.filter((i) => !i.isDir);

  const compare = (a: FileItem, b: FileItem): number => {
    let result: number;
    switch (config.by) {
      case "name":
        result = a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        break;
      case "size":
        result = a.size - b.size;
        break;
      case "modified":
        result =
          new Date(a.modified).getTime() - new Date(b.modified).getTime();
        break;
      default:
        result = a.name.localeCompare(b.name);
    }
    return config.asc ? result : -result;
  };

  dirs.sort(compare);
  files.sort(compare);

  return [...dirs, ...files];
}
